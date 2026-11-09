/**
 * =====================================================================
 * ScoopMatch: Google Sheets Smart Sync Script
 * Versi 4.0: Lengkap (Data Pembeli, Pesanan, Sesi Pre-Order, Update Status & Test Koneksi)
 * =====================================================================
 * 
 * CARA MEMASANG / MEMPERBARUI SCRIPT DI GOOGLE SHEETS:
 * 1. Buka Google Spreadsheet Anda di browser.
 * 2. Klik menu "Extensions" (Ekstensi) > "Apps Script".
 * 3. Hapus seluruh kode yang ada di editor (misal `function myFunction() {}`), lalu PASTE seluruh kode ini.
 * 4. Klik ikon Save (Simpan / Ctrl+S).
 * 5. Klik tombol "Deploy" (Terapkan) di kanan atas > pilih "New deployment" (Penerapan baru) 
 *    (Atau jika memperbarui: "Manage deployments" > klik ikon Pensil/Edit > pilih Version: "New version").
 * 6. Pada "Select type" (Pilih jenis), klik ikon roda gigi > pilih "Web app" (Aplikasi web).
 * 7. Isi pengaturan berikut:
 *    - Description: ScoopMatch Order Sync
 *    - Execute as (Jalankan sebagai): "Me" (Saya / email Anda)
 *    - Who has access (Siapa yang memiliki akses): WAJIB pilih "Anyone" (Siapa saja)
 * 8. Klik "Deploy" (Terapkan) > Berikan izin akses (Authorize access -> Advanced -> Go to project (unsafe) -> Allow).
 * 9. Salin (Copy) "Web app URL" (berakhiran `/exec`), lalu tempel ke menu "Setup Cloud" di Panel Admin ScoopMatch!
 */

var DEFAULT_HEADERS = [
  "Waktu Transaksi",
  "No Antrean",
  "Nama Pembeli",
  "No WhatsApp",
  "Tipe Pesanan",
  "Sesi Pre-Order",
  "Varian Rasa",
  "Wadah",
  "Ukuran",
  "Topping",
  "Catatan",
  "Total Harga (Rp)",
  "Metode Bayar",
  "Status Bayar",
  "Bukti Bayar",
  "Status Pesanan"
];

