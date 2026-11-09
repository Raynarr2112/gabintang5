import React, { createContext, useContext, useState, useEffect } from 'react';
import { FLAVORS, TOPPINGS, SIZE_OPTIONS } from '../data/flavors';
import { calculateRecommendation } from '../utils/scoring';
import { generateOrderId } from '../utils/formatters';
import confetti from 'canvas-confetti';
import {
  isSupabaseConfigured,
} from '../services/supabase';
import {
  insertOrderToSupabase,
  updateOrderInSupabase,
  deleteOrderFromSupabase,
  fetchOrdersFromSupabase,
  subscribeToSupabaseOrders,
  sendOrderToGoogleSheets,
  updateOrderStatusInGoogleSheets,
  deleteOrderInGoogleSheets,
  fetchOrdersFromGoogleSheets,
  getGoogleSheetsWebhookUrl,
} from '../services/orderSync';
import { playOrderChime } from '../utils/audioAlert';
import { getPoSettings, savePoSettings, calculateSlotRemainingQuota } from '../utils/poSettings';

const OrderContext = createContext();

const STORAGE_KEY = 'scoopmatch_order_queue_v6';
const DELETED_IDS_KEY = 'scoopmatch_deleted_order_ids_v2';
const SOLD_OUT_FLAVORS_KEY = 'scoopmatch_sold_out_flavors_v2';
const SOLD_OUT_TOPPINGS_KEY = 'scoopmatch_sold_out_toppings_v2';

function getDeletedOrderIds() {
  try {
    const saved = localStorage.getItem(DELETED_IDS_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch {
    return new Set();
  }
}

function addDeletedOrderIds(ids) {
  try {
    const current = getDeletedOrderIds();
    ids.forEach(id => current.add(id));
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify([...current]));
  } catch {}
}

function removeDeletedOrderId(id) {
  try {
    const current = getDeletedOrderIds();
    if (current.has(id)) {
      current.delete(id);
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify([...current]));
    }
  } catch {}
}

let lastClearedTimestamp = 0;

// Clean empty initial orders (no demo/dummy data by default)
const INITIAL_DEMO_ORDERS = [];

function mapDatabaseRowToOrder(row) {
  const matchedFlavor = FLAVORS.find(f => f.id === row.flavor_id) || {
    id: row.flavor_id,
    name: row.flavor_name,
    emoji: '🍦',
  };

  const matchedSecondFlavor = row.second_flavor_id
    ? FLAVORS.find(f => f.id === row.second_flavor_id) || {
        id: row.second_flavor_id,
        name: row.second_flavor_name || 'Rasa 2',
        emoji: '🍦',
      }
    : null;

  return {
    orderId: row.order_code,
    customerName: row.customer_name,
    customerPhone: row.customer_phone || '',
    paymentMethod: row.payment_method || 'qris',
    paymentStatus: row.payment_status || 'unpaid',
    orderType: row.order_type || 'regular',
    poSessionId: row.po_session_id || null,
    poSessionName: row.po_session_name || null,
    poTimeRange: row.po_time_range || null,
    proofImageUrl: row.proof_image_url || null,
    notes: row.notes || '',
    flavor: matchedFlavor,
    secondFlavor: matchedSecondFlavor,
    serving: row.serving || 'gabin-original',
    size: row.size || 'single',
    toppings: Array.isArray(row.toppings) ? row.toppings : [],
    totalPrice: Number(row.total_price) || 0,
    timestamp: new Date(row.created_at).getTime(),
    status: row.status || 'pending',
  };
}

