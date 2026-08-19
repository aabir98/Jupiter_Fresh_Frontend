import React from 'react';
import { History, Star, MapPin, CheckCircle, XCircle } from 'lucide-react';

export default function DeliveryHistory({ user, orders, loading }) {
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading history...</div>;
  }

  const pastOrders = orders.filter(o => o.status === 'Delivered' || o.status === 'Cancelled');

  return (
    <div>
      <h2 style={{ fontSize: '20px', color: '#1e293b', margin: '0 0 16px 0' }}>Order History</h2>
      
      {pastOrders.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '48px 32px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <History size={64} color="#e2e8f0" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: '#475569', margin: '0 0 8px 0' }}>No Past Orders</h3>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>Your completed and cancelled deliveries will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pastOrders.map(order => (
            <div key={order.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>ORDER ID</span>
                  <h4 style={{ margin: '4px 0 0 0', color: '#1e293b' }}>{order.id}</h4>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>{order.date}</p>
                </div>
                <div style={{ 
                  backgroundColor: order.status === 'Delivered' ? '#dcfce7' : '#fee2e2',
                  color: order.status === 'Delivered' ? '#166534' : '#991b1b',
                  padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  {order.status === 'Delivered' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  {order.status}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                <a 
                  href={order.deliveryDetails.lat && order.deliveryDetails.lng ? `https://www.google.com/maps/search/?api=1&query=${order.deliveryDetails.lat},${order.deliveryDetails.lng}` : '#'} 
                  target={order.deliveryDetails.lat && order.deliveryDetails.lng ? "_blank" : "_self"} 
                  rel="noopener noreferrer"
                  style={{ backgroundColor: '#e0f2fe', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <MapPin size={16} color="#0284c7" />
                </a>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>{order.deliveryDetails.name}</p>
                  <p style={{ margin: '0', fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
                    {order.deliveryDetails.city}
                  </p>
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Order Total</span>
                  <p style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: 'bold', color: '#1e293b' }}>₹{order.grandTotal}</p>
                </div>
                
                {order.status === 'Delivered' && (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Customer Rating & Review</span>
                    <div style={{ display: 'flex', gap: '2px', marginTop: '2px', justifyContent: 'flex-end' }}>
                      {order.delivery_partner_rating ? (
                        [1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={14} fill={star <= order.delivery_partner_rating ? '#eab308' : 'none'} color={star <= order.delivery_partner_rating ? '#eab308' : '#cbd5e1'} />
                        ))
                      ) : (
                        <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>Not rated yet</span>
                      )}
                    </div>
                    {order.delivery_partner_review && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569', fontStyle: 'italic', textAlign: 'right', maxWidth: '200px' }}>
                        "{order.delivery_partner_review}"
                      </p>
                    )}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
