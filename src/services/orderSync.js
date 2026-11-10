import { getSupabaseClient } from './supabase';
import { TOPPINGS, SIZE_OPTIONS, SERVING_OPTIONS } from '../data/flavors';

const SHEETS_CONFIG_KEY = 'scoopmatch_sheets_webhook_url';
const DEFAULT_SHEETS_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycbzLV2CJxTOTA-os1QfUHOWvd4loczkliL7QmqHh9HQbHeOJagnis1GUVsIao6u5qhgI0w/exec';

export const SYSTEM_CONFIG_ORDER_CODE = '__SYSTEM_CONFIG__';

export function getGoogleSheetsWebhookUrl() {
  const envUrl = import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK_URL;
  if (envUrl && /^https?:\/\//i.test(envUrl.trim())) return envUrl.trim();
  try {
    const saved = (localStorage.getItem(SHEETS_CONFIG_KEY) || '').trim();
    if (/^https?:\/\//i.test(saved)) return saved;
  } catch {
    // ignore
  }
  return DEFAULT_SHEETS_WEBHOOK_URL;
}

export function setGoogleSheetsWebhookUrl(url) {
  try {
    const clean = (url || '').trim();
    if (clean && /^https?:\/\//i.test(clean)) {
      localStorage.setItem(SHEETS_CONFIG_KEY, clean);
    } else {
      localStorage.removeItem(SHEETS_CONFIG_KEY);
    }
  } catch (e) {
    console.error('Failed to save webhook URL', e);
  }
}

export async function testGoogleSheetsConnection(customUrl) {
  const webhookUrl = (customUrl || getGoogleSheetsWebhookUrl()).trim();
  if (!webhookUrl || !/^https?:\/\//i.test(webhookUrl)) {
    return { ok: false, message: 'URL Webhook tidak valid (harus diawali https://)' };
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'test_connection', timestamp: new Date().toISOString() }),
      mode: 'no-cors',
    });
    return { ok: true, message: 'Permintaan tes berhasil dikirim ke Google Sheets!' };
  } catch (err) {
    console.error('Failed to test Google Sheets connection:', err);
    return { ok: false, message: 'Gagal menghubungi URL Webhook. Pastikan internet aktif dan URL benar.' };
  }
}

// Convert app order structure to flat database & sheets row
export function formatOrderForExport(order) {
  const sizeObj = SIZE_OPTIONS.find(s => s.id === order.size);
  const servingObj = SERVING_OPTIONS.find(s => s.id === order.serving);
  const toppingsFormatted = (order.toppings || [])
    .map(tid => {
      const t = TOPPINGS.find(item => item.id === tid);
      return t ? t.name : tid;
    })
    .join(', ') || '-';

  return {
    order_code: order.orderId,
    customer_name: order.customerName,
    customer_phone: order.customerPhone || '',
    order_type: order.orderType || 'regular',
    po_session_name: order.poSessionName || '',
    po_time_range: order.poTimeRange || '',
    payment_method: order.paymentMethod || 'qris',
    payment_status: order.paymentStatus || 'unpaid',
    has_proof: order.proofImageUrl ? 'YA' : 'TIDAK',
    notes: order.notes || '',
    flavor_id: order.flavor?.id || '',
    flavor_name: order.secondFlavor
      ? `${order.flavor?.name || ''} + ${order.secondFlavor?.name || ''}`
      : (order.flavor?.name || ''),
    serving: servingObj?.name || order.serving,
    size: sizeObj?.name || order.size,
    toppings: toppingsFormatted,
    total_price: order.totalPrice,
    status: order.status || 'pending',
    timestamp: new Date(order.timestamp).toISOString(),
  };
}

// 1. Send order to Google Sheets Webhook (Free Google Apps Script)
export async function sendOrderToGoogleSheets(order) {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) return false;

  const payload = formatOrderForExport(order);

  try {
    // Mode no-cors avoids CORS restriction on Google Apps Script redirects
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });
    return true;
  } catch (err) {
    console.error('Failed to sync to Google Sheets:', err);
    return false;
  }
}

// 1b. Update order status in Google Sheets Webhook
export async function updateOrderStatusInGoogleSheets({ orderCode, status, paymentStatus, paymentMethod, hasProof }) {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) return false;

  const payload = {
    action: 'update_status',
    order_code: orderCode,
    status: status,
    payment_status: paymentStatus || '',
    payment_method: paymentMethod || '',
    has_proof: hasProof || '',
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });
    return true;
  } catch (err) {
    console.error('Failed to sync status update to Google Sheets:', err);
    return false;
  }
}

