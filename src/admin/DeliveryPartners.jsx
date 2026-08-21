import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Calendar, X, Clock, CheckCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function DeliveryPartners() {
  const [partners, setPartners] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [hubFilter, setHubFilter] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedPartner, setSelectedPartner] = useState(null);

  useEffect(() => {
    fetchHubs();
  }, []);

  useEffect(() => {
    fetchPerformance();
  }, [hubFilter, startDate, endDate]);

  const fetchHubs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/hubs');
      const data = await response.json();
      setHubs(data);
    } catch (error) {
      console.error("Error fetching hubs:", error);
    }
  };

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (hubFilter) params.append('hub_id', hubFilter);
      if (startDate) {
        // Format to YYYY-MM-DD in local time
        const startStr = startDate.toLocaleDateString('en-CA'); // en-CA outputs YYYY-MM-DD
        params.append('start_date', startStr);
        // If no end date selected yet, treat it as a single day filter
        const endStr = endDate ? endDate.toLocaleDateString('en-CA') : startStr;
        params.append('end_date', endStr);
      }

      const response = await fetch(`http://localhost:8000/api/admin/delivery-partners/performance?${params.toString()}`);
      const data = await response.json();
      setPartners(data);
    } catch (error) {
      console.error("Error fetching performance:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = partners.filter(dp => 
    dp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    dp.phone.includes(searchQuery)
  );

  return (
    <div className="admin-content" style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>Delivery Partners</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px 8px 8px 32px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', width: '220px' }}
            />
          </div>
          <select 
            value={hubFilter}
            onChange={(e) => setHubFilter(e.target.value)}
            style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
          >
            <option value="">All Hubs</option>
            {hubs.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => {
              setDateRange(update);
            }}
            isClearable={true}
            placeholderText="Filter by Date (Single or Range)"
            className="custom-date-picker"
          />
          <style>{`
            .custom-date-picker {
              padding: 8px;
              border-radius: 6px;
              border: 1px solid #cbd5e1;
              font-size: 14px;
              width: 240px;
            }
          `}</style>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading performance data...</div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f1f5f9' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#475569' }}>Partner Details</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#475569' }}>Hub</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#475569' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#475569' }}>Delivered Orders</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#475569' }}>Overall Rating</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', fontSize: '13px', color: '#475569' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No delivery partners found.</td>
                </tr>
              ) : (
                filteredPartners.map(dp => (
                  <tr key={dp.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>{dp.name}</div>
                      <div style={{ color: '#64748b', fontSize: '13px' }}>{dp.phone}</div>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} color="#64748b" /> {dp.hub_name}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {dp.status === 'Busy' ? (
                        <span style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Busy (Active Order)</span>
                      ) : (
                        <span style={{ backgroundColor: '#bbf7d0', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Free</span>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: '#0f172a' }}>
                      {dp.delivered_count}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fff7ed', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ffedd5' }}>
                        <Star size={14} fill="#ea580c" color="#ea580c" />
                        <span style={{ fontWeight: 'bold', color: '#ea580c', fontSize: '13px' }}>{dp.rating ? parseFloat(dp.rating).toFixed(1) : 'N/A'}</span>
                        <span style={{ fontSize: '11px', color: '#9a3412' }}>({dp.total_ratings})</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button 
                        onClick={() => setSelectedPartner(dp)}
                        style={{ padding: '6px 12px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedPartner && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>{selectedPartner.name}</h2>
                <div style={{ display: 'flex', gap: '16px', color: '#64748b', fontSize: '13px' }}>
                  <span>{selectedPartner.phone}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {selectedPartner.hub_name}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPartner(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={24} color="#64748b" />
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#ea580c" /> Currently Active Orders
              </h3>
              {selectedPartner.active_orders.length === 0 ? (
                <div style={{ padding: '12px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '6px', fontSize: '13px' }}>No active orders. Partner is free.</div>
              ) : (
                selectedPartner.active_orders.map(order => (
                  <div key={order.id} style={{ padding: '12px', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '6px', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold', color: '#c2410c', fontSize: '14px', marginBottom: '4px' }}>Order #{order.id}</div>
                    <div style={{ fontSize: '13px', color: '#9a3412' }}>Status: {order.status}</div>
                  </div>
                ))
              )}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: '0', fontSize: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={18} color="#16a34a" /> Delivered Orders History
                </h3>
                {(startDate || endDate) && <span style={{ fontSize: '12px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>Filtered by Date</span>}
              </div>
              
              {selectedPartner.delivered_orders.length === 0 ? (
                <div style={{ padding: '12px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '6px', fontSize: '13px' }}>No delivered orders found in this timeframe.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedPartner.delivered_orders.map(order => (
                    <div key={order.id} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '14px' }}>Order #{order.id}</span>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>{new Date(order.date).toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>Amount: ₹{order.grandTotal}</div>
                      
                      {order.delivery_partner_rating ? (
                        <div style={{ backgroundColor: '#f8fafc', padding: '8px', borderRadius: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                            <Star size={14} fill="#ea580c" color="#ea580c" />
                            <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#ea580c' }}>Customer Rating: {order.delivery_partner_rating}</span>
                          </div>
                          {order.delivery_partner_review && (
                            <div style={{ fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>"{order.delivery_partner_review}"</div>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>No customer rating provided.</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeliveryPartners;
