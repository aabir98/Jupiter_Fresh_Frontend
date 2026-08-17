import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [timeframe, setTimeframe] = useState('Daily');
  
  // Custom Date Range State (default to last 30 days)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();

    const handleRefresh = () => fetchData();
    window.addEventListener('adminDataRefresh', handleRefresh);
    return () => window.removeEventListener('adminDataRefresh', handleRefresh);
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, customersRes] = await Promise.all([
        fetch('http://localhost:8000/api/orders'),
        fetch('http://localhost:8000/api/customers')
      ]);
      const ordersData = await ordersRes.json();
      const customersData = await customersRes.json();
      setOrders(ordersData);
      setCustomers(customersData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  const parseDate = (dateStr) => new Date(dateStr);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    if (!startDate || !endDate) return orders;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return orders.filter(order => {
      const d = parseDate(order.date);
      return d >= start && d <= end;
    });
  }, [orders, startDate, endDate]);

  // Daily, Weekly, Monthly Stats
  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let ordersToday = 0, salesToday = 0;
    let ordersWeek = 0, salesWeek = 0;
    let ordersMonth = 0, salesMonth = 0;

    orders.forEach(order => {
      const d = parseDate(order.date);
      const total = order.grandTotal || 0;

      if (d >= todayStart) { ordersToday++; salesToday += total; }
      if (d >= weekStart) { ordersWeek++; salesWeek += total; }
      if (d >= monthStart) { ordersMonth++; salesMonth += total; }
    });

    const totalFilteredOrders = filteredOrders.length;
    const totalFilteredSales = filteredOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);

    return {
      today: { orders: ordersToday, sales: salesToday },
      week: { orders: ordersWeek, sales: salesWeek },
      month: { orders: ordersMonth, sales: salesMonth },
      filtered: { orders: totalFilteredOrders, sales: totalFilteredSales }
    };
  }, [orders, filteredOrders]);

  // Analytics for Charts (uses filteredOrders)
  const processChartData = useMemo(() => {
    if (!filteredOrders.length) return [];
    const sorted = [...filteredOrders].sort((a, b) => parseDate(a.date) - parseDate(b.date));
    const grouped = {};

    sorted.forEach(order => {
      const dateObj = parseDate(order.date);
      if (isNaN(dateObj)) return;

      let groupKey = '';
      if (timeframe === 'Daily') {
        groupKey = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      } else if (timeframe === 'Weekly') {
        const d = new Date(dateObj);
        d.setDate(d.getDate() - d.getDay());
        groupKey = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      } else if (timeframe === 'Monthly') {
        groupKey = dateObj.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      } else if (timeframe === 'Quarterly') {
        const q = Math.floor((dateObj.getMonth() / 3));
        groupKey = `Q${q + 1} ${dateObj.getFullYear()}`;
      } else if (timeframe === 'Yearly') {
        groupKey = dateObj.getFullYear().toString();
      }

      if (!grouped[groupKey]) grouped[groupKey] = { name: groupKey, orders: 0, sales: 0 };
      grouped[groupKey].orders += 1;
      grouped[groupKey].sales += (order.grandTotal || 0);
    });

    return Object.values(grouped);
  }, [filteredOrders, timeframe]);

  // Top 10 Products by Quantity & Sales
  const { topProductsByQty, topProductsBySales } = useMemo(() => {
    const productStats = {};

    filteredOrders.forEach(order => {
      if (!order.items) return;
      order.items.forEach(item => {
        if (!productStats[item.id]) {
          productStats[item.id] = { name: item.name, qty: 0, revenue: 0 };
        }
        productStats[item.id].qty += item.qty;
        productStats[item.id].revenue += (item.qty * (item.currentPrice || item.offerPrice || item.price || 0));
      });
    });

    const arr = Object.values(productStats);
    const byQty = [...arr].sort((a, b) => b.qty - a.qty).slice(0, 10);
    const byRevenue = [...arr].sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    return { topProductsByQty: byQty, topProductsBySales: byRevenue };
  }, [filteredOrders]);

  // Top Customers by Value
  const topCustomers = useMemo(() => {
    const customerStats = {};

    filteredOrders.forEach(order => {
      let cName = "Guest User";
      if (order.deliveryDetails && order.deliveryDetails.name) {
        cName = order.deliveryDetails.name;
      }
      if (!customerStats[cName]) {
        customerStats[cName] = { name: cName, ordersCount: 0, totalValue: 0 };
      }
      customerStats[cName].ordersCount += 1;
      customerStats[cName].totalValue += (order.grandTotal || 0);
    });

    return Object.values(customerStats).sort((a, b) => b.totalValue - a.totalValue).slice(0, 10);
  }, [filteredOrders]);

  return (
    <div className="admin-page">
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h1>Dashboard Overview</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: 'white', padding: '12px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>
        </div>
      </div>
      
      <div className="admin-page-content" style={{ padding: '20px', backgroundColor: 'transparent', boxShadow: 'none' }}>
        
        {/* Quick Stats Grid */}
        <h2 style={{ fontSize: '18px', color: '#0f172a', marginBottom: '16px' }}>Performance Snapshots</h2>
        <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          
          <div className="admin-stat-card" style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#166534' }}>Today's Sales</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#15803d' }}>₹{stats.today.sales}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#166534' }}>{stats.today.orders} Orders</p>
          </div>

          <div className="admin-stat-card" style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#1e40af' }}>This Week's Sales</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1d4ed8' }}>₹{stats.week.sales}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#1e40af' }}>{stats.week.orders} Orders</p>
          </div>

          <div className="admin-stat-card" style={{ backgroundColor: '#fdf4ff', padding: '20px', borderRadius: '12px', border: '1px solid #fbcfe8' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#86198f' }}>This Month's Sales</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#a21caf' }}>₹{stats.month.sales}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#86198f' }}>{stats.month.orders} Orders</p>
          </div>

          <div className="admin-stat-card" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '2px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#475569' }}>Selected Range Sales</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>₹{stats.filtered.sales}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569' }}>{stats.filtered.orders} Orders</p>
          </div>
        </div>

        {/* Analytics Section */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Trends (Selected Range)</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>Comparing data within your selected dates.</p>
            </div>
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontWeight: 'bold', fontSize: '14px', color: '#334155', cursor: 'pointer' }}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '40px' }}>
            {/* Orders Graph */}
            <div>
              <h3 style={{ fontSize: '16px', color: '#475569', marginBottom: '16px', textAlign: 'center' }}>Orders Trend</h3>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer>
                  <LineChart data={processChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 0}} activeDot={{r: 6}} name="Orders" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales Graph */}
            <div>
              <h3 style={{ fontSize: '16px', color: '#475569', marginBottom: '16px', textAlign: 'center' }}>Sales Trend (₹)</h3>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer>
                  <LineChart data={processChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} formatter={(value) => `₹${value}`} />
                    <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 0}} activeDot={{r: 6}} name="Sales" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Top Products by Quantity */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>🔥 Top Products (By Quantity)</h3>
            {topProductsByQty.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {topProductsByQty.map((p, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed #f1f5f9' }}>
                    <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{idx + 1}. {p.name}</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a' }}>{p.qty} sold</span>
                  </li>
                ))}
              </ul>
            ) : <p style={{ fontSize: '14px', color: '#64748b' }}>No data for selected range.</p>}
          </div>

          {/* Top Products by Sales */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>💰 Top Products (By Sales)</h3>
            {topProductsBySales.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {topProductsBySales.map((p, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed #f1f5f9' }}>
                    <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{idx + 1}. {p.name}</span>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#16a34a' }}>₹{p.revenue}</span>
                  </li>
                ))}
              </ul>
            ) : <p style={{ fontSize: '14px', color: '#64748b' }}>No data for selected range.</p>}
          </div>

          {/* Top Customers */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>👑 Most Valuable Customers</h3>
            {topCustomers.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {topCustomers.map((c, idx) => (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px dashed #f1f5f9' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{idx + 1}. {c.name}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{c.ordersCount} orders</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#0284c7' }}>₹{c.totalValue}</span>
                  </li>
                ))}
              </ul>
            ) : <p style={{ fontSize: '14px', color: '#64748b' }}>No data for selected range.</p>}
          </div>

        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