/**
 * Menangani pembukaan URL Web App & pembacaan data antrean 2-arah (Two-Way Sync) tanpa Supabase
 */
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return jsonResponse({
        status: "online",
        app: "GABINTANG5 Google Sheets Two-Way Sync v5.0",
        orders: []
      });
    }

    var lastCol = Math.max(sheet.getLastColumn(), DEFAULT_HEADERS.length);
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var colMap = buildColumnMap(headers, lastCol);

    var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    var orders = [];

    for (var r = values.length - 1; r >= 0; r--) {
      var row = values[r];
      var orderCode = colMap.orderCode ? (row[colMap.orderCode - 1] || "").toString().trim() : "";
      if (!orderCode) continue;

      var rawPhone = colMap.phone ? (row[colMap.phone - 1] || "").toString().replace(/^'/, "").trim() : "";
      if (rawPhone === "-") rawPhone = "";

      var rawPoSession = colMap.poSession ? (row[colMap.poSession - 1] || "").toString().trim() : "";
      var poSessionName = "Hari Senin";
      var poSessionId = "hari-senin";
      if (rawPoSession.toLowerCase().indexOf("selasa") !== -1) {
        poSessionName = "Hari Selasa";
        poSessionId = "hari-selasa";
      } else if (rawPoSession && rawPoSession !== "-") {
        poSessionName = rawPoSession.split("(")[0].trim();
      }

      var rawPayStatus = colMap.paymentStatus ? (row[colMap.paymentStatus - 1] || "").toString().toLowerCase() : "";
      var paymentStatus = rawPayStatus.indexOf("lunas") !== -1 || rawPayStatus === "paid" ? "paid" : "unpaid";

      var rawPayMethod = colMap.paymentMethod ? (row[colMap.paymentMethod - 1] || "").toString().toLowerCase() : "qris";
      var paymentMethod = rawPayMethod.indexOf("cash") !== -1 || rawPayMethod.indexOf("tunai") !== -1 ? "cash" : "qris";

      var rawOrderStatus = colMap.orderStatus ? (row[colMap.orderStatus - 1] || "").toString().toLowerCase() : "";
      var status = "pending";
      if (rawOrderStatus.indexOf("selesai") !== -1 || rawOrderStatus.indexOf("siap") !== -1) {
        status = "selesai";
      } else if (rawOrderStatus.indexOf("proses") !== -1 || rawOrderStatus.indexOf("buat") !== -1) {
        status = "diproses";
      }

      orders.push({
        order_code: orderCode,
        customer_name: colMap.name ? (row[colMap.name - 1] || "Pelanggan").toString() : "Pelanggan",
        customer_phone: rawPhone,
        order_type: "po",
        po_session_id: poSessionId,
        po_session_name: poSessionName,
        flavor_name: colMap.flavor ? (row[colMap.flavor - 1] || "Coklat").toString() : "Coklat",
        serving: colMap.serving ? (row[colMap.serving - 1] || "gabin-original").toString() : "gabin-original",
        size: colMap.size ? (row[colMap.size - 1] || "single").toString() : "single",
        toppings_text: colMap.topping ? (row[colMap.topping - 1] || "").toString() : "",
        notes: colMap.notes && row[colMap.notes - 1] !== "-" ? (row[colMap.notes - 1] || "").toString() : "",
        total_price: colMap.price ? Number(row[colMap.price - 1]) || 9000 : 9000,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        has_proof: colMap.hasProof ? (row[colMap.hasProof - 1] || "").toString() : "",
        status: status,
        time_str: colMap.time ? (row[colMap.time - 1] || "").toString() : ""
      });
    }

    return jsonResponse({
      status: "online",
      app: "GABINTANG5 Google Sheets Two-Way Sync v5.0",
      orders: orders
    });
  } catch (err) {
    return jsonResponse({
      status: "error",
      message: err.toString(),
      orders: []
    });
  }
}

