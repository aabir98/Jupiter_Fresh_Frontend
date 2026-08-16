import sys
import os

filepath = "src/admin/Orders.jsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

target_review = """                {order.rating && (
                  <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#334155' }}>Customer Review</h4>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} style={{ color: star <= order.rating ? '#eab308' : '#cbd5e1', fontSize: '16px' }}>★</span>
                      ))}
                    </div>
                    {order.review && <p style={{ margin: '0', fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>"{order.review}"</p>}
                  </div>
                )}"""

replacement_review = """                {order.rating && (
                  <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#334155' }}>Customer Review</h4>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} style={{ color: star <= order.rating ? '#eab308' : '#cbd5e1', fontSize: '16px' }}>★</span>
                      ))}
                    </div>
                    {order.review && <p style={{ margin: '0', fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>"{order.review}"</p>}
                  </div>
                )}
                
                {order.dp_name && (
                  <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#e0f2fe', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#0369a1' }}>Delivery Partner</h4>
                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#0c4a6e', fontWeight: 'bold' }}>{order.dp_name}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#0c4a6e' }}>Phone: {order.dp_phone}</p>
                    {order.eta && <p style={{ margin: '0', fontSize: '13px', color: '#0c4a6e', fontWeight: 'bold' }}>ETA: {order.eta}</p>}
                    {order.delivery_partner_rating && (
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#0c4a6e' }}>Customer Rated DP: {order.delivery_partner_rating} ★</p>
                    )}
                  </div>
                )}"""

if target_review in content:
    content = content.replace(target_review, replacement_review)
    print("Successfully added Delivery Partner info to Orders.jsx")
else:
    print("Could not find review block in Orders.jsx")


with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("Successfully updated Orders.jsx")
