import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import { MapPin, Phone, Package, Clock, CheckCircle, User, ShieldAlert } from 'lucide-react';

export default function DeliveryDashboard({ user, orders, loading, onRefresh }) {
  const updateOrderStatus = async (orderId, newStatus, eta = null, pin = null, paymentMethod = null) => {
    try {
      const payload = { status: newStatus };
      if (eta) payload.eta = eta;
      if (pin) payload.pin = pin;
      if (paymentMethod) payload.payment_method = paymentMethod;

      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        if (onRefresh) onRefresh();
        return { success: true };
      } else {
        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.detail || "Failed to update order status.";
        alert(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
      return { success: false, error: "Network error." };
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading active deliveries...</div>;
  }

  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', color: '#1e293b', margin: 0 }}>Active Deliveries</h2>
        <div style={{ backgroundColor: 'var(--light-green)', color: 'var(--primary-green)', padding: '4px 12px', borderRadius: '16px', fontSize: '14px', fontWeight: 'bold' }}>
          {activeOrders.length}
        </div>
      </div>
      
      {activeOrders.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '48px 32px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <Package size={64} color="#e2e8f0" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: '#475569', margin: '0 0 8px 0' }}>No Active Orders</h3>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>New deliveries assigned to you will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeOrders.map(order => (
            <OrderCard key={order.id} order={order} onUpdate={updateOrderStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onUpdate }) {
  const [etaInput, setEtaInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [submittingPin, setSubmittingPin] = useState(false);
  const [paymentMode, setPaymentMode] = useState('COD'); // 'COD' | 'UPI'
  const [showQrModal, setShowQrModal] = useState(false);
  
  const handleSetEta = () => {
    if (!etaInput) {
      alert("Please enter an ETA.");
      return;
    }
    const etaFormatted = `${etaInput} mins`;
    onUpdate(order.id, 'On the way to Hub', etaFormatted);
  };

  const handleConfirmDelivery = async (chosenMode = paymentMode) => {
    if (!pinInput || pinInput.length !== 4) {
      const errMsg = "Wrong Delivery Pin. Ask Delivery Pin from customer";
      setPinError(errMsg);
      alert(errMsg);
      return;
    }
    setPinError('');
    setSubmittingPin(true);
    const res = await onUpdate(order.id, 'Delivered', null, pinInput, chosenMode);
    setSubmittingPin(false);
    if (res && !res.success) {
      const errMsg = res.error || "Wrong Delivery Pin. Ask Delivery Pin from customer";
      setPinError(errMsg);
    } else {
      setShowQrModal(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>ORDER ID</span>
          <h4 style={{ margin: '4px 0 0 0', color: '#1e293b' }}>{order.id}</h4>
        </div>
        <div style={{ 
          backgroundColor: '#e0f2fe',
          color: '#0369a1',
          padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' 
        }}>
          {order.status || 'Placed'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ backgroundColor: '#f1f5f9', padding: '8px', borderRadius: '50%' }}>
            <User size={16} color="#64748b" />
          </div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 'bold', color: '#1e293b' }}>{order.deliveryDetails.name}</p>
            <a href={`tel:${order.deliveryDetails.phone}`} style={{ margin: 0, fontSize: '13px', color: 'var(--primary-green)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Phone size={12} /> {order.deliveryDetails.phone}
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <a 
            href={order.deliveryDetails.lat && order.deliveryDetails.lng ? `https://www.google.com/maps/search/?api=1&query=${order.deliveryDetails.lat},${order.deliveryDetails.lng}` : '#'} 
            target={order.deliveryDetails.lat && order.deliveryDetails.lng ? "_blank" : "_self"} 
            rel="noopener noreferrer"
            style={{ backgroundColor: '#e0f2fe', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <MapPin size={16} color="#0284c7" />
          </a>
          <div>
            <p style={{ margin: '0', fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
              {order.deliveryDetails.building && `${order.deliveryDetails.building}, `}
              {order.deliveryDetails.street && `${order.deliveryDetails.street}, `}
              {order.deliveryDetails.locality && `${order.deliveryDetails.locality}, `}
              {order.deliveryDetails.city}
            </p>
            {order.deliveryDetails.landmark && (
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>Landmark: {order.deliveryDetails.landmark}</p>
            )}
            {order.deliveryDetails.lat && order.deliveryDetails.lng && (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryDetails.lat},${order.deliveryDetails.lng}`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'inline-block', marginTop: '6px', fontSize: '12px', color: 'var(--primary-green)', fontWeight: 'bold', textDecoration: 'none' }}
              >
                Open in Google Maps
              </a>
            )}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
        {(!order.status || order.status === 'Placed') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', flex: 1 }}>
                <Clock size={16} color="#64748b" style={{ marginRight: '8px' }} />
                <input 
                  type="number" 
                  value={etaInput} 
                  onChange={e => setEtaInput(e.target.value)} 
                  placeholder="ETA (mins)"
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
                />
              </div>
              <button 
                onClick={handleSetEta}
                disabled={Number(etaInput) > 59}
                style={{ backgroundColor: Number(etaInput) > 59 ? '#cbd5e1' : 'var(--primary-green)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: Number(etaInput) > 59 ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
              >
                Set ETA
              </button>
            </div>
            {Number(etaInput) > 59 && (
              <span style={{ color: '#0284c7', fontSize: '12px', paddingLeft: '4px' }}>ETA must be less than 60 mins</span>
            )}
          </div>
        )}

        {order.status === 'On the way to Hub' && (
          <button 
            onClick={() => onUpdate(order.id, 'On the way')}
            style={{ width: '100%', backgroundColor: '#0284c7', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            <Package size={18} /> Mark as Picked Up
          </button>
        )}

        {order.status === 'On the way' && (
          <button 
            onClick={() => onUpdate(order.id, 'Arrived')}
            style={{ width: '100%', backgroundColor: '#ea580c', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            <MapPin size={18} /> Mark as Arrived
          </button>
        )}

        {order.status === 'Arrived' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ backgroundColor: '#fff7ed', border: '1px solid #ffedd5', padding: '14px', borderRadius: '10px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#ea580c', marginBottom: '8px' }}>
                Enter Customer's 4-Digit Delivery PIN
              </label>
              <input 
                type="text" 
                maxLength={4}
                value={pinInput} 
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setPinInput(val);
                  if (pinError) setPinError('');
                }}
                placeholder="4-digit PIN"
                style={{ 
                  width: '100%', 
                  boxSizing: 'border-box',
                  padding: '10px 12px', 
                  borderRadius: '8px', 
                  border: pinError ? '2px solid #ef4444' : '1px solid #cbd5e1', 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  letterSpacing: '4px',
                  textAlign: 'center',
                  outline: 'none',
                  backgroundColor: 'white',
                  marginBottom: '12px'
                }}
              />

              {/* Payment Mode Selector Toggle */}
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
                Payment Method at Delivery:
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMode('COD')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: paymentMode === 'COD' ? '2px solid #15803d' : '1px solid #cbd5e1',
                    backgroundColor: paymentMode === 'COD' ? '#f0fdf4' : 'white',
                    color: paymentMode === 'COD' ? '#15803d' : '#64748b',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  💵 Cash on Delivery
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMode('UPI');
                    if (pinInput.length === 4) {
                      setShowQrModal(true);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: paymentMode === 'UPI' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    backgroundColor: paymentMode === 'UPI' ? '#f0f9ff' : 'white',
                    color: paymentMode === 'UPI' ? '#0369a1' : '#64748b',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  📱 UPI on Delivery
                </button>
              </div>

              {/* Action Button depending on selected Payment Mode */}
              {paymentMode === 'COD' ? (
                <button 
                  onClick={() => handleConfirmDelivery('COD')}
                  disabled={submittingPin || pinInput.length !== 4}
                  style={{ 
                    width: '100%',
                    backgroundColor: pinInput.length === 4 ? '#16a34a' : '#cbd5e1', 
                    color: 'white', 
                    border: 'none', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    fontWeight: 'bold', 
                    fontSize: '15px',
                    cursor: pinInput.length === 4 ? 'pointer' : 'not-allowed', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCircle size={18} /> {submittingPin ? 'Verifying...' : `Cash Collected (₹${order.grandTotal})`}
                </button>
              ) : (
                <button 
                  onClick={() => {
                    if (pinInput.length !== 4) {
                      setPinError("Please enter 4-digit PIN first");
                      alert("Please enter customer's 4-digit PIN first");
                      return;
                    }
                    setShowQrModal(true);
                  }}
                  disabled={submittingPin || pinInput.length !== 4}
                  style={{ 
                    width: '100%',
                    backgroundColor: pinInput.length === 4 ? '#0284c7' : '#cbd5e1', 
                    color: 'white', 
                    border: 'none', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    fontWeight: 'bold', 
                    fontSize: '15px',
                    cursor: pinInput.length === 4 ? 'pointer' : 'not-allowed', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  📱 Show UPI QR Code (₹{order.grandTotal})
                </button>
              )}

              {pinError && (
                <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#ef4444', fontWeight: 'bold', textAlign: 'center' }}>
                  {pinError}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* UPI QR Pop-up Modal */}
      {showQrModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '360px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>UPI PAYMENT</span>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px' }}>Scan & Pay ₹{order.grandTotal}</h3>
              </div>
              <button 
                onClick={() => setShowQrModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '2px dashed #cbd5e1',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <img 
                src="/upi_qr.png" 
                alt="UPI Payment QR Code" 
                style={{ width: '100%', maxWidth: '240px', height: 'auto', borderRadius: '8px', margin: '0 auto', display: 'block' }} 
              />
              <p style={{ margin: '12px 0 0', fontSize: '12px', color: '#475569', fontWeight: '600' }}>
                Ask customer to scan using PhonePe, GPay, Paytm or any UPI App
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => handleConfirmDelivery('UPI')}
                disabled={submittingPin}
                style={{
                  width: '100%',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.3)'
                }}
              >
                {submittingPin ? 'Verifying...' : 'Payment collected through UPI'}
              </button>
              
              <button
                onClick={() => {
                  setPaymentMode('COD');
                  setShowQrModal(false);
                }}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: '#64748b',
                  border: '1px solid #cbd5e1',
                  padding: '10px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Switch to Cash on Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