/**
 * Menangani pengiriman data pesanan baru, update status, penghapusan, dan tes koneksi dari aplikasi ScoopMatch
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rawContents = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    var data = JSON.parse(rawContents);

    // 1. Jika sheet masih kosong, buat baris Header otomatis beserta desain warnanya
    if (sheet.getLastRow() === 0) {
      setupHeaderRow(sheet);
    }

    // 2. Jika ini adalah aksi tes koneksi dari tombol "Tes Koneksi" di Admin Panel
    if (data.action === "test_connection") {
      return jsonResponse({
        status: "success",
        action: "test_connection",
        message: "Koneksi ke Google Sheets berhasil!"
      });
    }

    // 3. Petakan posisi kolom secara dinamis berdasarkan nama header di Baris 1
    var lastCol = Math.max(sheet.getLastColumn(), DEFAULT_HEADERS.length);
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var colMap = buildColumnMap(headers, lastCol);

    // 4. Format tampilan status agar rapi & mudah dibaca di tabel
    var cleanOrderStatus = formatOrderStatus(data.status);
    var cleanPayStatus = data.payment_status === "paid" ? "Lunas" : "Belum Bayar";
    var cleanPayMethod = (data.payment_method || "QRIS").toString().toUpperCase();
    var cleanOrderType = data.order_type === "po" ? "Pre-Order VIP" : "Booth Reguler";
    var cleanPoSession = data.order_type === "po"
      ? ((data.po_session_name || "Sesi PO") + (data.po_time_range ? " (" + data.po_time_range + ")" : ""))
      : "-";

    // 5. Cari apakah No Antrean (order_code) sudah ada di spreadsheet
    var lastRow = sheet.getLastRow();
    var existingRow = findRowByOrderCode(sheet, lastRow, colMap.orderCode, data.order_code);

    // 6A. Jika aksi adalah hapus pesanan (delete_order) atau bersihkan semua (clear_all)
    if (data.action === "clear_all") {
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      return jsonResponse({ status: "success", action: "cleared_all" });
    }

    if (data.action === "delete_order") {
      if (existingRow > 0) {
        sheet.deleteRow(existingRow);
        return jsonResponse({ status: "success", action: "deleted", row: existingRow });
      }
      return jsonResponse({ status: "not_found", action: "delete_order" });
    }

    // 6B. Jika pesanan sudah ada di baris sebelumnya -> Update statusnya saja tanpa membuat baris ganda
    if (existingRow > 0) {
      if (colMap.orderStatus && data.status) {
        sheet.getRange(existingRow, colMap.orderStatus).setValue(cleanOrderStatus);
      }
      if (colMap.paymentStatus && data.payment_status) {
        sheet.getRange(existingRow, colMap.paymentStatus).setValue(cleanPayStatus);
      }
      if (colMap.paymentMethod && data.payment_method) {
        sheet.getRange(existingRow, colMap.paymentMethod).setValue(cleanPayMethod);
      }
      if (colMap.hasProof && data.has_proof) {
        sheet.getRange(existingRow, colMap.hasProof).setValue(data.has_proof);
      }

      return jsonResponse({
        status: "success",
        action: "updated",
        row: existingRow
      });
    }

    // 6C. Jika hanya request update_status tapi nomor antrean belum ditemukan, jangan buat baris kosong
    if (data.action === "update_status") {
      return jsonResponse({
        status: "skipped",
        message: "Order code tidak ditemukan untuk update status"
      });
    }

    // 7. SIMPAN DATA PEMBELI BARU: Susun baris sesuai urutan kolom di sheet
    var totalCols = Math.max(sheet.getLastColumn(), DEFAULT_HEADERS.length);
    var newRow = new Array(totalCols);
    for (var i = 0; i < totalCols; i++) {
      newRow[i] = "-";
    }

    var dateObj = data.timestamp ? new Date(data.timestamp) : new Date();
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date();
    }
    var formattedDate = Utilities.formatDate(dateObj, "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss");

    // Pastikan nomor telepon diawali tanda kutip satu (') agar angka 0 di depan tidak hilang di Google Sheets
    var safePhone = data.customer_phone ? "'" + data.customer_phone.toString().trim() : "-";

    if (colMap.time) newRow[colMap.time - 1] = formattedDate;
    if (colMap.orderCode) newRow[colMap.orderCode - 1] = data.order_code || "-";
    if (colMap.name) newRow[colMap.name - 1] = data.customer_name || "Pelanggan";
    if (colMap.phone) newRow[colMap.phone - 1] = safePhone;
    if (colMap.orderType) newRow[colMap.orderType - 1] = cleanOrderType;
    if (colMap.poSession) newRow[colMap.poSession - 1] = cleanPoSession;
    if (colMap.flavor) newRow[colMap.flavor - 1] = data.flavor_name || "-";
    if (colMap.serving) newRow[colMap.serving - 1] = data.serving || "-";
    if (colMap.size) newRow[colMap.size - 1] = data.size || "-";
    if (colMap.topping) newRow[colMap.topping - 1] = data.toppings || "-";
    if (colMap.notes) newRow[colMap.notes - 1] = data.notes || "-";
    if (colMap.price) newRow[colMap.price - 1] = Number(data.total_price) || 0;
    if (colMap.paymentMethod) newRow[colMap.paymentMethod - 1] = cleanPayMethod;
    if (colMap.paymentStatus) newRow[colMap.paymentStatus - 1] = cleanPayStatus;
    if (colMap.hasProof) newRow[colMap.hasProof - 1] = data.has_proof || "TIDAK";
    if (colMap.orderStatus) newRow[colMap.orderStatus - 1] = cleanOrderStatus;

    sheet.appendRow(newRow);

    // Format angka Rupiah pada kolom harga di baris yang baru ditambahkan
    var insertedRowIndex = sheet.getLastRow();
    if (colMap.price) {
      sheet.getRange(insertedRowIndex, colMap.price).setNumberFormat("#,##0");
    }

    return jsonResponse({
      status: "success",
      action: "inserted",
      row: insertedRowIndex
    });

  } catch (error) {
    return jsonResponse({
      status: "error",
      message: error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Membuat header standar dengan warna tema ScoopMatch
 */
