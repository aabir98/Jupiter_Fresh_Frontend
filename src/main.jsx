import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import AdminLayout from './admin/AdminLayout.jsx'

const AppTarget = import.meta.env.VITE_APP_TARGET === 'admin' ? AdminLayout : App;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="948937732006-v2cgaa07idhk1jluioqh2theee9na728.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          {import.meta.env.VITE_APP_TARGET === 'admin' ? (
            <>
              <Route path="/admin/*" element={<AdminLayout />} />
              <Route path="/*" element={<Navigate to="/admin" replace />} />
            </>
          ) : (
            <>
              <Route path="/*" element={<App />} />
              <Route path="/admin/*" element={<AdminLayout />} />
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