function mapSheetRowToOrder(row, existingOrder = null) {
  const matchedFlavor =
    FLAVORS.find(f => f.name.toLowerCase() === (row.flavor_name || '').toLowerCase()) ||
    FLAVORS.find(f => (row.flavor_name || '').toLowerCase().includes(f.name.toLowerCase())) ||
    existingOrder?.flavor ||
    FLAVORS[2];

  let parsedToppings = existingOrder?.toppings || [];
  if (row.toppings_text && row.toppings_text !== '-') {
    const matchedIds = TOPPINGS.filter(t =>
      row.toppings_text.toLowerCase().includes(t.name.toLowerCase())
    ).map(t => t.id);
    if (matchedIds.length > 0) {
      parsedToppings = matchedIds;
    }
  }

  return {
    orderId: row.order_code,
    customerName: row.customer_name || 'Pelanggan',
    customerPhone: row.customer_phone || '',
    paymentMethod: row.payment_method || 'qris',
    paymentStatus: row.payment_status || 'unpaid',
    orderType: 'po',
    poSessionId: row.po_session_id || 'hari-senin',
    poSessionName: row.po_session_name || 'Hari Senin',
    poTimeRange: existingOrder?.poTimeRange || 'Pengambilan / Pengantaran',
    proofImageUrl: existingOrder?.proofImageUrl || null,
    notes: row.notes || '',
    flavor: matchedFlavor,
    secondFlavor: existingOrder?.secondFlavor || null,
    serving: 'gabin-original',
    size: 'single',
    toppings: parsedToppings,
    totalPrice: Number(row.total_price) || 9000,
    timestamp: existingOrder?.timestamp || Date.now(),
    status: row.status || 'pending',
  };
}

