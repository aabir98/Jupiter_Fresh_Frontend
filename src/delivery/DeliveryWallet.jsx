import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Wallet, Banknote, QrCode, CheckCircle, Clock, RefreshCw, AlertCircle, History } from 'lucide-react';

export default function DeliveryWallet({ user }) {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('pending'); // 'pending' | 'cleared' | 'upi'

  const fetchWallet = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/delivery/wallet/${user.email}`);
      if (res.ok) {
        const data = await res.json();
        setWalletData(data);
      }
    } catch (err) {
      console.error("Error fetching wallet data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.email) {
      fetchWallet();
    }
  }, [user]);

  if (loading && !walletData) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading wallet details...</div>;
  }

  const cashToSubmit = walletData?.cash_to_submit || 0;
  const pendingOrders = walletData?.pending_orders || [];
  const clearedOrders = walletData?.cleared_orders || [];
  const upiOrders = walletData?.upi_orders || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '22px', color: '#1e293b', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wallet color="var(--primary-green)" size={26} /> My Wallet
        </h2>
        <button 
          onClick={fetchWallet} 
          style={{ background: 'white', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', fontWeight: '600' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {/* Main Cash Balance Hero Card */}
      <div style={{
        background: 'linear-gradient(135deg, #166534 0%, #15803d 50%, #22c55e 100%)',
        borderRadius: '18px',
        padding: '24px',
        color: 'white',
        boxShadow: '0 10px 25px -5px rgba(22, 101, 52, 0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: '-15px', bottom: '-20px', opacity: 0.15 }}>
          <Banknote size={140} color="white" />
        </div>

        <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', color: '#bbf7d0', display: 'block', marginBottom: '8px' }}>
          Cash To Be Submitted To Admin
        </span>
        <div style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '16px' }}>
          ₹{cashToSubmit.toFixed(2)}
        </div>

        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.15)', 
          backdropFilter: 'blur(8px)',
          borderRadius: '12px', 
          padding: '12px 14px', 
          display: 'flex', 
          alignItems: 'flex-start', 
          gap: '10px',
          fontSize: '12px',
          lineHeight: '1.4',
          color: '#f0fdf4',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#fef08a' }} />
          <div>
            This balance includes COD orders delivered by you. Hand over this cash to the hub admin. Once collected, admin will click <strong>Clear payment</strong> to reset this balance to ₹0.
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '12px', gap: '4px' }}>
        <button
          onClick={() => setActiveSubTab('pending')}
          style={{
            flex: 1,
            padding: '10px 8px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            backgroundColor: activeSubTab === 'pending' ? 'white' : 'transparent',
            color: activeSubTab === 'pending' ? '#166534' : '#64748b',
            boxShadow: activeSubTab === 'pending' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            gap: '4px'
          }}
        >
          <Clock size={14} /> Pending COD ({pendingOrders.length})
        </button>
        <button
          onClick={() => setActiveSubTab('cleared')}
          style={{
            flex: 1,
            padding: '10px 8px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            backgroundColor: activeSubTab === 'cleared' ? 'white' : 'transparent',
            color: activeSubTab === 'cleared' ? '#166534' : '#64748b',
            boxShadow: activeSubTab === 'cleared' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            gap: '4px'
          }}
        >
          <CheckCircle size={14} /> Cleared ({clearedOrders.length})
        </button>
        <button
          onClick={() => setActiveSubTab('upi')}
          style={{
            flex: 1,
            padding: '10px 8px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            backgroundColor: activeSubTab === 'upi' ? 'white' : 'transparent',
            color: activeSubTab === 'upi' ? '#166534' : '#64748b',
            boxShadow: activeSubTab === 'upi' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            gap: '4px'
          }}
        >
          <QrCode size={14} /> UPI Delivered ({upiOrders.length})
        </button>
      </div>

      {/* Sub-Tab Content */}
      <div>
        {activeSubTab === 'pending' && (
          <div>
            <h3 style={{ fontSize: '15px', color: '#334155', margin: '0 0 12px 0', fontWeight: '700' }}>
              Pending Cash Orders to Submit
            </h3>
            {pendingOrders.length === 0 ? (
              <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
                <CheckCircle size={40} color="#bbf7d0" style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontSize: '14px', color: '#475569', fontWeight: '600' }}>No Pending Cash</p>
                <p style={{ margin: '4px 0 0', fontSize: '12px' }}>All collected COD payments have been submitted to admin.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pendingOrders.map(order => (
                  <div key={order.id} style={{ backgroundColor: 'white', padding: '14px 16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #f59e0b' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>Order #{order.id}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{order.date}</div>
                      <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '10px', backgroundColor: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                        CASH PENDING SUBMISSION
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#b45309' }}>₹{order.grandTotal}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>COD</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'cleared' && (
          <div>
            <h3 style={{ fontSize: '15px', color: '#334155', margin: '0 0 12px 0', fontWeight: '700' }}>
              Cleared Cash Payment History
            </h3>
            {clearedOrders.length === 0 ? (
              <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
                <History size={40} color="#e2e8f0" style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontSize: '14px', color: '#475569', fontWeight: '600' }}>No Cleared Payments Yet</p>
                <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Cleared settlements will be recorded here once admin collects cash.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {clearedOrders.map(order => (
                  <div key={order.id} style={{ backgroundColor: 'white', padding: '14px 16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #16a34a' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>Order #{order.id}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{order.date}</div>
                      <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '10px', backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                        CLEARED BY ADMIN
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#15803d' }}>₹{order.grandTotal}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>COD</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'upi' && (
          <div>
            <h3 style={{ fontSize: '15px', color: '#334155', margin: '0 0 12px 0', fontWeight: '700' }}>
              UPI / Online Payment Orders
            </h3>
            {upiOrders.length === 0 ? (
              <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
                <QrCode size={40} color="#e2e8f0" style={{ margin: '0 auto 12px' }} />
                <p style={{ margin: 0, fontSize: '14px', color: '#475569', fontWeight: '600' }}>No UPI / Online Orders Yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upiOrders.map(order => (
                  <div key={order.id} style={{ backgroundColor: 'white', padding: '14px 16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #0284c7' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>Order #{order.id}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{order.date}</div>
                      <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '10px', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {order.payment_method || 'UPI'} - DIRECTLY TO OWNER
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: '#0369a1' }}>₹{order.grandTotal}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>No cash handling</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