function setupHeaderRow(sheet) {
  sheet.appendRow(DEFAULT_HEADERS);
  var headerRange = sheet.getRange(1, 1, 1, DEFAULT_HEADERS.length);
  headerRange.setBackground("#F43F5E");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

/**
 * Memetakan nama kolom di baris pertama agar fleksibel meskipun urutan kolom diubah pengguna
 */
function buildColumnMap(headers, lastCol) {
  var colMap = {};
  for (var c = 0; c < headers.length; c++) {
    var h = (headers[c] || "").toString().toLowerCase().trim();
    if (!h) continue;

    if (h.indexOf("waktu") !== -1 || h.indexOf("tanggal") !== -1 || h.indexOf("timestamp") !== -1) {
      colMap.time = c + 1;
    } else if (h.indexOf("antrean") !== -1 || h.indexOf("kode") !== -1 || h === "order id" || h === "no order") {
      colMap.orderCode = c + 1;
    } else if (h.indexOf("nama") !== -1 || h.indexOf("pembeli") !== -1 || h.indexOf("pelanggan") !== -1) {
      colMap.name = c + 1;
    } else if (h.indexOf("wadah") !== -1 || h.indexOf("serving") !== -1) {
      colMap.serving = c + 1;
    } else if (h.indexOf("whatsapp") !== -1 || h === "no wa" || h === "no. wa" || h.indexOf("nomor wa") !== -1 || h.indexOf("hp") !== -1 || h.indexOf("telepon") !== -1) {
      colMap.phone = c + 1;
    } else if (h.indexOf("tipe") !== -1 || h.indexOf("jenis pesanan") !== -1) {
      colMap.orderType = c + 1;
    } else if (h.indexOf("sesi") !== -1 || h.indexOf("pre-order") !== -1 || h.indexOf("po") !== -1) {
      colMap.poSession = c + 1;
    } else if (h.indexOf("rasa") !== -1 || h.indexOf("varian") !== -1 || h.indexOf("flavor") !== -1) {
      colMap.flavor = c + 1;
    } else if (h.indexOf("ukuran") !== -1 || h.indexOf("size") !== -1) {
      colMap.size = c + 1;
    } else if (h.indexOf("topping") !== -1) {
      colMap.topping = c + 1;
    } else if (h.indexOf("catatan") !== -1 || h.indexOf("notes") !== -1) {
      colMap.notes = c + 1;
    } else if (h.indexOf("total") !== -1 || h.indexOf("harga") !== -1) {
      colMap.price = c + 1;
    } else if (h.indexOf("metode") !== -1) {
      colMap.paymentMethod = c + 1;
    } else if (h.indexOf("status bayar") !== -1 || h.indexOf("pembayaran") !== -1) {
      colMap.paymentStatus = c + 1;
    } else if (h.indexOf("bukti") !== -1) {
      colMap.hasProof = c + 1;
    } else if (h.indexOf("status") !== -1) {
      colMap.orderStatus = c + 1;
    }
  }

  // Fallback jika pengguna menggunakan sheet dengan header kustom yang tidak terdeteksi
  if (!colMap.time) colMap.time = 1;
  if (!colMap.orderCode) colMap.orderCode = 2;
  if (!colMap.name) colMap.name = 3;
  if (!colMap.orderStatus) colMap.orderStatus = lastCol;

  return colMap;
}

/**
 * Mencari nomor baris berdasarkan Kode Antrean (misal #SCOOP-108)
 */
function findRowByOrderCode(sheet, lastRow, orderCodeCol, orderCode) {
  if (lastRow <= 1 || !orderCode || !orderCodeCol) return -1;
  var codes = sheet.getRange(2, orderCodeCol, lastRow - 1, 1).getValues();
  var target = orderCode.toString().trim().toUpperCase();
  for (var r = 0; r < codes.length; r++) {
    if (codes[r][0] && codes[r][0].toString().trim().toUpperCase() === target) {
      return r + 2;
    }
  }
  return -1;
}

/**
 * Mengubah kode status internal menjadi label Bahasa Indonesia yang rapi
 */
function formatOrderStatus(status) {
  if (status === "selesai") return "Selesai";
  if (status === "diproses") return "Diproses";
  return "Menunggu";
}

/**
 * Helper membuat output JSON
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