export function OrderProvider({ children }) {
  // Navigation / View State
  const [currentView, setCurrentView] = useState('landing');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Sold Out Stock Management (flavors & toppings)
  const [soldOutFlavors, setSoldOutFlavors] = useState(() => {
    try {
      const saved = localStorage.getItem(SOLD_OUT_FLAVORS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [soldOutToppings, setSoldOutToppings] = useState(() => {
    try {
      const saved = localStorage.getItem(SOLD_OUT_TOPPINGS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SOLD_OUT_FLAVORS_KEY, JSON.stringify(soldOutFlavors));
    } catch {}
  }, [soldOutFlavors]);

  useEffect(() => {
    try {
      localStorage.setItem(SOLD_OUT_TOPPINGS_KEY, JSON.stringify(soldOutToppings));
    } catch {}
  }, [soldOutToppings]);

  const toggleFlavorSoldOut = (flavorId) => {
    setSoldOutFlavors(prev =>
      prev.includes(flavorId) ? prev.filter(id => id !== flavorId) : [...prev, flavorId]
    );
  };

  const toggleToppingSoldOut = (toppingId) => {
    setSoldOutToppings(prev => {
      const next = prev.includes(toppingId)
        ? prev.filter(id => id !== toppingId)
        : [...prev, toppingId];
      // Auto-remove from current customization if customer had selected it
      setCustomization(c => ({
        ...c,
        toppings: c.toppings.filter(t => !next.includes(t)),
      }));
      return next;
    });
  };

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState({});
  const [recommendedFlavor, setRecommendedFlavor] = useState(FLAVORS[0]);

  // Ice Cream Customization state (supports double scoop with secondFlavor)
  const [customization, setCustomization] = useState({
    serving: 'gabin-original',
    size: 'single',  // 'single' | 'double'
    secondFlavor: null, // flavor object for scoop 2
    toppings: ['keju'], // array of topping ids
  });

  // Current newly placed order for success ticket
  const [currentTicket, setCurrentTicket] = useState(null);

  // 1-Day Pre-Order (PO) event settings
  const [poSettings, setPoSettings] = useState(() => getPoSettings());

  const updatePoSettings = (newSettings) => {
    setPoSettings(newSettings);
    savePoSettings(newSettings);
  };

  // Barista Order Queue with LocalStorage & Cloud persistence
  const [orderQueue, setOrderQueue] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load orders from localStorage', e);
    }
    return INITIAL_DEMO_ORDERS;
  });

  // Save to localStorage whenever orderQueue changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orderQueue));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }, [orderQueue]);

  // Real-time cross-tab synchronization via window 'storage' event (instant update across tabs without refresh)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          const deletedSet = getDeletedOrderIds();
          const rawOrders = e.newValue ? JSON.parse(e.newValue) : [];
          const updatedOrders = rawOrders.filter(o => !deletedSet.has(o.orderId));
          setOrderQueue(prev => {
            // Play chime if a new order was added from another tab
            if (updatedOrders.length > prev.length) {
              playOrderChime();
            }
            return updatedOrders;
          });
        } catch (err) {
          console.error('Failed to sync storage event', err);
        }
      } else if (e.key === SOLD_OUT_FLAVORS_KEY) {
        try {
          setSoldOutFlavors(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {}
      } else if (e.key === SOLD_OUT_TOPPINGS_KEY) {
        try {
          setSoldOutToppings(e.newValue ? JSON.parse(e.newValue) : []);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


  // Real-time synchronization with Supabase Cloud Database (if configured)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // 1. Fetch initial orders from cloud
    fetchOrdersFromSupabase().then(rows => {
      if (rows && rows.length > 0) {
        const deletedSet = getDeletedOrderIds();
        const filteredRows = rows
          .filter(r => !deletedSet.has(r.order_code))
          .map(mapDatabaseRowToOrder);
        setOrderQueue(filteredRows);
      }
    });

    // 2. Realtime listener for incoming orders & status changes
    const unsubscribe = subscribeToSupabaseOrders((payload) => {
      if (payload.eventType === 'INSERT') {
        const mapped = mapDatabaseRowToOrder(payload.new);
        setOrderQueue(prev => {
          if (prev.some(o => o.orderId === mapped.orderId)) {
            return prev.map(o => (o.orderId === mapped.orderId ? mapped : o));
          }
          // Play audio bell chime for new order on barista device!
          playOrderChime();
          return [mapped, ...prev];
        });
      } else if (payload.eventType === 'UPDATE') {
        const mapped = mapDatabaseRowToOrder(payload.new);
        setOrderQueue(prev =>
          prev.map(o => (o.orderId === mapped.orderId ? mapped : o))
        );
      } else if (payload.eventType === 'DELETE') {
        setOrderQueue(prev => prev.filter(o => o.orderId !== payload.old?.order_code));
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Two-Way Auto-Sync with Google Sheets (works across all devices even if Supabase is present)
  useEffect(() => {
    let isMounted = true;

    const syncFromSheets = async () => {
      // Skip polling for 10 seconds right after user clicked "Bersihkan Semua"
      if (Date.now() - lastClearedTimestamp < 10000) return;

      const webhookUrl = getGoogleSheetsWebhookUrl();
      if (!webhookUrl) return;

      const sheetOrders = await fetchOrdersFromGoogleSheets();
      if (!isMounted || !sheetOrders) return;

      // Re-check after async fetch finishes
      if (Date.now() - lastClearedTimestamp < 10000) return;

      setOrderQueue(prev => {
        const deletedSet = getDeletedOrderIds();
        const prevMap = new Map(prev.map(o => [o.orderId, o]));
        let hasNewOrder = false;

        // Filter out any orders that were deleted locally in Admin and deduplicate by order_code
        const seenCodes = new Set();
        const validSheetRows = sheetOrders.filter(row => {
          const code = (row.order_code || '').trim();
          if (!code || deletedSet.has(code) || seenCodes.has(code)) return false;
          seenCodes.add(code);
          return true;
        });

        const merged = validSheetRows.map(row => {
          const existing = prevMap.get(row.order_code);
          if (!existing) {
            hasNewOrder = true;
          }
          return mapSheetRowToOrder(row, existing);
        });

        // Preserve any very recent local orders (< 15s old) that haven't finished writing to Sheets yet
        const now = Date.now();
        const recentLocalOnly = prev.filter(
          localOrd =>
            !merged.some(m => m.orderId === localOrd.orderId) &&
            now - (localOrd.timestamp || 0) < 15000
        );

        const nextList = [...recentLocalOnly, ...merged];

        if (hasNewOrder && prev.length > 0) {
          playOrderChime();
        }

        // Avoid unnecessary re-render if nothing changed
        if (JSON.stringify(nextList) === JSON.stringify(prev)) {
          return prev;
        }
        return nextList;
      });
    };

    // Initial fetch + background poll every 5 seconds
    syncFromSheets();
    const intervalId = setInterval(syncFromSheets, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Calculate live total price for current customization
  const calculateTotal = (flavor = recommendedFlavor, config = customization) => {
    const sizeObj = SIZE_OPTIONS.find(s => s.id === config.size) || SIZE_OPTIONS[0];
    let total = sizeObj.price;

    config.toppings.forEach(topId => {
      const topObj = TOPPINGS.find(t => t.id === topId);
      if (topObj) total += topObj.price;
    });

    return total;
  };

  // Launch playful confetti burst
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD1DC', '#FDE047', '#FB7185', '#684535', '#4ADE80'],
      });
    } catch {
      // fallback safe
    }
  };

  // Navigation handlers
  const startQuiz = () => {
    setQuizAnswers({});
    setCurrentView('quiz');
  };

  const handleFinishQuiz = (finalAnswers) => {
    setQuizAnswers(finalAnswers);
    const recommendation = calculateRecommendation(finalAnswers, soldOutFlavors, soldOutToppings);
    setRecommendedFlavor(recommendation.flavor);

    // Gunakan paket topping hasil perhitungan Q3 (tabur), Q4 (buah), Q5 (selai), dan Q6 (pelengkap)
    setCustomization(prev => ({
      ...prev,
      serving: 'gabin-original',
      toppings: recommendation.toppings || [],
      secondFlavor: null,
    }));

    setCurrentView('recommendation');
    setTimeout(() => {
      triggerConfetti();
    }, 300);
  };

  // Confirm order, save to Supabase Cloud, send to Google Sheets, and create ticket
  const placeOrder = ({
    customerName,
    customerPhone = '',
    paymentMethod = 'qris',
    notes = '',
    orderType = 'regular', // 'regular' | 'po'
    poSessionId = null,
    poSessionName = '',
    poTimeRange = '',
    proofImageUrl = null,
  }) => {
    const newOrder = {
      orderId: generateOrderId(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      paymentMethod,
      paymentStatus: 'unpaid',
      notes: notes.trim(),
      orderType,
      poSessionId,
      poSessionName,
      poTimeRange,
      proofImageUrl,
      flavor: recommendedFlavor,
      secondFlavor: customization.size === 'double' && customization.secondFlavor ? customization.secondFlavor : null,
      serving: customization.serving,
      size: customization.size,
      toppings: [...customization.toppings],
      totalPrice: calculateTotal(),
      timestamp: Date.now(),
      status: 'pending', // 'pending' | 'diproses' | 'selesai'
    };

    // Clear from deleted tombstones if orderId is reused
    removeDeletedOrderId(newOrder.orderId);

    // 1. Push to Supabase Cloud Database (if configured)
    insertOrderToSupabase(newOrder);

    // 2. Push to Google Sheets Webhook (if configured)
    sendOrderToGoogleSheets(newOrder);

    // 3. Local state updates
    setOrderQueue(prev => [newOrder, ...prev]);
    setCurrentTicket(newOrder);
    setIsOrderModalOpen(false);
    setCurrentView('ticket');

    // Chime alert & confetti celebration
    playOrderChime();
    triggerConfetti();
  };

  // Barista status management
  const updateOrderStatus = (orderId, newStatus) => {
    // 1. Update in Supabase
    updateOrderInSupabase(orderId, newStatus);

    // 2. Update in Google Sheets
    const currentOrd = orderQueue.find(o => o.orderId === orderId);
    updateOrderStatusInGoogleSheets({
      orderCode: orderId,
      status: newStatus,
      paymentStatus: currentOrd?.paymentStatus,
      paymentMethod: currentOrd?.paymentMethod,
    });

    // 3. Update in Local State
    setOrderQueue(prev =>
      prev.map(ord => (ord.orderId === orderId ? { ...ord, status: newStatus } : ord))
    );
  };

  // Payment status update (QRIS / Cash verification)
  const updatePaymentStatus = (orderId, newPaymentStatus, newPaymentMethod = null) => {
    const currentOrd = orderQueue.find(o => o.orderId === orderId);
    const newWorkflowStatus =
      newPaymentStatus === 'paid' && currentOrd?.status === 'pending'
        ? 'diproses'
        : (currentOrd?.status || 'pending');

    // Update in Google Sheets
    updateOrderStatusInGoogleSheets({
      orderCode: orderId,
      status: newWorkflowStatus,
      paymentStatus: newPaymentStatus,
      paymentMethod: newPaymentMethod || currentOrd?.paymentMethod,
    });

    // Update in Local State
    setOrderQueue(prev =>
      prev.map(ord => {
        if (ord.orderId !== orderId) return ord;
        return {
          ...ord,
          paymentStatus: newPaymentStatus,
          paymentMethod: newPaymentMethod || ord.paymentMethod,
          // When marked paid and pending, auto start processing
          status: newWorkflowStatus,
        };
      })
    );
  };

  const deleteOrder = (orderId) => {
    addDeletedOrderIds([orderId]);

    // Delete in Supabase
    deleteOrderFromSupabase(orderId);

    // Delete in Google Sheets
    deleteOrderInGoogleSheets(orderId);

    // Delete in Local State
    setOrderQueue(prev => prev.filter(ord => ord.orderId !== orderId));
  };

  const resetToDemoOrders = () => {
    setOrderQueue(INITIAL_DEMO_ORDERS);
  };

  const clearQueue = () => {
    lastClearedTimestamp = Date.now();

    // Record all current orderIds as deleted so background sync won't resurrect them
    const currentIds = orderQueue.map(o => o.orderId);
    addDeletedOrderIds(currentIds);

    // Delete in Supabase & Google Sheets for each order
    currentIds.forEach(id => {
      deleteOrderFromSupabase(id);
      deleteOrderInGoogleSheets(id);
    });

    setOrderQueue([]);
  };

  const attachPaymentProof = (orderId, proofImageUrl) => {
    const currentOrd = orderQueue.find(o => o.orderId === orderId);
    updateOrderStatusInGoogleSheets({
      orderCode: orderId,
      status: currentOrd?.status || 'pending',
      paymentStatus: currentOrd?.paymentStatus || 'unpaid',
      paymentMethod: currentOrd?.paymentMethod || 'qris',
      hasProof: proofImageUrl ? 'YA' : 'TIDAK',
    });

    setOrderQueue(prev =>
      prev.map(ord => (ord.orderId === orderId ? { ...ord, proofImageUrl } : ord))
    );
    setCurrentTicket(prev => (prev?.orderId === orderId ? { ...prev, proofImageUrl } : prev));
  };

  return (
    <OrderContext.Provider
      value={{
        currentView,
        setCurrentView,
        isOrderModalOpen,
        setIsOrderModalOpen,
        quizAnswers,
        recommendedFlavor,
        setRecommendedFlavor,
        customization,
        setCustomization,
        currentTicket,
        setCurrentTicket,
        orderQueue,
        calculateTotal,
        startQuiz,
        handleFinishQuiz,
        placeOrder,
        updateOrderStatus,
        updatePaymentStatus,
        attachPaymentProof,
        deleteOrder,
        resetToDemoOrders,
        clearQueue,
        triggerConfetti,
        soldOutFlavors,
        soldOutToppings,
        toggleFlavorSoldOut,
        toggleToppingSoldOut,
        poSettings,
        updatePoSettings,
        calculateSlotRemainingQuota,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}
