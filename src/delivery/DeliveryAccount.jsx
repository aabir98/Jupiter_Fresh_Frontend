import React, { useState, useEffect } from 'react';
import { User, Phone, LogOut, Edit2, Check, X, Star, Home } from 'lucide-react';

export default function DeliveryAccount({ user, setUser, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [saving, setSaving] = useState(false);
  const [hubName, setHubName] = useState('Loading...');

  // Fetch latest user data when Account tab mounts to get fresh ratings
  useEffect(() => {
    fetch(`http://localhost:8000/api/delivery-personnel/${user.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.id && (data.rating !== user.rating || data.total_ratings !== user.total_ratings)) {
          setUser(prev => ({...prev, ...data}));
        }
      })
      .catch(console.error);
  }, [user.id, setUser]);

  useEffect(() => {
    if (user.hub_id) {
      fetch('http://localhost:8000/api/hubs')
        .then(res => res.json())
        .then(data => {
          const hub = data.find(h => h.id === user.hub_id);
          if (hub) setHubName(hub.name);
          else setHubName('Unknown Hub');
        })
        .catch(err => {
          console.error(err);
          setHubName('Unknown Hub');
        });
    }
  }, [user.hub_id]);

  const handleSave = async () => {
    if (!name || !phone) {
      alert("Name and phone cannot be empty.");
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:8000/api/delivery-personnel/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone })
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setIsEditing(false);
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user.name || '');
    setPhone(user.phone || '');
    setIsEditing(false);
  };

  return (
    <div>
      <h2 style={{ fontSize: '24px', color: '#1e293b', margin: '0 0 24px 0', fontWeight: '800' }}>Account</h2>
      
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <img src={user.picture} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '16px', border: '4px solid #f0fdf4' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fef9c3', color: '#a16207', padding: '6px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
            <Star size={16} fill="#eab308" color="#eab308" />
            {user.rating.toFixed(1)} Rating
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#334155' }}>Personal Details</h3>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
              <Edit2 size={14} /> Edit
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Full Name</label>
            {isEditing ? (
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--primary-green)', borderRadius: '8px', padding: '8px 12px' }}>
                <User size={16} color="var(--primary-green)" style={{ marginRight: '8px' }} />
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} color="#64748b" />
                <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: '500' }}>{user.name}</span>
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Email Address</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', color: '#64748b' }}>{user.email}</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Phone Number</label>
            {isEditing ? (
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--primary-green)', borderRadius: '8px', padding: '8px 12px' }}>
                <Phone size={16} color="var(--primary-green)" style={{ marginRight: '8px' }} />
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  style={{ border: 'none', outline: 'none', width: '100%', fontSize: '14px' }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="#64748b" />
                <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: '500' }}>{user.phone}</span>
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Assigned Hub</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Home size={16} color="#64748b" />
              <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: '500' }}>{hubName}</span>
            </div>
          </div>
        </div>

        {isEditing && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button 
              onClick={handleCancel}
              style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
            >
              <X size={16} /> Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              style={{ flex: 1, backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', opacity: saving ? 0.7 : 1 }}
            >
              <Check size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <button 
        onClick={onLogout}
        style={{ width: '100%', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontSize: '15px' }}
      >
        <LogOut size={18} /> Logout securely
      </button>

    </div>
  );
}
