import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import AdminLayout from './admin/AdminLayout.jsx'
import DeliveryLayout from './delivery/DeliveryLayout.jsx'

const AppTarget = import.meta.env.VITE_APP_TARGET === 'admin' ? AdminLayout : App;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="85836218573-cmeh6gk3t4hbvsiu598jpm674tbd0b89.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          {import.meta.env.VITE_APP_TARGET === 'admin' ? (
            <>
              <Route path="/admin/*" element={<AdminLayout />} />
              <Route path="/*" element={<Navigate to="/admin" replace />} />
            </>
          ) : (
            <>
              <Route path="/delivery/*" element={<DeliveryLayout />} />
              <Route path="/admin/*" element={<AdminLayout />} />
              <Route path="/*" element={<App />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
)

// Register service worker globally for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.error('ServiceWorker registration failed: ', err);
    });
  });
}
