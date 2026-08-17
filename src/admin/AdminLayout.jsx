import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Store as StoreIcon, LogOut, Menu, X, Gift, Bell, Settings as SettingsIcon } from 'lucide-react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import Orders from './Orders';
import Customers from './Customers';
import Store from './Store';
import OffersEvents from './OffersEvents';
import Notifications from './Notifications';
import Settings from './Settings';
import './admin.css';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App as CapacitorApp } from '@capacitor/app';

function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setupPushNotifications();
      fetchUnreadAlerts();
      const interval = setInterval(fetchUnreadAlerts, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchUnreadAlerts = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/admin/alerts');
      if (res.ok) {
        const data = await res.json();
        const count = data.filter(a => !a.is_read).length;
        setUnreadAlertsCount(count);
      }
    } catch (e) {
      console.error('Failed to fetch admin alerts', e);
    }
  };

  const setupPushNotifications = async () => {
    if (Capacitor.isNativePlatform()) {
      // Request local notification permissions as well
      await LocalNotifications.requestPermissions();
      
      PushNotifications.requestPermissions().then(result => {
        if (result.receive === 'granted') {
          PushNotifications.register();
        }
      });

      PushNotifications.addListener('registration', (token) => {
        fetch('http://localhost:8000/api/device-tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.value, role: 'admin' })
        }).catch(e => console.error('Failed to save admin token', e));
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        fetchUnreadAlerts();
        window.dispatchEvent(new Event('adminDataRefresh'));
        
        // Force a system notification banner since Capacitor swallows foreground push notifications
        LocalNotifications.schedule({
          notifications: [
            {
              title: notification.title || 'New Alert',
              body: notification.body || 'You have a new update in the admin app.',
              id: new Date().getTime(),
              schedule: { at: new Date(Date.now() + 500) },
              smallIcon: 'ic_stat_icon_config_sample' // Falls back to default if not set
            }
          ]
        });
      });

      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          fetchUnreadAlerts();
          window.dispatchEvent(new Event('adminDataRefresh'));
        }
      });
      return;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;
      
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      const response = await fetch('http://localhost:8000/api/admin/vapid_public_key');
      if (!response.ok) return;
      const { public_key } = await response.json();
      
      function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      }
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(public_key)
      });
      
      await fetch('http://localhost:8000/api/admin/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON())
      });
    } catch (e) {
      console.error('Push notification setup failed', e);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('adminAuth', 'true');
    navigate('/admin');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const navLinks = [
    { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/orders', name: 'Orders', icon: <ShoppingCart size={20} /> },
    { path: '/admin/customers', name: 'Customers', icon: <Users size={20} /> },
    { path: '/admin/store', name: 'Store', icon: <StoreIcon size={20} /> },
    { path: '/admin/offers-events', name: 'Offers & Events', icon: <Gift size={20} /> },
    { path: '/admin/notifications', name: 'Notifications', icon: <Bell size={20} /> },
    { path: '/admin/settings', name: 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className="admin-container">
      {/* Mobile Header */}
      <div className="admin-mobile-header">
        <div className="admin-logo">Jupiter Fresh Admin</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/admin/notifications" style={{ textDecoration: 'none', color: 'var(--admin-text)' }}>
            <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Bell size={22} color="var(--admin-primary)" />
              {unreadAlertsCount > 0 && (
                <span style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  {unreadAlertsCount}
                </span>
              )}
            </div>
          </Link>
          <button className="admin-menu-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <h2>Jupiter Fresh Admin</h2>
        </div>
        <nav className="admin-nav">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`admin-nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {link.icon}
                <span>{link.name}</span>
              </div>
              {link.name === 'Notifications' && unreadAlertsCount > 0 && (
                <span className="admin-sidebar-badge">{unreadAlertsCount}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div className="admin-backdrop" onClick={closeSidebar}></div>
      )}

      {/* Main Content */}
      <div className="admin-main-content">
        
        {/* Desktop Top Header (Notification Bell) */}
        <div className="admin-desktop-header" style={{ display: window.innerWidth > 768 ? 'flex' : 'none', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <Link to="/admin/notifications" style={{ textDecoration: 'none', color: 'var(--admin-text)' }}>
            <div style={{ position: 'relative', cursor: 'pointer', padding: '10px', backgroundColor: 'white', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={24} color="var(--admin-primary)" />
              {unreadAlertsCount > 0 && (
                <span style={{ position: 'absolute', top: -2, right: -2, backgroundColor: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 'bold', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid white' }}>
                  {unreadAlertsCount}
                </span>
              )}
            </div>
          </Link>
        </div>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/store" element={<Store />} />
          <Route path="/offers-events" element={<OffersEvents />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

export default AdminLayout;
