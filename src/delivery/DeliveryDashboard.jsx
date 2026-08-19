import React, { useState } from 'react';
import { MapPin, Phone, Package, Clock, CheckCircle, User } from 'lucide-react';

export default function DeliveryDashboard({ user, orders, loading, onRefresh }) {
  const updateOrderStatus = async (orderId, newStatus, eta = null) => {
    try {
      const payload = { status: newStatus };
      if (eta) payload.eta = eta;

      const res = await fetch(`http://localhost:8000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        if (onRefresh) onRefresh();
      } else {
        alert("Failed to update order status.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
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
  
  const handleSetEta = () => {
    if (!etaInput) {
      alert("Please enter an ETA.");
      return;
    }
    const etaFormatted = `${etaInput} mins`;
    onUpdate(order.id, 'On the way to Hub', etaFormatted);
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
          <button 
            onClick={() => onUpdate(order.id, 'Delivered')}
            style={{ width: '100%', backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            <CheckCircle size={18} /> Mark as Delivered
          </button>
        )}
      </div>
    </div>
  );
}
