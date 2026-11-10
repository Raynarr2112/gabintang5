# 📘 Panduan Penggunaan Website Pre-Order GABINTANG5

Selamat datang di panduan resmi pengelolaan sistem pemesanan **GABINTANG5 (Artisan Gabin Ice Cream)**. Dokumen ini disusun dengan bahasa yang sederhana agar mudah dipahami dan digunakan sehari-hari oleh tim Admin/Owner.

---

## 🔗 1. Daftar Link Penting (Akses 24 Jam)

Website ini berjalan secara *cloud* 24 jam nonstop dan dapat diakses dari **HP (Android/iPhone), Tablet, maupun Laptop**:

| Kegunaan | Link Akses | Keterangan |
| :--- | :--- | :--- |
| **Halaman Pembeli (Konsumen)** | `https://gabintang5.vercel.app` | Taruh link ini di **Bio Instagram / TikTok / Status WhatsApp** agar pembeli bisa memesan. |
| **Halaman Admin (Owner / Kasir)** | `https://gabintang5.vercel.app/admin` | Halaman khusus Admin untuk memantau pesanan, cek bukti bayar, & atur stok. |
| **PIN Keamanan Admin** | **`1234`** *(Default)* | Bisa diubah kapan saja melalui ikon kunci (🔑) di pojok kanan atas halaman Admin. |
| **Nomor WhatsApp Admin** | **`081223997778`** | Nomor penerima pesan konfirmasi pesanan otomatis dari konsumen. |

> **Tips Simpan di Layar Utama HP (Seperti Aplikasi):**
> Buka link `/admin` di browser HP (Chrome/Safari) -> klik menu titik tiga di pojok kanan atas -> pilih **"Tambahkan ke Layar Utama" (Add to Home Screen)**.

---

## 🍦 2. Alur Pemesanan dari Sisi Pembeli (Konsumen)

Aplikasi ini mendukung **2 Mode Pemesanan Sekaligus (Hybrid Mode)**:

1. **⚡ Beli Langsung di Booth (Ambil Sekarang):**
   - Khusus untuk pembeli yang datang langsung ke meja booth (misal saat bazar / event kampus).
   - Pembeli scan QR di meja -> jawab 6 pertanyaan Mood Quiz -> pilih **"⚡ Beli di Booth"**.
   - Pesanan langsung masuk ke layar barista detik itu juga.
   - Pembayaran fleksibel: bisa **Tunai di Kasir** atau **Scan QRIS** (upload bukti transfer opsional agar antrean di kasir tetap cepat).
   - E-Ticket berwarna hijau bertuliskan **`BELI DI BOOTH`** dengan status antrean langsung (*Live Queue*).

2. **📅 Pre-Order (PO Mingguan — Senin / Selasa):**
   - Khusus untuk pembeli online yang memesan dari rumah untuk jadwal pengantaran minggu depan (**Open PO Rabu–Jumat, Produksi Sabtu**).
   - Pembeli wajib memilih hari penerimaan: **📅 Hari Senin** atau **🗓️ Hari Selasa**.
   - Khusus pembayaran QRIS PO, pembeli **wajib melampirkan screenshot bukti transfer** untuk mengunci kuota porsi.

3. **Mood Quiz & Kustomisasi Topping:**
   - Pembeli menjawab 6 pertanyaan singkat untuk menentukan varian es krim (*Yoghurt, Strawberry, Coklat, Matcha, Mangga*).
   - Pembeli dapat menambah topping (*Topping Tabur +Rp 2.000, Buah +Rp 3.000, Selai +Rp 1.000*).
   - Di akhir pemesanan, pembeli bisa mencetak kartu Polaroid estetik dan mengabari Admin via tombol WhatsApp otomatis tanpa perlu ketik manual.

---

## 🛠️ 3. Panduan Halaman Admin (`/admin`)

Saat membuka `https://gabintang5.vercel.app/admin` dan memasukkan PIN **`1234`**, Admin memiliki seluruh kendali operasional booth & pre-order:

