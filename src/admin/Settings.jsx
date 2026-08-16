import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

function Settings() {
  const [minOrder, setMinOrder] = useState('99');
  const [deliveryCharge, setDeliveryCharge] = useState('10');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://192.168.0.112:8000/api/settings');
      if (response.ok) {
        const data = await response.json();
        const minOrderSetting = data.find(s => s.key === 'MIN_ORDER_FOR_FREE_DELIVERY');
        const deliveryChargeSetting = data.find(s => s.key === 'DELIVERY_CHARGE');
        
        if (minOrderSetting) setMinOrder(minOrderSetting.value);
        if (deliveryChargeSetting) setDeliveryCharge(deliveryChargeSetting.value);
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        fetch('http://192.168.0.112:8000/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'MIN_ORDER_FOR_FREE_DELIVERY', value: minOrder })
        }),
        fetch('http://192.168.0.112:8000/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'DELIVERY_CHARGE', value: deliveryCharge })
        })
      ]);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading settings...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 style={{ margin: 0 }}>Global Settings</h1>
      </div>
      
      <div className="admin-page-content" style={{ padding: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px', color: '#1e293b' }}>Delivery Configuration</h3>
          
          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>
                Minimum Order for Free Delivery (₹)
              </label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px' }}
                required
              />
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b' }}>
                Orders below this amount will be charged the delivery fee.
              </p>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#475569' }}>
                Delivery Charge (₹)
              </label>
              <input
                type="number"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px' }}
                required
              />
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b' }}>
                Fee applied to orders below the minimum order value.
              </p>
            </div>
            
            <button 
              type="submit" 
              disabled={saving}
              style={{
                backgroundColor: 'var(--primary-green)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '16px'
              }}
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;
