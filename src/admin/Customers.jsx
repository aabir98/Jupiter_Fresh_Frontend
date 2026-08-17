import React, { useState, useEffect } from 'react';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();

    const handleRefresh = () => fetchCustomers();
    window.addEventListener('adminDataRefresh', handleRefresh);
    return () => window.removeEventListener('adminDataRefresh', handleRefresh);
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerClick = async (customer) => {
    setSelectedCustomer(customer);
    setOrdersLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/orders/user/${customer.phone}`);
      const data = await response.json();
      setCustomerOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const closeOrdersModal = () => {
    setSelectedCustomer(null);
    setCustomerOrders([]);
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone?.includes(searchQuery)
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'stretch' }}>
        <h1 style={{ margin: 0 }}>Customers</h1>
        <input 
          type="text" 
          placeholder="Search customers by name, email, or phone..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', width: '100%', maxWidth: '400px' }}
        />
      </div>
      <div className="admin-page-content" style={{ padding: '20px' }}>
        {loading ? (
          <p>Loading customers...</p>
        ) : filteredCustomers.length === 0 ? (
          <div className="admin-placeholder-box">
            <p>No customers match your search.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredCustomers.map(customer => (
              <div 
                key={customer.email} 
                onClick={() => handleCustomerClick(customer)}
                style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--light-green)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '16px', overflow: 'hidden' }}>
                  {customer.picture ? (
                    <img src={customer.picture} alt={customer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontWeight: 'bold' }}>{customer.name ? customer.name.charAt(0).toUpperCase() : '?'}</span>
                  )}
                </div>
                
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>{customer.name}</h3>
                
                <div style={{ width: '100%', textAlign: 'left', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Email:</strong> 
                    <span style={{ wordBreak: 'break-all', maxWidth: '180px', textAlign: 'right' }}>{customer.email}</span>
                  </p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Phone:</strong> 
                    <span>+91 {customer.phone}</span>
                  </p>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Total Orders:</strong> 
                    <span style={{ backgroundColor: 'var(--light-green)', color: 'var(--primary-green)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{customer.orderCount || 0}</span>
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                    <strong>Joined:</strong> 
                    <span>{new Date(customer.joinedDate).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Customer Orders Modal */}
      {selectedCustomer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={closeOrdersModal}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>Orders for {selectedCustomer.name}</h2>
              <button onClick={closeOrdersModal} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>
            
            {ordersLoading ? (
              <p>Loading orders...</p>
            ) : customerOrders.length === 0 ? (
              <p>No orders found for this customer.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {customerOrders.map(order => (
                  <div key={order.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{order.id}</span>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>{order.date}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                          <span>{item.qty}x {item.name}</span>
                          <span style={{ fontWeight: '600' }}>₹{item.currentPrice * item.qty}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontWeight: 'bold' }}>
                      <span style={{ fontSize: '13px' }}>Status: <span style={{ color: order.status === 'Delivered' ? '#16a34a' : order.status === 'Picked Up' ? '#ca8a04' : 'var(--primary-green)' }}>{order.status || 'Placed'}</span></span>
                      <span style={{ color: '#0f172a' }}>Total: ₹{order.grandTotal}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