### A. Saklar Buka / Tutup Beli di Booth (Kontrol Utama)
Di baris menu atas terdapat tombol saklar instan:
- 🟢 **`⚡ Booth: Buka`** : Aktifkan mode ini saat booth sedang buka / ada bazar. Pembeli di web bisa memilih Beli Langsung di Booth maupun Pre-Order.
- ⚪ **`Booth: Tutup (Khusus PO)`** : Klik tombol ini saat booth sedang tutup atau stok harian habis. Pilihan Beli Langsung di HP konsumen otomatis terkunci (*Tutup*) dan konsumen hanya bisa memesan Pre-Order.
*(Pengaturan ini otomatis tersinkronisasi ke seluruh HP pembeli dalam 5 detik lewat Google Sheets).*

### B. Ringkasan Omzet & Rekap Kategori Pesanan
Di dashboard Admin terdapat kartu statistik Bento:
- **Total Omzet & Unduh Excel:** Menampilkan total uang masuk dari seluruh pesanan dan tombol unduh rekap laporan Excel (`.xlsx`).
- **⚡ Beli di Booth:** Jumlah porsi pesanan langsung yang harus disiapkan saat ini di booth.
- **📅 PO Hari Senin:** Jumlah porsi pesanan Pre-Order untuk pengantaran hari Senin.
- **🗓️ PO Hari Selasa:** Jumlah porsi pesanan Pre-Order untuk pengantaran hari Selasa.
- **Tombol Filter Cepat:** Klik `Semua`, `⚡ Booth`, `📅 Senin`, atau `🗓️ Selasa` untuk menyaring tampilan kartu pesanan sesuai kebutuhan barista.

### C. Tombol Pengaturan Toko (Baris Atas)
1. **⚡ Saklar Booth:** Membuka / menutup pesanan langsung di kasir booth.
2. **📸 QRIS Toko:** Mengganti barcode QRIS, mengubah nama merchant toko, atau mengganti nomor WhatsApp Admin penerima konfirmasi.
3. **🗓️ Atur PO:** Mengaktifkan status Open PO, mengubah teks jadwal, serta mengatur **batas kuota maksimal porsi** Hari Senin & Selasa (default: masing-masing 50 porsi).
4. **📦 Kelola Stok:** Menandai varian rasa atau topping yang sedang **Habis (Sold Out)**. Jika ditandai habis, item tersebut otomatis terkunci di halaman pembeli.
5. **🔔 Bel Aktif / Mute:** Membunyikan nada dering lonceng kasir setiap kali ada pesanan baru masuk dari pembeli.

### D. Memproses Pesanan Masuk
Setiap kartu pesanan memiliki pembeda jelas:
- Pesanan Booth memiliki label hijau **`⚡ Beli Langsung di Booth — Ambil Sekarang`**.
- Pesanan PO memiliki label krem **`🗓️ Pre-Order: Hari Senin / Selasa (Produksi Sabtu)`**.

Langkah barista:
1. **Cek Pembayaran:**
   - QRIS: Klik **"📷 Cek Bukti"** (jika ada foto terlampir) lalu klik **"✓ Lunas QRIS"**.
   - Tunai: Klik **"💵 Terima Tunai"** (tersedia kalkulator kembalian uang kasir).
2. **Ubah Status Produksi:**
   - Klik **"▶ Mulai Buat"** saat meracik pesanan (status berubah menjadi *Diproses*).
   - Klik **"✓ Selesai"** atau **"💬 Selesai & WA"** saat es krim siap diserahkan. Tombol **"Selesai & WA"** akan membuka WhatsApp ke pembeli dengan pesan ramah otomatis tanpa emote yang rusak.

---

## 📊 4. Integrasi Google Spreadsheet Otomatis (2-Arah)

Website ini sudah terhubung langsung secara otomatis dengan **Google Spreadsheet GABINTANG5**:
- **Otomatis Tercatat:** Setiap kali pembeli membuat pesanan dari HP mereka, data langsung masuk ke baris baru di Google Spreadsheet (lengkap dengan Waktu, Kode Antrean, Nama, No. WhatsApp, Hari PO Senin/Selasa, Varian Rasa, Topping, Total Harga, dan Status).
- **Sinkronisasi ke Admin Tanpa Refresh:** Halaman `/admin` akan membaca data dari Google Spreadsheet secara otomatis setiap 5 detik.
- **Update & Hapus Otomatis:** Jika Admin mengubah status pesanan menjadi *Lunas / Diproses / Selesai* atau menghapus pesanan di halaman `/admin`, data di Google Spreadsheet juga ikut ter-update otomatis.

