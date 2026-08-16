import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Edit2, CheckCircle, XCircle, ShoppingBag, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Notifications() {
  const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' or 'announcements'
  const [announcements, setAnnouncements] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();
  
  // Form State
  const [text, setText] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    fetchData();
    // Poll for new alerts every 30s
    const interval = setInterval(fetchData, 30000);
    
    const handleRefresh = () => fetchData();
    window.addEventListener('adminDataRefresh', handleRefresh);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('adminDataRefresh', handleRefresh);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [annRes, alertRes] = await Promise.all([
        fetch('http://192.168.0.112:8000/api/admin/notifications'),
        fetch('http://192.168.0.112:8000/api/admin/alerts')
      ]);
      if (annRes.ok) setAnnouncements(await annRes.json());
      if (alertRes.ok) setAlerts(await alertRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const url = editingId 
        ? `http://192.168.0.112:8000/api/admin/notifications/${editingId}`
        : 'http://192.168.0.112:8000/api/admin/notifications';
        
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, is_active: isActive }),
      });
      
      if (response.ok) {
        setIsModalOpen(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        const response = await fetch(`http://192.168.0.112:8000/api/admin/notifications/${id}`, { method: 'DELETE' });
        if (response.ok) fetchData();
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
  };

  const handleToggleActive = async (notification) => {
    try {
      const response = await fetch(`http://192.168.0.112:8000/api/admin/notifications/${notification.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: notification.text, is_active: !notification.is_active }),
      });
      if (response.ok) fetchData();
    } catch (error) {
      console.error('Error toggling notification:', error);
    }
  };

  const handleAlertClick = async (alert) => {
    if (!alert.is_read) {
      try {
        await fetch(`http://192.168.0.112:8000/api/admin/alerts/${alert.id}/read`, { method: 'PATCH' });
      } catch (e) {
        console.error(e);
      }
    }
    navigate('/admin/orders?status=Placed');
  };

  const markAllAsRead = async () => {
    try {
      await fetch('http://192.168.0.112:8000/api/admin/alerts/read_all', { method: 'PATCH' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const openEditModal = (notification) => {
    setEditingId(notification.id);
    setText(notification.text);
    setIsActive(notification.is_active === 1);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setText('');
    setIsActive(false);
  };

  if (loading && alerts.length === 0 && announcements.length === 0) {
    return <div className="admin-page-container"><div className="loading">Loading notifications...</div></div>;
  }

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bell size={28} color="var(--primary)" />
          <h1 className="admin-page-title" style={{ margin: 0 }}>Notification Center</h1>
        </div>
        {activeTab === 'announcements' && (
          <button 
            className="admin-btn-primary" 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={20} /> Add Announcement
          </button>
        )}
        {activeTab === 'alerts' && unreadCount > 0 && (
          <button 
            className="admin-btn-secondary" 
            onClick={markAllAsRead}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Check size={20} /> Mark all as read
          </button>
        )}
      </div>

      <div className="admin-tabs" style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        <button 
          onClick={() => setActiveTab('alerts')}
          style={{ 
            background: 'none', border: 'none', padding: '8px 16px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
            color: activeTab === 'alerts' ? 'var(--primary)' : '#64748b',
            borderBottom: activeTab === 'alerts' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-13px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          Order Alerts
          {unreadCount > 0 && (
            <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
              {unreadCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('announcements')}
          style={{ 
            background: 'none', border: 'none', padding: '8px 16px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
            color: activeTab === 'announcements' ? 'var(--primary)' : '#64748b',
            borderBottom: activeTab === 'announcements' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: '-13px'
          }}
        >
          Customer Announcements
        </button>
      </div>

      <div className="admin-card">
        {activeTab === 'alerts' ? (
          <div>
            {alerts.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                <Bell size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <p>No new orders yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: '#f1f5f9' }}>
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    onClick={() => handleAlertClick(alert)}
                    style={{ 
                      padding: '16px 24px', 
                      backgroundColor: alert.is_read ? 'white' : '#f0f8ff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      transition: 'background-color 0.2s ease',
                      borderLeft: alert.is_read ? '4px solid transparent' : '4px solid var(--primary)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = alert.is_read ? '#f8fafc' : '#e0f2fe'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = alert.is_read ? 'white' : '#f0f8ff'}
                  >
                    <div style={{ backgroundColor: alert.is_read ? '#f1f5f9' : '#dcfce7', padding: '12px', borderRadius: '50%' }}>
                      <ShoppingBag size={24} color={alert.is_read ? '#64748b' : 'var(--primary)'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: alert.is_read ? 'normal' : '600', color: '#1e293b' }}>
                        {alert.text}
                      </p>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {announcements.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                <Bell size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <p>No announcements created yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Announcement Text</th>
                      <th>Status</th>
                      <th>Date Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map((notif) => (
                      <tr key={notif.id}>
                        <td>#{notif.id}</td>
                        <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {notif.text}
                        </td>
                        <td>
                          <span 
                            className={`status-badge ${notif.is_active ? 'active' : 'inactive'}`}
                            style={{ 
                              cursor: 'pointer',
                              backgroundColor: notif.is_active ? '#dcfce7' : '#f1f5f9',
                              color: notif.is_active ? '#166534' : '#64748b',
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onClick={() => handleToggleActive(notif)}
                          >
                            {notif.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            {notif.is_active ? 'Active (Shown to Users)' : 'Inactive'}
                          </span>
                        </td>
                        <td>{new Date(notif.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn edit" onClick={() => openEditModal(notif)} title="Edit">
                              <Edit2 size={18} />
                            </button>
                            <button className="action-btn delete" onClick={() => handleDelete(notif.id)} title="Delete">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h2>{editingId ? 'Edit Announcement' : 'Create Announcement'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <form onSubmit={handleSave}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Announcement Text</label>
                  <textarea 
                    value={text} 
                    onChange={(e) => setText(e.target.value)} 
                    required 
                    className="admin-input" 
                    placeholder="Enter the announcement message..."
                    rows={4}
                    style={{ width: '100%', resize: 'vertical' }}
                  ></textarea>
                </div>
                
                <div className="form-group" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="isActive" 
                    checked={isActive} 
                    onChange={(e) => setIsActive(e.target.checked)} 
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="isActive" style={{ fontWeight: 'bold', cursor: 'pointer' }}>Set as Active immediately</label>
                </div>
                
                <div className="admin-modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" className="admin-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="admin-btn-primary">Save Announcement</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;
