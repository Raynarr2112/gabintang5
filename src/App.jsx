import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { OrderProvider } from './context/OrderContext';
import CustomerApp from './components/CustomerApp';
import AdminApp from './components/AdminApp';

export default function App() {
  return (
    <BrowserRouter>
      <OrderProvider>
        <Routes>
          {/* Pelanggan: semua flow pemesanan */}
          <Route path="/*" element={<CustomerApp />} />

          {/* Admin/Barista: panel antrean & kasir (dilindungi PIN) */}
          <Route path="/admin" element={<AdminApp />} />
        </Routes>
      </OrderProvider>
    </BrowserRouter>
  );
}
