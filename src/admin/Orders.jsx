import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { generateInvoice } from '../utils/generateInvoice';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [location.search]);

  useEffect(() => {
    fetchOrders();

    const handleRefresh = () => fetchOrders();
    window.addEventListener('adminDataRefresh', handleRefresh);
    return () => window.removeEventListener('adminDataRefresh', handleRefresh);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://192.168.0.112:8000/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };


  const deleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to permanently delete this order?")) {
      try {
        const response = await fetch(`http://192.168.0.112:8000/api/orders/${orderId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setOrders(orders.filter(o => o.id !== orderId));
        } else {
          alert("Failed to delete order");
        }
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("Network error. Please try again.");
      }
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Delivered') return { bg: '#dcfce7', text: '#16a34a' };
    if (status === 'Picked Up') return { bg: '#fef9c3', text: '#ca8a04' };
    return { bg: '#f0f8ff', text: 'var(--primary-green)' };
  };

  const filteredOrders = orders.filter(order => {
    // Search match
    const phoneMatch = order.deliveryDetails?.phone?.includes(searchQuery) || order.userPhone?.includes(searchQuery);
    const idMatch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const nameMatch = order.deliveryDetails?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = !searchQuery || phoneMatch || idMatch || nameMatch;

    // Status match
    const currentStatus = order.status || 'Placed';
    const matchesStatus = statusFilter === 'All' || currentStatus === statusFilter;

    // Date match
    let matchesDate = true;
    if (dateFilter) {
      const filterDateObj = new Date(dateFilter);
      const filterDateString = filterDateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      matchesDate = order.date.includes(filterDateString);
    }

    // Rating match
    const matchesRating = ratingFilter === 'All' || order.rating === parseInt(ratingFilter);

    return matchesSearch && matchesStatus && matchesDate && matchesRating;
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'stretch' }}>
        <h1 style={{ margin: 0 }}>Orders</h1>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Search by ID, Name or Phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', flex: '1', minWidth: '200px', fontSize: '14px' }}
          />
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontSize: '14px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Placed">Placed</option>
            <option value="Picked Up">Picked Up</option>
            <option value="Delivered">Delivered</option>
          </select>
          
          <select 
            value={ratingFilter} 
            onChange={(e) => setRatingFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontSize: '14px' }}
          >
            <option value="All">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          
          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontSize: '14px' }}
          />
          
          {(searchQuery || statusFilter !== 'All' || dateFilter || ratingFilter !== 'All') && (
            <button 
              onClick={() => { setSearchQuery(''); setStatusFilter('All'); setDateFilter(''); setRatingFilter('All'); }}
              style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div className="admin-page-content" style={{ padding: '20px' }}>
        {loading ? (
          <p>Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-placeholder-box">
            <p>No orders match your filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {filteredOrders.map(order => (
              <div key={order.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a' }}>{order.id}</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{order.date}</p>
                  </div>
                  <span style={{ 
                    backgroundColor: getStatusColor(order.status).bg, 
                    color: getStatusColor(order.status).text, 
                    padding: '4px 12px', 
                    borderRadius: '16px', 
                    fontSize: '12px', 
                    fontWeight: '700' 
                  }}>
                    {order.status || 'Placed'}
                  </span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#334155' }}>Customer Details</h4>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#475569' }}><strong>Name:</strong> {order.deliveryDetails?.name || 'N/A'}</p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#475569' }}><strong>Phone:</strong> +91 {order.deliveryDetails?.phone || order.userPhone || 'N/A'}</p>
                  <div style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#475569' }}>
                    <strong>Address:</strong> 
                    {order.deliveryDetails?.street ? (
                      <div style={{ marginLeft: '8px', marginTop: '4px', lineHeight: '1.4' }}>
                        {order.deliveryDetails?.building && <>{order.deliveryDetails.building},<br/></>}
                        {order.deliveryDetails?.street},<br/>
                        {order.deliveryDetails?.locality && <>{order.deliveryDetails.locality},<br/></>}
                        {order.deliveryDetails?.landmark && <>Landmark: {order.deliveryDetails.landmark}<br/></>}
                        {order.deliveryDetails?.city}, {order.deliveryDetails?.state}
                      </div>
                    ) : (
                      <span> {order.deliveryDetails?.address || 'N/A'} {order.deliveryDetails?.landmark ? `(${order.deliveryDetails.landmark})` : ''}</span>
                    )}
                  </div>
                  {order.deliveryDetails?.lat && order.deliveryDetails?.lng && (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${order.deliveryDetails.lat},${order.deliveryDetails.lng}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ display: 'inline-block', marginTop: '8px', padding: '6px 12px', backgroundColor: '#e0f2fe', color: '#0369a1', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', fontSize: '12px' }}
                    >
                      📍 View on Google Maps
                    </a>
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#334155' }}>Items</h4>
                  {order.items && order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>
                      <span>{item.qty}x {item.name}</span>
                      <span style={{ fontWeight: '600' }}>₹{item.currentPrice * item.qty}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                    <span style={{ color: '#475569', fontSize: '13px' }}>Delivery Charge</span>
                    <span style={{ fontWeight: '600', color: '#475569', fontSize: '13px' }}>₹{order.deliveryDetails?.deliveryFee || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>Grand Total</span>
                    <span style={{ fontWeight: '800', color: 'var(--primary-green)', fontSize: '15px' }}>₹{order.grandTotal}</span>
                  </div>
                </div>

                {order.rating && (
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
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  {order.status === 'Delivered' && (
                    <button 
                      onClick={() => generateInvoice(order)}
                      style={{ flex: 1, backgroundColor: 'white', color: 'var(--primary-green)', border: '1px solid var(--primary-green)', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      Download Invoice
                    </button>
                  )}
                  <button 
                    onClick={() => deleteOrder(order.id)}
                    style={{ flex: 1, backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #ef4444', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    Delete Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
