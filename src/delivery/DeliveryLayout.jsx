import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import DeliveryDashboard from './DeliveryDashboard';
import DeliveryHistory from './DeliveryHistory';
import DeliveryAccount from './DeliveryAccount';
import { MapPin, Phone, User, Home, Package, Clock, History, Bell } from 'lucide-react';

export default function DeliveryLayout() {
  const [deliveryUser, setDeliveryUser] = useState(() => {
    try {
      const item = window.localStorage.getItem('deliveryUser');
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  });

  const [isRegistering, setIsRegistering] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const [phone, setPhone] = useState('');
  const [hubId, setHubId] = useState('');
  const [hubs, setHubs] = useState([]);

  // Global order state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const prevOrderIds = useRef(new Set());
  const [notificationPermission, setNotificationPermission] = useState('default');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (deliveryUser) {
      window.localStorage.setItem('deliveryUser', JSON.stringify(deliveryUser));
    } else {
      window.localStorage.removeItem('deliveryUser');
    }
  }, [deliveryUser]);

  useEffect(() => {
    if (!deliveryUser) {
      fetch('http://192.168.0.112:8000/api/hubs')
        .then(res => res.json())
        .then(data => setHubs(data.filter(h => h.is_active)))
        .catch(err => console.error("Error fetching hubs:", err));
    }
  }, [deliveryUser]);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  const fetchOrders = () => {
    if (!deliveryUser) return;

    fetch(`http://192.168.0.112:8000/api/delivery/orders/${deliveryUser.email}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoadingOrders(false);

        const activeOrders = data.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
        const currentOrderIds = new Set(activeOrders.map(o => o.id));

        if (prevOrderIds.current.size > 0) {
          const newOrders = activeOrders.filter(o => !prevOrderIds.current.has(o.id));
          if (newOrders.length > 0) {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('New Delivery Assigned! 📦', {
                body: `You have been assigned ${newOrders.length} new order(s). Open the app to view details.`,
                icon: '/vite.svg'
              });
            } else {
              alert(`New Delivery Assigned! You have ${newOrders.length} new order(s).`);
            }
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.play();
            } catch (e) { console.error("Could not play sound", e); }
          }
        }
        prevOrderIds.current = currentOrderIds;
      })
      .catch(err => {
        console.error(err);
        setLoadingOrders(false);
      });
  };

  useEffect(() => {
    if (deliveryUser) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [deliveryUser]);

  const handleGoogleSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    const { email, name, picture } = decoded;

    try {
      const res = await fetch('http://192.168.0.112:8000/api/delivery/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, picture })
      });
      const data = await res.json();

      if (res.ok && data.id) {
        setDeliveryUser(data);
      } else if (res.status === 400 && data.detail.includes("Phone and Hub ID")) {
        setTempUser({ email, name, picture });
        setIsRegistering(true);
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
  };

  const handleRegister = async () => {
    if (!phone || !hubId) {
      alert("Please enter phone number and select a hub.");
      return;
    }

    try {
      const res = await fetch('http://192.168.0.112:8000/api/delivery/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...tempUser, phone, hub_id: parseInt(hubId) })
      });
      const data = await res.json();
      if (res.ok) {
        setDeliveryUser(data);
        setIsRegistering(false);
      } else {
        alert("Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
  };

  const handleLogout = () => {
    setDeliveryUser(null);
    navigate('/delivery');
  };

  const activeTab = location.pathname.split('/').pop() || 'active';
  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;

  if (!deliveryUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2e8f0' }}>
        <div style={{ width: '100%', maxWidth: '480px', minHeight: '100vh', backgroundColor: '#f0fdf4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,0,0,0.1)', padding: '24px', boxSizing: 'border-box' }}>
          <div style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '100%', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--primary-green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={32} color="white" />
              </div>
            </div>
            <h2 style={{ color: '#1e293b', marginBottom: '8px' }}>Delivery Partner App</h2>
            <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '14px' }}>Login to manage your deliveries</p>

            {!isRegistering ? (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => alert('Login Failed')}
                  useOneTap
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', fontWeight: 'bold' }}>Complete your profile</p>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px' }}>
                    <Phone size={16} color="#64748b" style={{ marginRight: '8px' }} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                      style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Select Hub</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px' }}>
                    <Home size={16} color="#64748b" style={{ marginRight: '8px' }} />
                    <select
                      value={hubId}
                      onChange={e => setHubId(e.target.value)}
                      style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px', backgroundColor: 'transparent' }}
                    >
                      <option value="">Select a Hub</option>
                      {hubs.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleRegister}
                  style={{ backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#e2e8f0', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '480px', minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>

        {/* Global Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', zIndex: 10 }}>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Jupiter Fresh Partner</h1>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/delivery/active')}>
            <Bell size={24} color="#64748b" />
            {activeOrdersCount > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: 'white',
                fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px',
                border: '2px solid white'
              }}>
                {activeOrdersCount}
              </span>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '16px', overflowY: 'auto', paddingBottom: '80px' }}>
          <Routes>
            <Route path="/active" element={<DeliveryDashboard user={deliveryUser} orders={orders} loading={loadingOrders} onRefresh={fetchOrders} />} />
            <Route path="/history" element={<DeliveryHistory user={deliveryUser} orders={orders} loading={loadingOrders} />} />
            <Route path="/account" element={<DeliveryAccount user={deliveryUser} setUser={setDeliveryUser} onLogout={handleLogout} />} />
            <Route path="/*" element={<Navigate to="/delivery/active" replace />} />
          </Routes>
        </main>

        {/* Bottom Navigation */}
        <nav style={{ position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '12px 0', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)', borderTop: '1px solid #e2e8f0', zIndex: 10 }}>
          <div onClick={() => navigate('/delivery/active')} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: activeTab === 'active' || activeTab === 'delivery' ? 'var(--primary-green)' : '#94a3b8' }}>
            <Home size={24} />
            <span style={{ fontSize: '11px', fontWeight: '600' }}>Active</span>
            {activeOrdersCount > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-8px', backgroundColor: '#ef4444', color: 'white',
                fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px',
                border: '2px solid white'
              }}>
                {activeOrdersCount}
              </span>
            )}
          </div>
          <div onClick={() => navigate('/delivery/history')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: activeTab === 'history' ? 'var(--primary-green)' : '#94a3b8' }}>
            <History size={24} />
            <span style={{ fontSize: '11px', fontWeight: '600' }}>History</span>
          </div>
          <div onClick={() => navigate('/delivery/account')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer', color: activeTab === 'account' ? 'var(--primary-green)' : '#94a3b8' }}>
            <User size={24} />
            <span style={{ fontSize: '11px', fontWeight: '600' }}>Account</span>
          </div>
        </nav>
      </div>
    </div>
  );
}
