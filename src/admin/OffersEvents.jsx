import React, { useState, useEffect } from 'react';
import AddressMap from '../components/AddressMap';

function OffersEvents() {
  const [activeTab, setActiveTab] = useState('Offers');
  const tabs = ['Offers', 'Announcements', 'Banners', 'Reviews', 'Hub Management'];

  // Offers State
  const [offers, setOffers] = useState([]);
  const [first20Active, setFirst20Active] = useState(true);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerForm, setOfferForm] = useState({ code: '', event_name: '', discount_percent: '', valid_until: '' });

  // Announcements State
  const [announcements, setAnnouncements] = useState([]);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementText, setAnnouncementText] = useState('');

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ customer_name: '', rating: 5, text: '', is_featured: false });

  // Banners State
  const [banners, setBanners] = useState([]);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerFile, setBannerFile] = useState(null);

  // Hubs State
  const [hubs, setHubs] = useState([]);
  const [isHubModalOpen, setIsHubModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState(null);
  const [hubForm, setHubForm] = useState({ name: '', lat: 22.5726, lng: 88.3639, radius_km: 18, is_active: true });

  useEffect(() => {
    if (activeTab === 'Offers') {
      fetchOffers();
      fetchSettings();
    } else if (activeTab === 'Announcements') {
      fetchAnnouncements();
    } else if (activeTab === 'Reviews') {
      fetchReviews();
    } else if (activeTab === 'Banners') {
      fetchBanners();
    } else if (activeTab === 'Hub Management') {
      fetchHubs();
    }
  }, [activeTab]);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/announcements');
      if (response.ok) {
        setAnnouncements(await response.json());
      }
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/reviews');
      if (response.ok) {
        setReviews(await response.json());
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/banners');
      if (response.ok) {
        setBanners(await response.json());
      }
    } catch (err) {
      console.error('Failed to fetch banners:', err);
    }
  };

  const fetchHubs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/hubs');
      if (response.ok) {
        setHubs(await response.json());
      }
    } catch (err) {
      console.error('Failed to fetch hubs:', err);
    }
  };

  const handleSaveHub = async (e) => {
    e.preventDefault();
    const url = editingHub ? `http://localhost:8000/api/hubs/${editingHub.id}` : 'http://localhost:8000/api/hubs';
    const method = editingHub ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hubForm)
      });
      if (response.ok) {
        fetchHubs();
        closeHubModal();
      } else {
        alert('Failed to save hub');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving hub');
    }
  };

  const handleDeleteHub = async (id) => {
    if (window.confirm("Delete this hub?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/hubs/${id}`, { method: 'DELETE' });
        if (response.ok) fetchHubs();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const closeHubModal = () => {
    setIsHubModalOpen(false);
    setEditingHub(null);
    setHubForm({ name: '', lat: 22.5726, lng: 88.3639, radius_km: 18, is_active: true });
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/settings');
      if (response.ok) {
        const data = await response.json();
        const f20 = data.find(s => s.key === 'FIRST20_ACTIVE');
        if (f20) {
          setFirst20Active(f20.value === 'true');
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  const toggleFirst20 = async () => {
    const newVal = !first20Active;
    try {
      const response = await fetch('http://localhost:8000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'FIRST20_ACTIVE', value: newVal.toString() })
      });
      if (response.ok) {
        setFirst20Active(newVal);
      }
    } catch (err) {
      console.error('Failed to update setting:', err);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/offers');
      if (response.ok) {
        const data = await response.json();
        setOffers(data);
      }
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    }
  };

  const handleSaveOffer = async (e) => {
    e.preventDefault();
    const isNewOffer = !editingOffer;
    const url = editingOffer ? `http://localhost:8000/api/offers/${editingOffer.id}` : 'http://localhost:8000/api/offers';
    const method = editingOffer ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offerForm)
      });
      if (response.ok) {
        if (isNewOffer) {
          const promoText = `${offerForm.code} - ${offerForm.event_name} - Get ${offerForm.discount_percent}% OFF!`;
          
          // Set as announcement
          await fetch('http://localhost:8000/api/announcements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: promoText })
          });
          
          // Send notification
          await fetch('http://localhost:8000/api/admin/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: promoText, is_active: true })
          });

          await fetchAnnouncements();
        }

        fetchOffers();
        closeOfferModal();
      } else {
        alert('Failed to save offer');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving offer');
    }
  };

  const handleDeleteOffer = async (id) => {
    if (window.confirm("Delete this offer?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/offers/${id}`, { method: 'DELETE' });
        if (response.ok) fetchOffers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openOfferModal = (offer = null) => {
    if (offer) {
      setEditingOffer(offer);
      setOfferForm(offer);
    } else {
      setEditingOffer(null);
      setOfferForm({ code: '', event_name: '', discount_percent: '', valid_until: '' });
    }
    setIsOfferModalOpen(true);
  };

  const closeOfferModal = () => {
    setIsOfferModalOpen(false);
    setEditingOffer(null);
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    const url = editingAnnouncement ? `http://localhost:8000/api/announcements/${editingAnnouncement.id}` : 'http://localhost:8000/api/announcements';
    const method = editingAnnouncement ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: announcementText })
      });
      if (response.ok) {
        fetchAnnouncements();
        closeAnnouncementModal();
      }
    } catch (err) {
      console.error(err);
      alert('Error saving announcement');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm("Delete this announcement?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/announcements/${id}`, { method: 'DELETE' });
        if (response.ok) fetchAnnouncements();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openAnnouncementModal = (ann = null) => {
    if (ann) {
      setEditingAnnouncement(ann);
      setAnnouncementText(ann.text);
    } else {
      setEditingAnnouncement(null);
      setAnnouncementText('');
    }
    setIsAnnouncementModalOpen(true);
  };

  const closeAnnouncementModal = () => {
    setIsAnnouncementModalOpen(false);
    setEditingAnnouncement(null);
    setAnnouncementText('');
  };

  // --- REVIEWS HANDLERS ---
  const handleSaveReview = async (e) => {
    e.preventDefault();
    const url = editingReview ? `http://localhost:8000/api/reviews/${editingReview.id}` : 'http://localhost:8000/api/reviews';
    const method = editingReview ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      });
      if (response.ok) {
        fetchReviews();
        closeReviewModal();
      }
    } catch (err) {
      console.error(err);
      alert('Error saving review');
    }
  };

  const handleToggleFeatured = async (review) => {
    try {
      const response = await fetch(`http://localhost:8000/api/reviews/${review.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...review, is_featured: review.is_featured ? 0 : 1 })
      });
      if (response.ok) fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm("Delete this review?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/reviews/${id}`, { method: 'DELETE' });
        if (response.ok) fetchReviews();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openReviewModal = (rev = null) => {
    if (rev) {
      setEditingReview(rev);
      setReviewForm({ customer_name: rev.customer_name, rating: rev.rating, text: rev.text, is_featured: !!rev.is_featured });
    } else {
      setEditingReview(null);
      setReviewForm({ customer_name: '', rating: 5, text: '', is_featured: false });
    }
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setEditingReview(null);
  };

  // --- BANNERS HANDLERS ---
  const handleBannerUpload = async (e) => {
    e.preventDefault();
    if (!bannerFile) return;

    const formData = new FormData();
    formData.append('image', bannerFile);

    try {
      const response = await fetch('http://localhost:8000/api/banners', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        fetchBanners();
        setIsBannerModalOpen(false);
        setBannerFile(null);
      } else {
        alert('Failed to upload banner');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading banner');
    }
  };

  const handleToggleBannerApproved = async (banner) => {
    try {
      const response = await fetch(`http://localhost:8000/api/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: !banner.is_approved })
      });
      if (response.ok) fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (window.confirm("Delete this banner?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/banners/${id}`, { method: 'DELETE' });
        if (response.ok) fetchBanners();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 style={{ margin: 0 }}>Offers & Events</h1>
      </div>
      
      <div className="admin-page-content" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                backgroundColor: activeTab === tab ? 'var(--primary-green)' : 'transparent',
                color: activeTab === tab ? 'white' : '#64748b',
                border: activeTab === tab ? 'none' : '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', minHeight: '300px', overflowX: 'hidden' }}>
          {activeTab === 'Offers' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ margin: 0, color: '#334155' }}>Manage Offers (Coupons)</h2>
                <button onClick={() => openOfferModal()} style={{ padding: '10px 20px', backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  + Add New Offer
                </button>
              </div>

              {/* FIRST20 Toggle */}
              <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a' }}>FIRST20 (Welcome Bonus)</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Applies a 20% discount for the user's first 2 orders.</p>
                </div>
                <button 
                  onClick={toggleFirst20} 
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: first20Active ? '#22c55e' : '#ef4444', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '20px', 
                    fontWeight: 'bold', 
                    cursor: 'pointer',
                    minWidth: '80px',
                    flexShrink: 0
                  }}
                >
                  {first20Active ? 'ON' : 'OFF'}
                </button>
              </div>

              {offers.length === 0 ? (
                <p style={{ color: '#64748b' }}>No active offers found. Create one!</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {offers.map(offer => (
                    <div key={offer.id} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', backgroundColor: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'var(--primary-green)' }}>{offer.code}</h3>
                          <span style={{ fontSize: '12px', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', color: '#475569', fontWeight: 'bold' }}>{offer.event_name}</span>
                        </div>
                        <span style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{offer.discount_percent}%</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                        <strong>Valid Until:</strong> {new Date(offer.valid_until).toLocaleDateString()}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => openOfferModal(offer)} style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>Edit</button>
                        <button onClick={() => handleDeleteOffer(offer.id)} style={{ flex: 1, padding: '8px', border: 'none', backgroundColor: '#fee2e2', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#b91c1c' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'Announcements' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ margin: 0, color: '#334155' }}>Manage Announcements</h2>
                <button onClick={() => openAnnouncementModal()} style={{ padding: '10px 20px', backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  + Add Announcement
                </button>
              </div>

              {announcements.length === 0 ? (
                <p style={{ color: '#64748b' }}>No active announcements found. Create one!</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {announcements.map(ann => (
                    <div key={ann.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', backgroundColor: '#f8fafc' }}>
                      <div style={{ fontSize: '16px', color: '#0f172a', flex: 1, marginRight: '16px' }}>
                        {ann.text}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => openAnnouncementModal(ann)} style={{ padding: '8px 16px', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>Edit</button>
                        <button onClick={() => handleDeleteAnnouncement(ann.id)} style={{ padding: '8px 16px', border: 'none', backgroundColor: '#fee2e2', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#b91c1c' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'Reviews' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ margin: 0, color: '#334155' }}>Manage Reviews</h2>
                <button onClick={() => openReviewModal()} style={{ padding: '10px 20px', backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  + Add Dummy Review
                </button>
              </div>

              {reviews.length === 0 ? (
                <p style={{ color: '#64748b' }}>No reviews found.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {reviews.map(rev => (
                    <div key={rev.id} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a' }}>{rev.customer_name}</h3>
                          <div style={{ display: 'flex', color: '#eab308', fontSize: '14px' }}>
                            {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                          </div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                          <input type="checkbox" checked={!!rev.is_featured} onChange={() => handleToggleFeatured(rev)} />
                          Featured
                        </label>
                      </div>
                      
                      <p style={{ fontSize: '14px', color: '#475569', fontStyle: 'italic', margin: '8px 0', flex: 1 }}>
                        "{rev.text}"
                      </p>
                      
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button onClick={() => openReviewModal(rev)} style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>Edit</button>
                        <button onClick={() => handleDeleteReview(rev.id)} style={{ flex: 1, padding: '8px', border: 'none', backgroundColor: '#fee2e2', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#b91c1c' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'Banners' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ margin: 0, color: '#334155' }}>Manage Banners</h2>
                <button onClick={() => setIsBannerModalOpen(true)} style={{ padding: '10px 20px', backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  + Upload Banner
                </button>
              </div>
              <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '20px', fontWeight: '500' }}>
                ⚠️ Please upload banners with a resolution of 300px (width) x 150px (height) for best results.
              </p>

              {banners.length === 0 ? (
                <p style={{ color: '#64748b' }}>No banners uploaded yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                  {banners.map(banner => (
                    <div key={banner.id} style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '16px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
                      <img src={`http://localhost:8000${banner.image}`} alt="Banner" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px', border: '1px solid #e2e8f0' }} />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>
                          <input type="checkbox" checked={!!banner.is_approved} onChange={() => handleToggleBannerApproved(banner)} style={{ width: '18px', height: '18px' }} />
                          Feature on App
                        </label>
                        <button onClick={() => handleDeleteBanner(banner.id)} style={{ padding: '8px 16px', border: 'none', backgroundColor: '#fee2e2', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#b91c1c' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'Hub Management' ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ margin: 0, color: '#334155' }}>Hub Management</h2>
                <button 
                  onClick={() => setIsHubModalOpen(true)} 
                  style={{ padding: '10px 20px', backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  + Add New Hub
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {hubs.map(hub => (
                  <div key={hub.id} style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, color: '#1e293b' }}>{hub.name}</h3>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                        backgroundColor: hub.is_active ? '#dcfce7' : '#f1f5f9',
                        color: hub.is_active ? '#16a34a' : '#64748b'
                      }}>
                        {hub.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>
                      <p style={{ margin: '4px 0' }}><strong>Radius:</strong> {hub.radius_km} km</p>
                      <p style={{ margin: '4px 0' }}><strong>Coordinates:</strong> {hub.lat.toFixed(4)}, {hub.lng.toFixed(4)}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => { setEditingHub(hub); setHubForm(hub); setIsHubModalOpen(true); }}
                        style={{ flex: 1, padding: '8px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#334155' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteHub(hub.id)}
                        style={{ flex: 1, padding: '8px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#ef4444' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {hubs.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                    <p style={{ color: '#64748b', margin: 0 }}>No hubs found. Add your first delivery hub!</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ marginTop: 0, color: '#334155' }}>{activeTab} Management</h2>
              <p style={{ color: '#64748b' }}>{activeTab} functionality will be implemented in the future.</p>
            </div>
          )}
        </div>
      </div>

      {isOfferModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>{editingOffer ? 'Edit Offer' : 'Add New Offer'}</h2>
            <form onSubmit={handleSaveOffer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Coupon Code (e.g., DIWALI50)</label>
                <input required type="text" value={offerForm.code} onChange={e => setOfferForm({...offerForm, code: e.target.value.toUpperCase()})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Event Name</label>
                <input required type="text" value={offerForm.event_name} onChange={e => setOfferForm({...offerForm, event_name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Discount Percentage (%)</label>
                <input required type="number" min="1" max="100" value={offerForm.discount_percent} onChange={e => setOfferForm({...offerForm, discount_percent: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Valid Until</label>
                <input required type="date" value={offerForm.valid_until} onChange={e => setOfferForm({...offerForm, valid_until: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={closeOfferModal} style={{ flex: 1, padding: '12px', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', border: 'none', backgroundColor: 'var(--primary-green)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAnnouncementModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>{editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}</h2>
            <form onSubmit={handleSaveAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Announcement Text</label>
                <input required type="text" placeholder="e.g. 🎉 Free delivery above Rs 99/-" value={announcementText} onChange={e => setAnnouncementText(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={closeAnnouncementModal} style={{ flex: 1, padding: '12px', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', border: 'none', backgroundColor: 'var(--primary-green)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isReviewModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>{editingReview ? 'Edit Review' : 'Add Dummy Review'}</h2>
            <form onSubmit={handleSaveReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Customer Name</label>
                <input required type="text" value={reviewForm.customer_name} onChange={e => setReviewForm({...reviewForm, customer_name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Rating (1-5)</label>
                <input required type="number" min="1" max="5" value={reviewForm.rating} onChange={e => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Review Text</label>
                <textarea required rows="4" value={reviewForm.text} onChange={e => setReviewForm({...reviewForm, text: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>
                  <input type="checkbox" checked={reviewForm.is_featured} onChange={e => setReviewForm({...reviewForm, is_featured: e.target.checked})} />
                  Feature on Homepage
                </label>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={closeReviewModal} style={{ flex: 1, padding: '12px', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', border: 'none', backgroundColor: 'var(--primary-green)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save Review</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBannerModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>Upload New Banner</h2>
            <form onSubmit={handleBannerUpload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Select Banner Image</label>
                <input required type="file" accept="image/*" onChange={e => setBannerFile(e.target.files[0])} style={{ width: '100%' }} />
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>Recommended aspect ratio: 2:1 (e.g. 800x400px)</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => { setIsBannerModalOpen(false); setBannerFile(null); }} style={{ flex: 1, padding: '12px', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', border: 'none', backgroundColor: 'var(--primary-green)', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hub Modal */}
      {isHubModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0 }}>{editingHub ? 'Edit Hub' : 'Add New Hub'}</h2>
            <form onSubmit={handleSaveHub}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Hub Name</label>
                <input 
                  type="text" 
                  required
                  value={hubForm.name} 
                  onChange={(e) => setHubForm({...hubForm, name: e.target.value})}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  placeholder="e.g., North Kolkata Hub"
                />
              </div>
              <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Delivery Radius (km)</label>
                  <input 
                    type="number" 
                    required
                    step="0.1"
                    value={hubForm.radius_km} 
                    onChange={(e) => setHubForm({...hubForm, radius_km: parseFloat(e.target.value)})}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <input 
                      type="checkbox" 
                      checked={hubForm.is_active} 
                      onChange={(e) => setHubForm({...hubForm, is_active: e.target.checked})}
                      style={{ width: '18px', height: '18px' }}
                    />
                    Is Active?
                  </label>
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Location</label>
                <div style={{ height: '350px', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
                  <AddressMap 
                    lat={hubForm.lat} 
                    lng={hubForm.lng} 
                    onChange={(lat, lng) => setHubForm({...hubForm, lat, lng})} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={closeHubModal} style={{ padding: '10px 20px', border: '1px solid #ccc', backgroundColor: 'white', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save Hub</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default OffersEvents;
