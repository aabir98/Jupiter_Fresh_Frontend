import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import AdminLayout from './admin/AdminLayout.jsx'
import DeliveryLayout from './delivery/DeliveryLayout.jsx'

import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#ef4444' }}>Something went wrong while loading the app.</h2>
          <p style={{ color: '#64748b' }}>{this.state.error?.toString()}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '10px 20px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppTarget = import.meta.env.VITE_APP_TARGET === 'admin' ? AdminLayout : App;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
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
    </ErrorBoundary>
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
