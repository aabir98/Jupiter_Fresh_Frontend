import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { generateInvoice } from '../utils/generateInvoice';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [hubFilter, setHubFilter] = useState('All');

  // Manual Assign State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignOrderId, setAssignOrderId] = useState(null);
  const [assignHubId, setAssignHubId] = useState(null);
  const [deliveryPersonnel, setDeliveryPersonnel] = useState([]);
  const [selectedDpId, setSelectedDpId] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [location.search]);

  useEffect(() => {
    fetchOrders();
    fetchHubs();

    const handleRefresh = () => {
      fetchOrders();
      fetchHubs();
    };
    window.addEventListener('adminDataRefresh', handleRefresh);
    return () => window.removeEventListener('adminDataRefresh', handleRefresh);
  }, []);

  const fetchHubs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/hubs');
      const data = await response.json();
      setHubs(data);
    } catch (error) {
      console.error("Error fetching hubs:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = async (orderId, hubId) => {
    setAssignOrderId(orderId);
    setAssignHubId(hubId);
    setAssignModalOpen(true);
    setSelectedDpId('');
    try {
      const response = await fetch(`http://localhost:8000/api/delivery-personnel/hub/${hubId}`);
      if (response.ok) {
        const data = await response.json();
        setDeliveryPersonnel(data);
      }
    } catch (error) {
      console.error("Error fetching delivery personnel:", error);
    }
  };

  const handleManualAssign = async () => {
    if (!selectedDpId) return;
    try {
      const response = await fetch(`http://localhost:8000/api/orders/${assignOrderId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_partner_id: parseInt(selectedDpId) })
      });
      if (response.ok) {
        setAssignModalOpen(false);
        fetchOrders();
      } else {
        alert("Failed to assign order");
      }
    } catch (error) {
      console.error("Error assigning order:", error);
    }
  };


  const deleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to permanently delete this order?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/orders/${orderId}`, {
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
    if (status === 'Arrived') return { bg: '#ccfbf1', text: '#0d9488' };
    if (status === 'On the way') return { bg: '#e0e7ff', text: '#4338ca' };
    if (status === 'On the way to Hub') return { bg: '#ffedd5', text: '#c2410c' };
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

    // Hub match
    const matchesHub = hubFilter === 'All' || order.hub_id === parseInt(hubFilter);

    return matchesSearch && matchesStatus && matchesDate && matchesRating && matchesHub;
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
            <option value="On the way to Hub">On the way to Hub</option>
            <option value="On the way">On the way</option>
            <option value="Arrived">Arrived</option>
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
          
          <select 
            value={hubFilter} 
            onChange={(e) => setHubFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontSize: '14px' }}
          >
            <option value="All">All Hubs</option>
            {hubs.map(hub => (
              <option key={hub.id} value={hub.id}>{hub.name}</option>
            ))}
          </select>

          <input 
            type="date" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', fontSize: '14px' }}
          />
          
          {(searchQuery || statusFilter !== 'All' || dateFilter || ratingFilter !== 'All' || hubFilter !== 'All') && (
            <button 
              onClick={() => { setSearchQuery(''); setStatusFilter('All'); setDateFilter(''); setRatingFilter('All'); setHubFilter('All'); }}
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
                  {order.hub_name && (
                    <div style={{ margin: '8px 0 4px 0', fontSize: '13px', color: '#475569' }}>
                      <strong>Assigned Hub:</strong> {order.hub_name}
                    </div>
                  )}
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
                
                {order.dp_name ? (
                  <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#e0f2fe', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#0369a1' }}>Delivery Partner</h4>
                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#0c4a6e', fontWeight: 'bold' }}>{order.dp_name}</p>
                    <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#0c4a6e' }}>Phone: {order.dp_phone}</p>
                    {order.eta && <p style={{ margin: '0', fontSize: '13px', color: '#0c4a6e', fontWeight: 'bold' }}>ETA: {order.eta}</p>}
                    {order.delivery_partner_rating && (
                      <div>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#0c4a6e', fontWeight: 'bold' }}>Customer Rated DP: {order.delivery_partner_rating} ★</p>
                        {order.delivery_partner_review && (
                          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#0369a1', fontStyle: 'italic' }}>Review: "{order.delivery_partner_review}"</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid #ffedd5' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#c2410c' }}>Delivery Partner</h4>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#ea580c', fontWeight: 'bold' }}>Not Assigned (In Queue)</p>
                    <button 
                      onClick={() => openAssignModal(order.id, order.hub_id)}
                      style={{ padding: '6px 12px', backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      Assign Manually
                    </button>
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

      {assignModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ margin: '0 0 16px', color: '#0f172a' }}>Manual Assignment</h3>
            <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#475569' }}>Select a delivery partner for Order #{assignOrderId}. This will override their current workload limit.</p>
            <select 
              value={selectedDpId}
              onChange={(e) => setSelectedDpId(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="">-- Select Delivery Partner --</option>
              {deliveryPersonnel.map(dp => (
                <option key={dp.id} value={dp.id}>
                  {dp.name} ({dp.phone}) - Rating: {dp.rating ? parseFloat(dp.rating).toFixed(1) : 'N/A'} ★
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setAssignModalOpen(false)}
                style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleManualAssign}
                disabled={!selectedDpId}
                style={{ padding: '8px 16px', backgroundColor: selectedDpId ? '#f97316' : '#fdba74', color: 'white', border: 'none', borderRadius: '4px', cursor: selectedDpId ? 'pointer' : 'not-allowed' }}
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