// 1c. Delete order in Google Sheets Webhook
export async function deleteOrderInGoogleSheets(orderCode) {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) return false;

  const payload = {
    action: 'delete_order',
    order_code: orderCode,
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });
    return true;
  } catch (err) {
    console.error('Failed to sync delete order to Google Sheets:', err);
    return false;
  }
}

// 1d. Fetch all orders from Google Sheets Webhook (Two-Way Sync without Supabase)
export async function fetchOrdersFromGoogleSheets() {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) return null;

  try {
    const response = await fetch(`${webhookUrl}?action=get_orders&t=${Date.now()}`, {
      method: 'GET',
      redirect: 'follow',
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data && Array.isArray(data.orders)) {
      return data.orders;
    }
    return null;
  } catch {
    return null;
  }
}

// 1e. Sync Global Store Config (Booth Open/Close, PO Open/Close, Sold Out items) to Google Sheets
// Works with existing Google Apps Script deployment without requiring script re-deploy!
export async function syncStoreConfigToGoogleSheets(configObj) {
  const webhookUrl = getGoogleSheetsWebhookUrl();
  if (!webhookUrl) return false;

  const encodedNotes = JSON.stringify({
    isBoothActive: configObj.isBoothActive !== false,
    isPoActive: configObj.isPoActive !== false,
    soldOutFlavors: configObj.soldOutFlavors || [],
    soldOutToppings: configObj.soldOutToppings || [],
    updatedAt: Date.now(),
  });

  try {
    // Delete previous config row first so only 1 clean row exists, then insert updated config row
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'delete_order',
        order_code: SYSTEM_CONFIG_ORDER_CODE,
      }),
      mode: 'no-cors',
    });

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        order_code: SYSTEM_CONFIG_ORDER_CODE,
        customer_name: 'PENGATURAN SISTEM (JANGAN DIHAPUS)',
        customer_phone: '-',
        order_type: 'po',
        po_session_name: configObj.isBoothActive !== false ? 'BOOTH_BUKA' : 'BOOTH_TUTUP',
        po_time_range: configObj.isPoActive !== false ? 'PO_BUKA' : 'PO_TUTUP',
        payment_method: 'SYSTEM',
        payment_status: 'paid',
        has_proof: '-',
        notes: encodedNotes,
        flavor_name: '-',
        serving: '-',
        size: '-',
        toppings: '-',
        total_price: 0,
        status: 'selesai',
        timestamp: new Date().toISOString(),
      }),
      mode: 'no-cors',
    });
    return true;
  } catch (err) {
    console.error('Failed to sync store config to Google Sheets:', err);
    return false;
  }
}

// 2. Insert order to Supabase
export async function insertOrderToSupabase(order) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const row = {
    order_code: order.orderId,
    customer_name: order.customerName,
    customer_phone: order.customerPhone || '',
    payment_method: order.paymentMethod || 'qris',
    payment_status: order.paymentStatus || 'unpaid',
    order_type: order.orderType || 'regular',
    po_session_id: order.poSessionId || null,
    po_session_name: order.poSessionName || null,
    po_time_range: order.poTimeRange || null,
    proof_image_url: order.proofImageUrl || null,
    notes: order.notes || '',
    flavor_id: order.flavor?.id || '',
    flavor_name: order.flavor?.name || '',
    second_flavor_id: order.secondFlavor?.id || null,
    second_flavor_name: order.secondFlavor?.name || null,
    serving: order.serving,
    size: order.size,
    toppings: order.toppings || [],
    total_price: order.totalPrice,
    status: order.status || 'pending',
    created_at: new Date(order.timestamp).toISOString(),
  };

  try {
    const { data, error } = await supabase.from('orders').insert([row]).select();
    if (error) {
      console.error('Supabase insert error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase unexpected error:', err);
    return null;
  }
}

// 3. Update order status in Supabase
export async function updateOrderInSupabase(orderCode, newStatus) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('order_code', orderCode);

    if (error) {
      console.error('Supabase update error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase update error:', err);
    return false;
  }
}

// 4. Fetch all orders from Supabase
export async function fetchOrdersFromSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Supabase fetch error:', err);
    return null;
  }
}

// 5. Subscribe to real-time changes in Supabase
export function subscribeToSupabaseOrders(onOrderChange) {
  const supabase = getSupabaseClient();
  if (!supabase) return () => {};

  const channel = supabase
    .channel('orders-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      payload => {
        onOrderChange(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// 6. Delete order from Supabase
export async function deleteOrderFromSupabase(orderCode) {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('order_code', orderCode);

    if (error) {
      console.error('Supabase delete error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase delete error:', err);
    return false;
  }
}

