import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { PushNotifications } from '@capacitor/push-notifications';
import { jwtDecode } from "jwt-decode";
import AddressMap from './components/AddressMap';
import { generateInvoice } from './utils/generateInvoice';

// Custom hook to sync state with localStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn('Error reading localStorage for ' + key, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn('Error setting localStorage for ' + key, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
import { Search, ChevronDown, User, Heart, ShoppingBag, MapPin, Grid, PlayCircle, Tag, Zap, ChevronUp, ShoppingCart, Leaf, Timer, Shield, Home, ArrowLeft, X, Bell, ChevronRight, Menu } from 'lucide-react';

// categoryData has been moved to the backend database

const OrderRatingWidget = ({ order, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (order.rating) {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#334155' }}>Your Review</h4>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
          {[1, 2, 3, 4, 5].map(star => (
            <span key={star} style={{ color: star <= order.rating ? '#eab308' : '#cbd5e1', fontSize: '16px' }}>★</span>
          ))}
        </div>
        {order.review && <p style={{ margin: '0', fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>"{order.review}"</p>}
      </div>
    );
  }

  const submitReview = async () => {
    if (!rating) {
      alert("Please select a rating.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8000/api/orders/${order.id}/rate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review })
      });
      if (response.ok) {
        onReviewSubmitted(order.id, rating, review);
      } else {
        alert("Failed to submit review.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
    setSubmitting(false);
  };

  return (
    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f0f8ff', borderRadius: '8px', border: '1px solid rgba(2, 113, 185, 0.2)' }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--primary)' }}>Rate this Order</h4>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            style={{
              cursor: 'pointer',
              color: star <= (hoverRating || rating) ? '#eab308' : '#cbd5e1',
              fontSize: '24px',
              transition: 'color 0.2s'
            }}
          >
            ★
          </span>
        ))}
      </div>
      <textarea
        placeholder="Write a review (optional)..."
        value={review}
        onChange={(e) => setReview(e.target.value)}
        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', minHeight: '60px', marginBottom: '8px', resize: 'vertical', boxSizing: 'border-box' }}
      />
      <button
        onClick={submitReview}
        disabled={submitting || !rating}
        style={{ width: '100%', backgroundColor: rating ? 'var(--primary)' : '#94a3b8', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: rating ? 'pointer' : 'not-allowed', fontSize: '13px', boxSizing: 'border-box' }}
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
};

const DeliveryRatingWidget = ({ order, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  if (order.delivery_partner_rating) {
    return (
      <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#334155' }}>You Rated the Delivery Partner</h4>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[1, 2, 3, 4, 5].map(star => (
            <span key={star} style={{ color: star <= order.delivery_partner_rating ? '#eab308' : '#cbd5e1', fontSize: '16px' }}>★</span>
          ))}
        </div>
      </div>
    );
  }

  const submitReview = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8000/api/orders/${order.id}/rate-delivery`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      });
      if (response.ok) {
        onReviewSubmitted(order.id, rating);
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid rgba(234, 88, 12, 0.2)' }}>
      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#ea580c' }}>Rate the Delivery Partner</h4>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            style={{
              cursor: 'pointer',
              color: star <= (hoverRating || rating) ? '#eab308' : '#cbd5e1',
              fontSize: '24px',
              transition: 'color 0.2s'
            }}
          >
            ★
          </span>
        ))}
      </div>
      <button
        onClick={submitReview}
        disabled={submitting || !rating}
        style={{ width: '100%', backgroundColor: rating ? '#ea580c' : '#fdba74', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: rating ? 'pointer' : 'not-allowed', fontSize: '13px', boxSizing: 'border-box' }}
      >
        {submitting ? 'Submitting...' : 'Submit Rating'}
      </button>
    </div>
  );
};

const TajaCartLoader = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100%',
      backgroundColor: '#f0fdf4',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <div style={{
        animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <img
          src="/logo.png"
          alt="Taja Cart"
          style={{ width: '100px', height: '100px', objectFit: 'contain', marginBottom: '16px' }}
        />
        <div style={{ color: 'blue', fontSize: '22px', fontWeight: 'bold' }}>
          Jupiter Fresh
        </div>
        <div style={{ color: 'blue', fontSize: '14px', marginTop: '4px' }}>
          On the way to your doorstep...
        </div>
      </div>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(0.95); }
          }
        `}
      </style>
    </div>
  );
};

const ProductImageSlider = ({ product }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  let addImgs = [];
  try { addImgs = JSON.parse(product.additional_images || '[]'); } catch (e) { }

  const hasMultiple = addImgs.length > 0;
  const allImages = [product.image, ...addImgs].filter(Boolean);

  if (!hasMultiple) {
    return product.image ? (
      <img src={product.image?.startsWith('/uploads') ? `http://localhost:8000${product.image}` : product.image} alt={product.name} className={`product-image ${product.in_stock === 0 ? 'greyed-out' : ''}`} />
    ) : (
      <span style={{ fontSize: '48px' }} className={product.in_stock === 0 ? 'greyed-out' : ''}>{product.emoji}</span>
    );
  }

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      <div
        id={`slider-${product.id}`}
        style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', width: '100%', height: '100%', scrollbarWidth: 'none' }}
        className="no-scrollbar"
        onScroll={handleScroll}
      >
        {allImages.map((img, i) => (
          <img
            key={i}
            src={img.startsWith('/uploads') ? `http://localhost:8000${img}` : img}
            alt={`${product.name} ${i}`}
            style={{ position: 'relative', flex: '0 0 100%', scrollSnapAlign: 'center', objectFit: 'cover', width: '100%', height: '100%', borderRadius: '16px', mixBlendMode: 'multiply' }}
            className={product.in_stock === 0 ? 'greyed-out' : ''}
          />
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {allImages.map((_, i) => (
            <div
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                const slider = document.getElementById(`slider-${product.id}`);
                slider.scrollTo({ left: slider.clientWidth * i, behavior: 'smooth' });
              }}
              style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: i === activeIndex ? 'var(--primary-green)' : 'rgba(0,0,0,0.3)', transition: 'background-color 0.2s', cursor: 'pointer' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useLocalStorage('activeTab', 'home');
  const [activeCategory, setActiveCategory] = useLocalStorage('activeCategory', 'All');
  const [cart, setCart] = useLocalStorage('cart', {});
  const [sizeModalProduct, setSizeModalProduct] = useState(null);
  const [couponCode, setCouponCode] = useLocalStorage('couponCode', '');
  const [appliedCoupon, setAppliedCoupon] = useLocalStorage('appliedCoupon', null);
  const [couponError, setCouponError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Delivery Details State
  const [deliveryDetails, setDeliveryDetails] = useLocalStorage('deliveryDetails', {
    name: '',
    phone: '',
    street: '',
    building: '',
    locality: '',
    landmark: '',
    city: '',
    state: '',
    lat: null,
    lng: null
  });

  // Orders State
  const [placedOrders, setPlacedOrders] = useState([]);

  // User Authentication State
  const [user, setUser] = useLocalStorage('user', null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryData, setCategoryData] = useState({});
  const [categoryList, setCategoryList] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [activeMainCategory, setActiveMainCategory] = useLocalStorage('activeMainCategory', 'Fresh');
  const [categoryTabMainCategory, setCategoryTabMainCategory] = useLocalStorage('categoryTabMainCategory', 'Fresh');
  const [categoryTabActiveCategory, setCategoryTabActiveCategory] = useLocalStorage('categoryTabActiveCategory', 'Veggies');
  const [categoryTabActiveSubSub, setCategoryTabActiveSubSub] = useLocalStorage('categoryTabActiveSubSub', '');
  const [categoryTabGenderFilter, setCategoryTabGenderFilter] = useLocalStorage('categoryTabGenderFilter', 'All');
  const [categoryTabSizeFilter, setCategoryTabSizeFilter] = useLocalStorage('categoryTabSizeFilter', 'All');
  const [categoryTabPriceSort, setCategoryTabPriceSort] = useLocalStorage('categoryTabPriceSort', '');
  const [notifications, setNotifications] = useState([]);
  const [userNotifications, setUserNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useLocalStorage('dismissed_notifs_v2', []);
  const [dealsOfTheDay, setDealsOfTheDay] = useState([]);
  const [activeOffers, setActiveOffers] = useState([]);
  const [isFirst20Active, setIsFirst20Active] = useState(true);
  const [minOrderValue, setMinOrderValue] = useState(99);
  const [deliveryChargeAmount, setDeliveryChargeAmount] = useState(10);
  const [activeAnnouncements, setActiveAnnouncements] = useState([]);
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [banners, setBanners] = useState([]);
  const bannerScrollRef = useRef(null);

  const [currentHeroBannerIndex, setCurrentHeroBannerIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const heroBanners = React.useMemo(() => [
    { id: 1, img: '/hero-banners/banner_1.jpg', targetMainCategory: 'Fresh', targetSubCategory: 'Veggies' },
    { id: 2, img: '/hero-banners/banner_2.png', targetMainCategory: 'Fashion', targetSubCategory: null },
    { id: 3, img: '/hero-banners/banner_3.jpg', targetMainCategory: 'Fresh', targetSubCategory: 'Meat' },
    { id: 4, img: '/hero-banners/banner_4.jpg', targetMainCategory: 'Food', targetSubCategory: null },
    { id: 5, img: '/hero-banners/banner_5.png', targetMainCategory: 'Electronics', targetSubCategory: null },
  ], []);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroBannerIndex(prev => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  const handleHeroTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleHeroTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleHeroTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      setCurrentHeroBannerIndex(prev => (prev + 1) % heroBanners.length);
    } else if (diff < -50) {
      setCurrentHeroBannerIndex(prev => (prev - 1 + heroBanners.length) % heroBanners.length);
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const [hubs, setHubs] = useState([]);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addingNewAddress, setAddingNewAddress] = useState(false);
  const [saveAddressLabel, setSaveAddressLabel] = useState('');

  // Haversine distance formula
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Initialize Native Features
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: '948937732006-v2cgaa07idhk1jluioqh2theee9na728.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: false
      });

      PushNotifications.requestPermissions().then(result => {
        if (result.receive === 'granted') {
          PushNotifications.register();
        }
      });

      PushNotifications.addListener('registration', (token) => {
        fetch('http://localhost:8000/api/device-tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.value })
        }).catch(e => console.error('Failed to save token', e));
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        // Trigger a background refresh when notification arrives
        const event = new Event('taja-app-refresh');
        window.dispatchEvent(event);
      });

      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          // Trigger a refresh when app comes to foreground
          const event = new Event('taja-app-refresh');
          window.dispatchEvent(event);
        }
      });
    }
  }, []);

  // Fetch Inventory from Backend
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/home-feed');
        const data = await res.json();

        const {
          categories,
          products,
          deals,
          offers,
          settings,
          announcements,
          reviews,
          banners: activeBanners,
          hubs: hubData,
          notifications: notificationsData
        } = data;

        // Native Browser Notifications Logic (Mobile Support via Service Worker)
        if ('Notification' in window && 'serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js').then(registration => {
            if (Notification.permission === 'default') {
              Notification.requestPermission();
            }
            if (Notification.permission === 'granted') {
              const shownNotifs = JSON.parse(localStorage.getItem('shown_browser_notifs') || '[]');
              let newShown = [...shownNotifs];
              notificationsData.forEach(notif => {
                if (!shownNotifs.includes(notif.id)) {
                  registration.showNotification('New Update from Taja Cart', {
                    body: notif.text,
                    icon: '/logo.png',
                    data: {
                      url: window.location.origin
                    }
                  });
                  newShown.push(notif.id);
                }
              });
              localStorage.setItem('shown_browser_notifs', JSON.stringify(newShown));
            }
          });
        }

        setDealsOfTheDay(deals);
        setActiveOffers(offers);
        setActiveAnnouncements(announcements);
        setFeaturedReviews(reviews);
        setBanners(activeBanners);
        setHubs(hubData);
        setNotifications(notificationsData);

        const f20Setting = settings.find(s => s.key === 'FIRST20_ACTIVE');
        if (f20Setting) setIsFirst20Active(f20Setting.value === 'true');

        const minOrderSetting = settings.find(s => s.key === 'MIN_ORDER_FOR_FREE_DELIVERY');
        if (minOrderSetting) setMinOrderValue(Number(minOrderSetting.value));

        const deliveryChargeSetting = settings.find(s => s.key === 'DELIVERY_CHARGE');
        if (deliveryChargeSetting) setDeliveryChargeAmount(Number(deliveryChargeSetting.value));

        const newCategoryData = {};
        categories.forEach(c => {
          newCategoryData[c.name] = products.filter(p => p.category_id === c.id);
        });

        setCategoryData(newCategoryData);
        setCategoryList(categories);
        setMainCategories(data.main_categories || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setIsLoading(false);
      }
    };
    fetchInventory();

    const handleRefresh = () => fetchInventory();
    window.addEventListener('taja-app-refresh', handleRefresh);
    return () => window.removeEventListener('taja-app-refresh', handleRefresh);
  }, []);

  // Auto-slide Banners Every 4 seconds
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      if (bannerScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = bannerScrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          bannerScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          bannerScrollRef.current.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [banners]);

  // Handle Search InputOrders and Addresses from Backend
  useEffect(() => {
    const fetchUserData = () => {
      if (user && user.email) {
        fetch(`http://localhost:8000/api/addresses/${user.email}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setSavedAddresses(data);
          })
          .catch(err => console.error("Error fetching addresses:", err));

        fetch(`http://localhost:8000/api/user/notifications?email=${encodeURIComponent(user.email)}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setUserNotifications(data);
          })
          .catch(err => console.error("Error fetching user notifications:", err));
      } else {
        setSavedAddresses([]);
        setUserNotifications([]);
      }

      if (user && user.phone) {
        fetch(`http://localhost:8000/api/orders/user/${user.phone}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setPlacedOrders(data);
          })
          .catch(err => console.error("Error fetching orders:", err));
      } else {
        setPlacedOrders([]);
      }
    };

    fetchUserData();

    const handleRefresh = () => fetchUserData();
    window.addEventListener('taja-app-refresh', handleRefresh);
    return () => window.removeEventListener('taja-app-refresh', handleRefresh);
  }, [user, activeTab]); // Re-fetch on tab switch or user change

  const allNotifications = useMemo(() => {
    const mappedUserNotifs = userNotifications.map(n => ({ ...n, uniqueId: `user_${n.id}`, displayText: n.message || n.text }));
    const mappedGlobalNotifs = notifications.map(n => ({ ...n, uniqueId: `global_${n.id}`, displayText: n.text || n.message }));
    const combined = [...mappedUserNotifs, ...mappedGlobalNotifs];
    return combined.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [userNotifications, notifications]);

  // Collect all unique products for search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();

    // Flatten categoryData into a single list and remove duplicates by name
    const allUniqueProducts = [];
    const seenNames = new Set();
    [...Object.values(categoryData).flat(), ...dealsOfTheDay].forEach(product => {
      if (!seenNames.has(product.name)) {
        seenNames.add(product.name);
        allUniqueProducts.push(product);
      }
    });

    return allUniqueProducts.filter(item => item.name.toLowerCase().includes(query));
  }, [searchQuery, categoryData, dealsOfTheDay]);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCollectingPhone, setIsCollectingPhone] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [pendingRatingOrder, setPendingRatingOrder] = useState(null);

  // Profile State
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [editPhoneInput, setEditPhoneInput] = useState('');

  const handleDeleteAddress = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/addresses/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setSavedAddresses(savedAddresses.filter(addr => addr.id !== id));
          if (selectedAddressId === id) setSelectedAddressId(null);
        }
      } catch (err) {
        console.error("Error deleting address:", err);
      }
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!deliveryDetails.building) {
      alert("Please fill in your Building Name / House No.");
      return;
    }

    const newOrder = {
      id: 'JF-' + Math.floor(10000 + Math.random() * 90000),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      items: cartDetails.items,
      grandTotal: cartDetails.grandTotal,
      deliveryDetails: { ...deliveryDetails, email: user.email, deliveryFee: cartDetails.deliveryFee }
    };

    try {
      if (saveAddressLabel.trim() && user.email) {
        const addressStr = `${deliveryDetails.building ? deliveryDetails.building + ', ' : ''}${deliveryDetails.street}, ${deliveryDetails.locality}, ${deliveryDetails.city}, ${deliveryDetails.state}`;
        fetch('http://localhost:8000/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: user.email,
            label: saveAddressLabel.trim(),
            address: addressStr,
            landmark: deliveryDetails.landmark,
            lat: deliveryDetails.lat,
            lng: deliveryDetails.lng
          })
        }).then(res => res.json()).then(data => {
          if (data.id) {
            setSavedAddresses([{
              id: data.id,
              userEmail: user.email,
              label: saveAddressLabel.trim(),
              address: addressStr,
              landmark: deliveryDetails.landmark,
              lat: deliveryDetails.lat,
              lng: deliveryDetails.lng
            }, ...savedAddresses]);
          }
        }).catch(err => console.error("Error saving address:", err));
      }

      const response = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (response.ok) {
        const freshOrder = { ...newOrder, status: 'Placed' };
        setPlacedOrders([freshOrder, ...placedOrders]);
        setCart({});
        setAppliedCoupon(null);
        setCouponCode('');
        setSaveAddressLabel('');
        setAddingNewAddress(false);
        setActiveTab('home');
      } else {
        alert("Failed to place order.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    }
  };

  const handleReviewSubmitted = (orderId, rating, review) => {
    setPlacedOrders(placedOrders.map(o =>
      o.id === orderId ? { ...o, rating, review } : o
    ));
  };

  const handleDeliveryReviewSubmitted = (orderId, delivery_partner_rating) => {
    setPlacedOrders(placedOrders.map(o =>
      o.id === orderId ? { ...o, delivery_partner_rating } : o
    ));
  };

  const cancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/orders/${orderId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setPlacedOrders(placedOrders.filter(o => o.id !== orderId));
        } else {
          alert("Failed to cancel order.");
        }
      } catch (err) {
        console.error(err);
        alert("Network error. Please try again.");
      }
    }
  };

  const downloadInvoice = (order) => {
    generateInvoice(order);
  };

  const handleApplyCoupon = () => {
    if (couponCode === 'FIRST20') {
      if (!isFirst20Active) {
        setCouponError('This coupon is currently inactive');
        setAppliedCoupon(null);
        return;
      }
      if (!user) {
        setCouponError('Please login to apply this coupon');
        setAppliedCoupon(null);
        return;
      }
      const userOrderCount = placedOrders.filter(o => o.deliveryDetails && o.deliveryDetails.phone === user.phone).length;
      if (userOrderCount >= 2) {
        setCouponError('FIRST20 is only valid for your first 2 orders');
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon(couponCode);
      setCouponError('');
      return;
    }

    if (couponCode === 'FLAT20') {
      setAppliedCoupon(couponCode);
      setCouponError('');
      return;
    }

    const dynamicOffer = activeOffers.find(o => o.code === couponCode);
    if (dynamicOffer) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const validUntil = new Date(dynamicOffer.valid_until);

      if (today > validUntil) {
        setCouponError('This coupon has expired');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(couponCode);
        setCouponError('');
      }
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const getSizedQty = (productName) => {
    return Object.entries(cart)
      .filter(([key]) => key.startsWith(`${productName}|`))
      .reduce((sum, [_, qty]) => sum + qty, 0);
  };

  const updateCart = (productName, delta, size = null) => {
    const cartKey = size ? `${productName}|${size}` : productName;
    setCart(prev => {
      const currentQty = prev[cartKey] || 0;
      const newQty = Math.max(0, currentQty + delta);
      const newCart = { ...prev };
      if (newQty === 0) {
        delete newCart[cartKey];
      } else {
        newCart[cartKey] = newQty;
      }
      return newCart;
    });
  };

  const totalCartItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const cartDetails = React.useMemo(() => {
    const allProducts = [...Object.values(categoryData).flat(), ...dealsOfTheDay];
    const items = [];
    let itemTotal = 0;

    Object.entries(cart).forEach(([cartKey, qty]) => {
      const [name, size] = cartKey.split('|');
      const product = allProducts.find(p => p.name === name);
      if (product) {
        items.push({ ...product, qty, selectedSize: size });
        itemTotal += product.currentPrice * qty;
      }
    });

    let discountAmount = 0;
    if (appliedCoupon === 'FIRST20' || appliedCoupon === 'FLAT20') {
      discountAmount = Math.floor(itemTotal * 0.2); // 20% off
    } else if (appliedCoupon) {
      const dynamicOffer = activeOffers.find(o => o.code === appliedCoupon);
      if (dynamicOffer) {
        discountAmount = Math.floor(itemTotal * (dynamicOffer.discount_percent / 100));
      }
    }

    const discountedTotal = itemTotal - discountAmount;
    const deliveryFee = discountedTotal >= minOrderValue ? 0 : deliveryChargeAmount;
    const grandTotal = discountedTotal + (items.length > 0 ? deliveryFee : 0);

    return { items, itemTotal, discountAmount, deliveryFee, grandTotal };
  }, [cart, appliedCoupon, categoryData, dealsOfTheDay, activeOffers, minOrderValue, deliveryChargeAmount]);

  const allList = React.useMemo(() => {
    const allProducts = [...Object.values(categoryData).flat(), ...dealsOfTheDay];
    // Remove duplicates by name
    const unique = [];
    const seen = new Set();
    allProducts.forEach(p => {
      if (!seen.has(p.name)) {
        seen.add(p.name);
        unique.push(p);
      }
    });
    return unique.sort(() => 0.5 - Math.random());
  }, [categoryData, dealsOfTheDay]);


  const activeMainCatObj = React.useMemo(() => {
    if (!mainCategories.length) return { id: 1, name: 'Fresh' };
    return mainCategories.find(mc => mc.name.toLowerCase() === (activeMainCategory || 'fresh').toLowerCase()) || mainCategories[0];
  }, [mainCategories, activeMainCategory]);

  const visibleSubcategories = React.useMemo(() => {
    if (!activeMainCatObj) return categoryList;
    return categoryList.filter(c => c.main_category_id === activeMainCatObj.id);
  }, [categoryList, activeMainCatObj]);

  const categories = React.useMemo(() => {
    return visibleSubcategories.map(c => ({
      name: c.name,
      iconUrl: c.image ? (c.image.startsWith('/uploads') ? `http://localhost:8000${c.image}` : c.image) : '/category-icons/all.png'
    }));
  }, [visibleSubcategories]);

  React.useEffect(() => {
    if (visibleSubcategories.length > 0) {
      const isValid = visibleSubcategories.some(s => s.name === activeCategory);
      if (!isValid) {
        setActiveCategory(visibleSubcategories[0].name);
      }
    } else {
      setActiveCategory('');
    }
  }, [visibleSubcategories]);

  const handleSelectMainCategory = (mainCatName) => {
    setActiveMainCategory(mainCatName);
    const targetMain = mainCategories.find(mc => mc.name.toLowerCase() === mainCatName.toLowerCase());
    if (targetMain) {
      const subs = categoryList.filter(c => c.main_category_id === targetMain.id);
      if (subs.length > 0) {
        setActiveCategory(subs[0].name);
      } else {
        setActiveCategory('');
      }
    }
  };

  const handleBannerClick = (banner) => {
    setActiveTab('category');
    setCategoryTabMainCategory(banner.targetMainCategory);
    if (banner.targetSubCategory) {
      setCategoryTabActiveCategory(banner.targetSubCategory);
    } else {
      const targetMain = mainCategories.find(mc => mc.name.toLowerCase() === banner.targetMainCategory.toLowerCase());
      if (targetMain) {
        const subs = categoryList.filter(c => c.main_category_id === targetMain.id);
        if (subs.length > 0) {
          setCategoryTabActiveCategory(subs[0].name);
        } else {
          setCategoryTabActiveCategory('');
        }
      } else {
        setCategoryTabActiveCategory('');
      }
    }
  };

  const currentProductList = categoryData[activeCategory] || [];

  const categoryTabMainCatObj = React.useMemo(() => {
    if (!mainCategories.length) return { id: 1, name: 'Fresh' };
    return mainCategories.find(mc => mc.name.toLowerCase() === (categoryTabMainCategory || 'fresh').toLowerCase()) || mainCategories[0];
  }, [mainCategories, categoryTabMainCategory]);

  const categoryTabVisibleSubcategories = React.useMemo(() => {
    if (!categoryTabMainCatObj) return categoryList.filter(c => !c.parent_category_id);
    return categoryList.filter(c => c.main_category_id === categoryTabMainCatObj.id && !c.parent_category_id);
  }, [categoryList, categoryTabMainCatObj]);

  const categoryTabActiveCatObj = React.useMemo(() => {
    return categoryList.find(c => c.name === categoryTabActiveCategory);
  }, [categoryList, categoryTabActiveCategory]);

  const categoryTabVisibleSubSubcategories = React.useMemo(() => {
    if (!categoryTabActiveCatObj) return [];
    return categoryList.filter(c => c.parent_category_id === categoryTabActiveCatObj.id);
  }, [categoryList, categoryTabActiveCatObj]);

  const categoryTabAvailableSizes = React.useMemo(() => {
    if (categoryTabMainCategory !== 'Fashion') return [];
    const currentProducts = categoryData[categoryTabVisibleSubSubcategories.length > 0 ? categoryTabActiveSubSub : categoryTabActiveCategory] || [];
    const sizes = new Set();
    currentProducts.forEach(p => {
      if (p.sizes) {
        p.sizes.split(',').forEach(s => sizes.add(s.trim()));
      }
    });
    return Array.from(sizes).filter(s => s).sort();
  }, [categoryData, categoryTabVisibleSubSubcategories, categoryTabActiveSubSub, categoryTabActiveCategory, categoryTabMainCategory]);

  const sizeModalFullSizes = React.useMemo(() => {
    if (!sizeModalProduct) return [];
    const cat = categoryList.find(c => c.id === sizeModalProduct.category_id);
    const tName = cat ? cat.name.toLowerCase() : '';
    const isTopInner = tName.includes('topwear') || tName.includes('inner wear') || tName.includes('innerwear');
    const isBottom = tName.includes('bottomwear');
    const isShoes = tName.includes('shoes');

    let sizes = [];
    if (isTopInner) sizes = ['xs', 's', 'm', 'l', 'xl', 'xxl'];
    if (isBottom) sizes = ['20', '22', '24', '26', '28', '30', '32', '34'];
    if (isShoes) sizes = ['5', '6', '7', '8', '9', '10', '11'];

    const productSizes = sizeModalProduct.sizes ? sizeModalProduct.sizes.split(',').map(s => s.trim()) : [];
    if (sizes.length === 0) return productSizes;

    const finalSizes = [...sizes];
    productSizes.forEach(sz => {
      if (!finalSizes.includes(sz)) finalSizes.push(sz);
    });
    return finalSizes;
  }, [sizeModalProduct, categoryList]);

  const categoryTabCategories = React.useMemo(() => {
    return categoryTabVisibleSubcategories.map(c => ({
      name: c.name,
      iconUrl: c.image ? (c.image.startsWith('/uploads') ? `http://localhost:8000${c.image}` : c.image) : '/category-icons/all.png'
    }));
  }, [categoryTabVisibleSubcategories]);

  React.useEffect(() => {
    if (categoryTabVisibleSubcategories.length > 0) {
      const isValid = categoryTabVisibleSubcategories.some(s => s.name === categoryTabActiveCategory);
      if (!isValid) {
        setCategoryTabActiveCategory(categoryTabVisibleSubcategories[0].name);
      }
    } else {
      setCategoryTabActiveCategory('');
    }
  }, [categoryTabVisibleSubcategories]);

  React.useEffect(() => {
    if (categoryTabVisibleSubSubcategories.length > 0) {
      const isValid = categoryTabVisibleSubSubcategories.some(s => s.name === categoryTabActiveSubSub);
      if (!isValid) {
        setCategoryTabActiveSubSub(categoryTabVisibleSubSubcategories[0].name);
      }
    } else {
      setCategoryTabActiveSubSub('');
    }
  }, [categoryTabVisibleSubSubcategories]);

  const handleNativeGoogleLogin = async () => {
    try {
      const user = await GoogleAuth.signIn();
      const response = await fetch(`http://localhost:8000/api/customers/${user.email}`);
      if (response.ok) {
        const customer = await response.json();
        setUser({ name: user.name, email: user.email, picture: user.imageUrl, phone: customer.phone });
        setDeliveryDetails(prev => ({ ...prev, name: user.name, phone: customer.phone }));
        setIsAuthModalOpen(false);
      } else {
        setTempUser({ name: user.name, email: user.email, picture: user.imageUrl });
        setIsCollectingPhone(true);
      }
    } catch (err) {
      console.error('Google login error:', err);
      try {
        if (Capacitor.isNativePlatform()) {
          await GoogleAuth.signOut();
        }
      } catch (e) { }
      alert("Google Login Failed on App: " + (err.message || JSON.stringify(err)));
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    try {
      const response = await fetch(`http://localhost:8000/api/customers/${decoded.email}`);
      if (response.ok) {
        const customer = await response.json();
        setUser({ name: decoded.name, email: decoded.email, picture: decoded.picture, phone: customer.phone });
        setDeliveryDetails(prev => ({ ...prev, name: decoded.name, phone: customer.phone }));
        setIsAuthModalOpen(false);
      } else {
        setTempUser({ name: decoded.name, email: decoded.email, picture: decoded.picture });
        setIsCollectingPhone(true);
      }
    } catch (err) {
      console.error(err);
      alert("Error checking customer details.");
    }
  };

  const handleSavePhone = async () => {
    if (!phoneInput || phoneInput.length < 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    const finalUser = { ...tempUser, phone: phoneInput };

    try {
      const response = await fetch('http://localhost:8000/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalUser)
      });
      if (response.ok) {
        setUser(finalUser);
        setIsCollectingPhone(false);
        setIsAuthModalOpen(false);
        setDeliveryDetails(prev => ({ ...prev, name: finalUser.name, phone: finalUser.phone }));
        setPhoneInput('');
        setTempUser(null);
      } else {
        alert("Failed to save phone number.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    }
  };

  const handleUpdatePhone = () => {
    if (!editPhoneInput || editPhoneInput.length < 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }
    setUser({ ...user, phone: editPhoneInput });
    setDeliveryDetails({ ...deliveryDetails, phone: editPhoneInput });
    setIsEditingPhone(false);
  };

  const handleGoogleError = () => {
    console.log('Login Failed');
    alert("Google Login Failed");
  };

  const userOrders = user ? placedOrders.filter(o => o.deliveryDetails && o.deliveryDetails.phone === user.phone) : [];

  const activeHubs = hubs ? hubs.filter(h => h.is_active) : [];
  const isOutOfRange = activeHubs.length > 0 && deliveryDetails.lat && deliveryDetails.lng
    ? !activeHubs.some(hub => getDistanceFromLatLonInKm(deliveryDetails.lat, deliveryDetails.lng, hub.lat, hub.lng) <= hub.radius_km)
    : false;

  if (isLoading) {
    return <TajaCartLoader />;
  }

  return (
    <div className="app-container">

      {/* Header */}
      <div className="header-bg">
        <div className="flex justify-between items-center" style={{ position: 'relative', zIndex: 10 }}>
          <div
            className="flex items-center"
            style={{ cursor: 'pointer', height: '40px', width: '150px', position: 'relative' }}
            onClick={() => {
              setActiveTab('home');
              setSearchQuery('');
            }}
          >
            <img
              src="/jupiter_fresh_logo.png"
              alt="Jupiter Fresh"
              onClick={() => {
                setActiveTab('home');
                setSearchQuery('');
              }}
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                transform: 'translateY(-50%)',
                width: '160px',
                height: 'auto',
                objectFit: 'contain',
                zIndex: 20,
                cursor: 'pointer'
              }}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="profile-icon" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
              <Bell size={22} color="#ff8a00" />
              {allNotifications.filter(n => !dismissedNotifications.includes(n.uniqueId)).length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  backgroundColor: '#e53935',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 'bold',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  {allNotifications.filter(n => !dismissedNotifications.includes(n.uniqueId)).length}
                </span>
              )}
              {isNotificationOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: -10,
                  marginTop: '16px',
                  width: '320px',
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  zIndex: 2000,
                  maxHeight: '400px',
                  overflowY: 'auto',
                  border: '1px solid #eee'
                }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid #eee', fontWeight: 'bold', color: '#084c20', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Notifications</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {allNotifications.filter(n => !dismissedNotifications.includes(n.uniqueId)).length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const visibleNotifIds = allNotifications.filter(n => !dismissedNotifications.includes(n.uniqueId)).map(n => n.uniqueId);
                            setDismissedNotifications([...dismissedNotifications, ...visibleNotifIds]);
                          }}
                          style={{ fontSize: '12px', color: 'var(--primary-green)', fontWeight: '600' }}
                        >
                          Clear All
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); setIsNotificationOpen(false); }} style={{ color: '#999' }}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  {allNotifications.filter(n => !dismissedNotifications.includes(n.uniqueId)).length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#666' }}>
                      <Bell size={32} color="#ddd" style={{ margin: '0 auto 12px' }} />
                      <p>You have no new notifications.</p>
                    </div>
                  ) : (
                    allNotifications.filter(n => !dismissedNotifications.includes(n.uniqueId)).map(notif => (
                      <div key={notif.uniqueId} style={{
                        padding: '16px',
                        borderBottom: '1px solid #f5f5f5',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '12px',
                        backgroundColor: '#fafafa'
                      }}>
                        <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.4' }}>{notif.displayText}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDismissedNotifications([...dismissedNotifications, notif.uniqueId]);
                          }}
                          style={{
                            cursor: 'pointer',
                            flexShrink: 0,
                            padding: '4px',
                            background: '#eee',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#666'
                          }}
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Hamburger Menu */}
            <div className="profile-icon" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}>
              <Menu size={24} color="#ff8a00" />

              {isNavMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '12px',
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  width: '200px',
                  zIndex: 50,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {[
                    { label: 'About Us', tab: 'about' },
                    { label: 'Privacy Policy', tab: 'privacy' },
                    { label: 'Terms and Conditions', tab: 'terms' }
                  ].map((item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '16px',
                        borderBottom: index !== 2 ? '1px solid #eee' : 'none',
                        color: '#333',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsNavMenuOpen(false);
                        setActiveTab(item.tab);
                      }}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>


          </div>
        </div>



        {/* Search */}
        <div className="search-bar-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-bar"
            placeholder='Search for "Fresh Vegetables"'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {searchQuery.length > 0 ? (
              <div style={{ backgroundColor: '#f1f5f9', borderRadius: '50%', padding: '4px', display: 'flex', cursor: 'pointer' }} onClick={() => setSearchQuery('')}>
                <X size={16} className="text-gray" />
              </div>
            ) : (
              <>
                <Heart size={18} className="text-gray" />
                <ShoppingBag size={18} className="text-gray" />
              </>
            )}
          </div>
        </div>
      </div>

      {searchQuery.trim().length > 0 ? (
        <div className="search-results-container" style={{ padding: '16px', paddingBottom: '90px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', marginBottom: '16px' }}>
            Search Results for "{searchQuery}"
          </h2>

          {searchResults.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', textAlign: 'center' }}>
              <Search size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)' }}>No products found</h3>
              <p style={{ fontSize: '14px', color: 'var(--gray-text)', marginTop: '8px' }}>Try searching for a different keyword like "Apple" or "Potato".</p>
            </div>
          ) : (
            <div className="product-grid">
              {searchResults.map((item, idx) => {

                return (
                  <div key={idx} className={`product-card ${item.in_stock === 0 ? 'out-of-stock' : ''}`}>
                    <div className="product-image-container">
                      {item.gender && (
                        <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#334155', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', zIndex: 1 }}>
                          {item.gender}
                        </div>
                      )}
                      {item.image ? (
                        <img src={item.image?.startsWith('/uploads') ? `http://localhost:8000${item.image}` : item.image} alt={item.name} className={`product-image ${item.in_stock === 0 ? 'greyed-out' : ''}`} />
                      ) : (
                        <span style={{ fontSize: '48px' }} className={item.in_stock === 0 ? 'greyed-out' : ''}>{item.emoji}</span>
                      )}
                      {item.in_stock !== 0 && (
                        item.sizes ? (
                          getSizedQty(item.name) > 0 ? (
                            <div className="quantity-control">
                              <button className="qty-btn" onClick={() => setSizeModalProduct(item)}>-</button>
                              <span className="qty-text">{getSizedQty(item.name)}</span>
                              <button className="qty-btn" onClick={() => setSizeModalProduct(item)}>+</button>
                            </div>
                          ) : (
                            <button className="add-btn" onClick={() => setSizeModalProduct(item)}>
                              <span className="plus-sign">+</span>
                            </button>
                          )
                        ) : (
                          cart[item.name] ? (
                            <div className="quantity-control">
                              <button className="qty-btn" onClick={() => updateCart(item.name, -1)}>-</button>
                              <span className="qty-text">{cart[item.name]}</span>
                              <button className="qty-btn" onClick={() => updateCart(item.name, 1)}>+</button>
                            </div>
                          ) : (
                            <button className="add-btn" onClick={() => updateCart(item.name, 1)}>
                              <span className="plus-sign">+</span>
                            </button>
                          )
                        )
                      )}
                    </div>
                    <div className="product-details">
                      {item.in_stock === 0 && (
                        <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Out of Stock. Coming Soon</div>
                      )}
                      <div className={`price-row ${item.in_stock === 0 ? 'greyed-out' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                          <span className="current-price">₹{item.currentPrice}</span>
                          <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px' }}>₹{item.cutPrice}</span>
                          {item.cutPrice > item.currentPrice && (
                            <span style={{ color: '#c2410c', backgroundColor: '#fff2e6', border: '1px solid #ffd6b3', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', marginLeft: '4px' }}>
                              {Math.round(Math.abs(item.cutPrice - item.currentPrice) / item.cutPrice * 100)}% off
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: '#fff0f2', padding: '2px 6px', borderRadius: '4px' }}>
                          <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 'bold' }}>{item.rating}</span>
                          <span style={{ fontSize: '10px' }}>⭐</span>
                        </div>
                      </div>
                      <h3 className="product-name">{item.name}</h3>
                      <p className="product-quantity">{item.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {activeTab === 'home' && (
            <>
              {/* Announcement Bar */}
              {activeAnnouncements.length > 0 && (
                <div className="announcement-bar">
                  <div className="marquee-content">
                    {[...activeAnnouncements, ...activeAnnouncements].map((ann, idx) => (
                      <span key={idx} className="marquee-item">{ann.text}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Auto-sliding Hero Banners Carousel */}
              <div
                style={{
                  margin: '12px 16px 4px 16px',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
                }}
                onTouchStart={handleHeroTouchStart}
                onTouchMove={handleHeroTouchMove}
                onTouchEnd={handleHeroTouchEnd}
              >
                <div
                  style={{
                    display: 'flex',
                    transform: `translateX(-${currentHeroBannerIndex * 100}%)`,
                    transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
                    width: '100%'
                  }}
                >
                  {heroBanners.map((banner, idx) => (
                    <div
                      key={banner.id}
                      onClick={() => handleBannerClick(banner)}
                      style={{
                        flex: '0 0 100%',
                        width: '100%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '16px',
                        overflow: 'hidden'
                      }}
                    >
                      <img
                        src={banner.img}
                        alt={`Hero Banner ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          borderRadius: '16px',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination Dots */}
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                  zIndex: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.25)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  backdropFilter: 'blur(4px)'
                }}>
                  {heroBanners.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentHeroBannerIndex(idx)}
                      style={{
                        width: currentHeroBannerIndex === idx ? '18px' : '6px',
                        height: '6px',
                        borderRadius: '3px',
                        backgroundColor: currentHeroBannerIndex === idx ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Shop by Category Heading */}
              <div style={{ padding: '16px 16px 0' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  margin: 0,
                  textAlign: 'center'
                }}>
                  Shop by Category
                </h3>
              </div>

              {/* Quick Action Blocks */}
              <div style={{ display: 'flex', overflowX: 'auto', margin: '0 16px', padding: '12px 0', gap: '12px', msOverflowStyle: 'none', scrollbarWidth: 'none' }} className="hide-scrollbar">
                {(mainCategories.length > 0 ? mainCategories : [
                  { id: 1, name: 'Fresh', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80' },
                  { id: 2, name: 'Food', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80' },
                  { id: 3, name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=200&q=80' },
                  { id: 4, name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=200&q=80' }
                ]).map((block, idx) => {
                  const isSelected = activeMainCategory.toLowerCase() === block.name.toLowerCase();
                  return (
                    <div
                      key={block.id || idx}
                      onClick={() => handleSelectMainCategory(block.name)}
                      style={{
                        flex: '1 0 calc(25% - 9px)',
                        minWidth: '75px',
                        height: '100px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        padding: '8px',
                        borderRadius: '16px',
                        boxShadow: isSelected ? '0 4px 14px rgba(2, 113, 185, 0.35)' : '0 2px 4px rgba(0,0,0,0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: isSelected ? '2px solid #0271b9' : '2px solid transparent',
                        transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                        backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 65%), url(${block.image || block.img})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', letterSpacing: '0.5px' }}>{block.name}</span>
                    </div>
                  );
                })}
              </div>

              {/* Nav Categories */}
              {categories.length > 0 ? (
                <div className="nav-categories" style={{ margin: '0 16px', padding: '16px 0' }}>
                  {categories.map((cat, idx) => (
                    <div
                      key={idx}
                      className={`nav-item ${activeCategory === cat.name ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat.name)}
                    >
                      <div className="nav-icon-wrapper" style={{ background: 'transparent', boxShadow: 'none' }}>
                        <img src={cat.iconUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply', filter: 'contrast(1.1) brightness(1.05)' }} />
                      </div>
                      <span style={{ fontWeight: 700, color: '#334155', fontSize: '15px' }}>{cat.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 16px', backgroundColor: '#f8fafc', borderRadius: '12px', margin: '12px 16px', border: '1px solid #e2e8f0' }}>
                  <p style={{ margin: 0, fontWeight: '600', color: '#64748b', fontSize: '14px' }}>
                    Subcategories for "{activeMainCatObj?.name || activeMainCategory}" will be available soon!
                  </p>
                </div>
              )}

              {/* Category Dropdown */}
              {currentProductList.length > 0 && (
                <div className="veggies-dropdown-section">
                  <div className="product-scroll-container">
                    {currentProductList.map((product, idx) => (
                      <div key={idx} className={`product-card ${product.in_stock === 0 ? 'out-of-stock' : ''}`}>
                        <div className="product-image-container">
                          {product.gender && (
                            <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#334155', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', zIndex: 1 }}>
                              {product.gender}
                            </div>
                          )}
                          <ProductImageSlider product={product} />
                          {product.in_stock !== 0 && (
                            product.sizes ? (
                              getSizedQty(product.name) > 0 ? (
                                <div className="quantity-control">
                                  <button className="qty-btn" onClick={() => setSizeModalProduct(product)}>-</button>
                                  <span className="qty-text">{getSizedQty(product.name)}</span>
                                  <button className="qty-btn" onClick={() => setSizeModalProduct(product)}>+</button>
                                </div>
                              ) : (
                                <button className="add-btn" onClick={() => setSizeModalProduct(product)}>
                                  <span className="plus-sign">+</span>
                                </button>
                              )
                            ) : (
                              cart[product.name] ? (
                                <div className="quantity-control">
                                  <button className="qty-btn" onClick={() => updateCart(product.name, -1)}>-</button>
                                  <span className="qty-text">{cart[product.name]}</span>
                                  <button className="qty-btn" onClick={() => updateCart(product.name, 1)}>+</button>
                                </div>
                              ) : (
                                <button className="add-btn" onClick={() => updateCart(product.name, 1)}>
                                  <span className="plus-sign">+</span>
                                </button>
                              )
                            )
                          )}
                        </div>
                        <div className="product-details">
                          {product.in_stock === 0 && (
                            <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Out of Stock. Coming Soon</div>
                          )}
                          <div className={`price-row ${product.in_stock === 0 ? 'greyed-out' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                              <span className="current-price">₹{product.currentPrice}</span>
                              <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px' }}>₹{product.cutPrice}</span>
                              {product.cutPrice > product.currentPrice && (
                                <span style={{ color: '#c2410c', backgroundColor: '#fff2e6', border: '1px solid #ffd6b3', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', marginLeft: '4px' }}>
                                  {Math.round(Math.abs(product.cutPrice - product.currentPrice) / product.cutPrice * 100)}% off
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: '#fff0f2', padding: '2px 6px', borderRadius: '4px' }}>
                              <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 'bold' }}>{product.rating}</span>
                              <span style={{ fontSize: '10px' }}>⭐</span>
                            </div>
                          </div>
                          <h3 className="product-name">{product.name}</h3>
                          <p className="product-quantity">{product.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="see-all-container">
                    <button className="see-all-btn" onClick={() => {
                      setActiveTab('category');
                      setCategoryTabMainCategory(activeMainCategory);
                      setCategoryTabActiveCategory(activeCategory);
                    }}>See all ▸</button>
                  </div>
                </div>
              )}

              {/* Promotional Banners */}
              <div className="hide-scrollbar" style={{
                display: 'flex',
                overflowX: 'auto',
                gap: '16px',
                padding: '0',
                margin: '-8px 16px 8px 16px',
                scrollSnapType: 'x mandatory'
              }}>
                {/* Banner 1: Meat Banner */}
                <div
                  onClick={() => {
                    setActiveTab('category');
                    setCategoryTabMainCategory('Fresh');
                    setCategoryTabActiveCategory('Meat');
                  }}
                  style={{
                    flex: '0 0 100%',
                    scrollSnapAlign: 'center',
                    height: '115px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    backgroundImage: 'url(/meat_banner_new.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(153,27,27,0.85) 0%, rgba(153,27,27,0.4) 60%, rgba(0,0,0,0) 100%)' }}></div>
                  <div style={{ position: 'relative', zIndex: 1, padding: '0 16px' }}>
                    <h2 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '22px', fontStyle: 'italic', fontWeight: '900', letterSpacing: '0.5px' }}>FRESH MEAT</h2>
                    <p style={{ color: 'white', margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', letterSpacing: '1px' }}>DELIVERED TO YOU</p>
                    <button style={{ padding: '6px 16px', backgroundColor: '#fff', color: '#991b1b', border: 'none', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>Order Now</button>
                  </div>
                </div>

                {/* Banner 2: Fast Delivery */}
                <div
                  onClick={() => setActiveTab('category')}
                  style={{
                    flex: '0 0 100%',
                    scrollSnapAlign: 'center',
                    height: '115px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
                    position: 'relative'
                  }}
                >
                  <img
                    src="/cart_filled_transparent.png"
                    alt="Cart"
                    style={{
                      height: '95px',
                      width: 'auto',
                      position: 'absolute',
                      right: '10px',
                      bottom: '10px',
                      zIndex: 0,
                      objectFit: 'contain'
                    }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(6,95,70,0.95) 0%, rgba(6,95,70,0.4) 60%, rgba(0,0,0,0) 100%)' }}></div>
                  <div style={{ position: 'relative', zIndex: 1, padding: '0 16px' }}>
                    <h2 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '22px', fontStyle: 'italic', fontWeight: '900', letterSpacing: '0.5px' }}>FRESH GROCERIES</h2>
                    <p style={{ color: 'white', margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', letterSpacing: '1px' }}>DAILY ESSENTIALS</p>
                    <button style={{ padding: '6px 16px', backgroundColor: '#fff', color: '#065f46', border: 'none', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>Shop Now</button>
                  </div>
                </div>

                {/* Banner 3: Fast and Secure Delivery */}
                <div
                  onClick={() => setActiveTab('category')}
                  style={{
                    flex: '0 0 100%',
                    scrollSnapAlign: 'center',
                    height: '115px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
                    position: 'relative'
                  }}
                >
                  <img
                    src="/user-scooter-transparent.png"
                    alt="Delivery Scooter"
                    style={{
                      height: '95px',
                      width: 'auto',
                      position: 'absolute',
                      right: '5px',
                      bottom: '5px',
                      zIndex: 0,
                      objectFit: 'contain'
                    }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.6) 50%, rgba(0,0,0,0) 100%)' }}></div>
                  <div style={{ position: 'relative', zIndex: 1, padding: '0 16px' }}>
                    <h2 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '22px', fontStyle: 'italic', fontWeight: '900', letterSpacing: '0.5px' }}>FAST & SECURE</h2>
                    <p style={{ color: 'white', margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', letterSpacing: '1px' }}>DELIVERED TO YOU</p>
                    <button style={{ padding: '6px 16px', backgroundColor: '#fff', color: '#1e3a8a', border: 'none', borderRadius: '16px', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>Order Now</button>
                  </div>
                </div>
              </div>
              {/* Shop by Essentials */}
              <div className="section mt-2" style={{ padding: '16px 16px', backgroundColor: 'var(--white)' }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    margin: 0,
                    textAlign: 'center'
                  }}>
                    Shop by Essentials
                  </h3>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                }}>
                  {[
                    { name: 'Fruits & Vegetables', image: '/essentials_fruits_1786657754083.png', navMain: 'Fresh', navSub: 'Veggies' },
                    { name: 'Meats', image: '/essentials_meats_1786657766500.png', navMain: 'Fresh', navSub: 'Meat' },
                    { name: 'Grocery', image: '/essentials_grocery_v2_1786658695054.png', navMain: 'Fresh', navSub: 'Grocery' },
                    { name: 'Milk & Dairy', image: '/essentials_dairy_1786657804961.png', navMain: 'Fresh', navSub: 'Milk products' },
                    { name: 'Cooked Food', image: '/essentials_cooked_1786657974923.png', navMain: 'Food' },
                    { name: 'Fashion & Accessories', image: '/essentials_fashion_1786657992737.png', navMain: 'Fashion' },
                    { name: 'Cosmetics', image: '/essentials_cosmetics_v2_1786658742446.png', navMain: 'Fashion', navSub: 'Cosmetics ' },
                    { name: 'Shoes', image: '/essentials_shoes_v2_1786658755289.png', navMain: 'Fashion', navSub: 'Shoes' },
                    { name: 'Electronics', image: '/essentials_electronics_v2_1786659108617.png', navMain: 'Electronics' }
                  ].map((category, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        if (category.navMain) {
                          setActiveTab('category');
                          setCategoryTabMainCategory(category.navMain);
                          if (category.navSub) {
                            setCategoryTabActiveCategory(category.navSub);
                          }
                        }
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        backgroundColor: '#f5f6f8',
                        borderRadius: '16px',
                        padding: '12px',
                        width: '100%',
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}>
                        <img
                          src={category.image}
                          alt={category.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain', mixBlendMode: 'multiply' }}
                        />
                      </div>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        textAlign: 'center',
                        color: '#475569',
                        lineHeight: '1.2'
                      }}>
                        {category.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deals of the Day */}
              <div className="section mt-2" style={{ padding: '16px 0', backgroundColor: 'var(--white)' }}>
                <div style={{ padding: '0 16px', marginBottom: '12px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    ⚡ Deals of the Day
                  </h3>
                </div>

                {dealsOfTheDay.length === 0 ? (
                  <p style={{ padding: '0 16px', color: 'var(--gray-text)', fontSize: '14px' }}>No deals available today.</p>
                ) : (
                  <div className="product-scroll-container">
                    {dealsOfTheDay.map((product, idx) => (
                      <div key={idx} className={`product-card ${product.in_stock === 0 ? 'out-of-stock' : ''}`}>
                        <div className="product-image-container">
                          {product.gender && (
                            <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#334155', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', zIndex: 1 }}>
                              {product.gender}
                            </div>
                          )}
                          {product.image ? (
                            <img src={product.image?.startsWith('/uploads') ? `http://localhost:8000${product.image}` : product.image} alt={product.name} className={`product-image ${product.in_stock === 0 ? 'greyed-out' : ''}`} />
                          ) : (
                            <span style={{ fontSize: '48px' }} className={product.in_stock === 0 ? 'greyed-out' : ''}>{product.emoji}</span>
                          )}
                          {product.in_stock !== 0 && (
                            product.sizes ? (
                              getSizedQty(product.name) > 0 ? (
                                <div className="quantity-control">
                                  <button className="qty-btn" onClick={() => setSizeModalProduct(product)}>-</button>
                                  <span className="qty-text">{getSizedQty(product.name)}</span>
                                  <button className="qty-btn" onClick={() => setSizeModalProduct(product)}>+</button>
                                </div>
                              ) : (
                                <button className="add-btn" onClick={() => setSizeModalProduct(product)}>
                                  <span className="plus-sign">+</span>
                                </button>
                              )
                            ) : (
                              cart[product.name] ? (
                                <div className="quantity-control">
                                  <button className="qty-btn" onClick={() => updateCart(product.name, -1)}>-</button>
                                  <span className="qty-text">{cart[product.name]}</span>
                                  <button className="qty-btn" onClick={() => updateCart(product.name, 1)}>+</button>
                                </div>
                              ) : (
                                <button className="add-btn" onClick={() => updateCart(product.name, 1)}>
                                  <span className="plus-sign">+</span>
                                </button>
                              )
                            )
                          )}
                        </div>
                        <div className="product-details">
                          {product.in_stock === 0 && (
                            <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Out of Stock. Coming Soon</div>
                          )}
                          <div className={`price-row ${product.in_stock === 0 ? 'greyed-out' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                              <span className="current-price">₹{product.currentPrice}</span>
                              <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px' }}>₹{product.cutPrice}</span>
                              {product.cutPrice > product.currentPrice && (
                                <span style={{ color: '#c2410c', backgroundColor: '#fff2e6', border: '1px solid #ffd6b3', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', marginLeft: '4px' }}>
                                  {Math.round(Math.abs(product.cutPrice - product.currentPrice) / product.cutPrice * 100)}% off
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: '#fff0f2', padding: '2px 6px', borderRadius: '4px' }}>
                              <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 'bold' }}>{product.rating}</span>
                              <span style={{ fontSize: '10px' }}>⭐</span>
                            </div>
                          </div>
                          <h3 className="product-name">{product.name}</h3>
                          <p className="product-quantity">{product.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Banners */}
              {banners.length > 0 && (
                <div className="banner-section mb-4" style={{ marginTop: '16px', marginLeft: '16px', marginRight: '16px', overflow: 'hidden', borderRadius: '16px' }}>
                  <div className="banner-scroll-container" ref={bannerScrollRef} style={{ display: 'flex', overflowX: 'auto', scrollBehavior: 'smooth', snapType: 'x mandatory', gap: '16px', padding: 0, scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {banners.map((banner, idx) => (
                      <img
                        key={idx}
                        src={`http://localhost:8000${banner.image}`}
                        alt="Promo Banner"
                        style={{
                          flex: '0 0 100%',
                          width: '100%',
                          height: '160px',
                          objectFit: 'fill',
                          borderRadius: '16px',
                          scrollSnapAlign: 'start',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Featured Reviews */}
              {featuredReviews.length > 0 && (
                <div className="section mt-2" style={{ padding: '16px 0', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ padding: '0 16px', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      ⭐ Happy Customers
                    </h3>
                  </div>
                  <div style={{ display: 'flex', overflowX: 'auto', gap: '16px', margin: '0 16px', padding: '4px 0', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {featuredReviews.map((rev, idx) => (
                      <div key={idx} style={{
                        flex: '0 0 280px',
                        backgroundColor: 'var(--white)',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#1e293b' }}>{rev.customer_name}</h4>
                          <div style={{ display: 'flex', color: '#eab308', fontSize: '14px' }}>
                            {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', color: '#475569', fontStyle: 'italic', lineHeight: '1.4' }}>
                          "{rev.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Sleek App Banner */}
              <div style={{
                backgroundColor: '#ffffff',
                padding: '24px 16px 16px', // Cut down bottom padding
                marginTop: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <h2 style={{
                    fontSize: '36px',
                    fontWeight: '800',
                    lineHeight: '1.1',
                    color: '#111827',
                    margin: 0,
                    letterSpacing: '-1px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    flex: 1
                  }}>
                    Your daily<br />essentials in<br />one app <span style={{ color: '#ff3b30' }}>❤️</span>
                  </h2>

                  <img
                    src="/jupiter_fresh_logo.png"
                    alt="Jupiter Fresh"
                    style={{
                      height: '76px', // Expanded visibility
                      objectFit: 'contain',
                      maxWidth: '120px'
                    }}
                  />
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  opacity: 0.2,
                  marginTop: '8px'
                }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#000000' }}></div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '-4px' }}>
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </div>
              </div>
            </>
          )}

          {/* Category Page Split-Screen */}
          {activeTab === 'category' && (
            <div className="category-page-container">
              {/* Left Sidebar */}
              <div className="category-sidebar">
                {categoryTabCategories.filter(c => c.name !== 'All').map((cat, idx) => (
                  <div
                    key={idx}
                    className={`category-sidebar-item ${categoryTabActiveCategory === cat.name ? 'active' : ''}`}
                    onClick={() => {
                      setCategoryTabActiveCategory(cat.name);
                      setCategoryTabGenderFilter('All');
                      setCategoryTabSizeFilter('All');
                    }}
                  >
                    <div className="icon-wrapper">
                      <img src={cat.iconUrl} alt={cat.name} />
                    </div>
                    <span>{cat.name}</span>
                  </div>
                ))}
              </div>

              {/* Right Content */}
              <div className="category-content">
                {/* Horizontal Main Categories Panel */}
                <div style={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: '8px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--white)',
                  borderBottom: '1px solid #f1f5f9',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  flexShrink: 0
                }}>
                  {mainCategories.map((mc, idx) => (
                    <button
                      key={mc.id}
                      onClick={() => {
                        setCategoryTabMainCategory(mc.name);
                        setCategoryTabGenderFilter('All');
                        setCategoryTabSizeFilter('All');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '24px',
                        border: categoryTabMainCategory === mc.name ? '1px solid transparent' : '1px solid #e2e8f0',
                        whiteSpace: 'nowrap',
                        fontSize: '14px',
                        fontWeight: '700',
                        backgroundColor: categoryTabMainCategory === mc.name ? 'var(--primary)' : '#ffffff',
                        color: categoryTabMainCategory === mc.name ? 'var(--white)' : '#334155',
                        boxShadow: categoryTabMainCategory === mc.name ? '0 4px 12px rgba(2, 113, 185, 0.25)' : '0 1px 3px rgba(0,0,0,0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      <span style={{ fontSize: '15px' }}>
                        {mc.name.toLowerCase() === 'fresh' ? '🥬' : mc.name.toLowerCase() === 'food' ? '🍔' : mc.name.toLowerCase() === 'fashion' ? '👕' : mc.name.toLowerCase() === 'electronics' ? '📱' : '🛍️'}
                      </span>
                      {mc.name}
                    </button>
                  ))}
                </div>

                {/* Horizontal Sub-Subcategories Panel */}
                {categoryTabVisibleSubSubcategories.length > 0 && (
                  <div style={{
                    display: 'flex',
                    overflowX: 'auto',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: 'var(--white)',
                    borderBottom: '1px solid #f1f5f9',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    flexShrink: 0
                  }}>
                    {categoryTabVisibleSubSubcategories.map((ssc, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCategoryTabActiveSubSub(ssc.name)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          border: categoryTabActiveSubSub === ssc.name ? '1px solid transparent' : '1px solid #e2e8f0',
                          fontSize: '13px',
                          fontWeight: '600',
                          backgroundColor: categoryTabActiveSubSub === ssc.name ? '#0271b9' : '#ffffff',
                          color: categoryTabActiveSubSub === ssc.name ? 'var(--white)' : '#64748b',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {ssc.name}
                      </button>
                    ))}
                  </div>
                )}

                {['Fashion', 'Electronics'].includes(categoryTabMainCategory) && (
                  <div style={{ padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9' }}>
                    {categoryTabMainCategory === 'Fashion' && (
                      <div style={{ position: 'relative' }}>
                        <select
                          value={categoryTabGenderFilter}
                          onChange={(e) => setCategoryTabGenderFilter(e.target.value)}
                          style={{
                            padding: '6px 24px 6px 12px',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: '#f8fafc',
                            color: '#334155',
                            appearance: 'none',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="All">All Genders</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="UNISEX">Unisex</option>
                        </select>
                        <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8', fontSize: '9px' }}>▼</span>
                      </div>
                    )}
                    {categoryTabMainCategory === 'Fashion' && categoryTabAvailableSizes.length > 0 && (
                      <div style={{ position: 'relative' }}>
                        <select
                          value={categoryTabSizeFilter}
                          onChange={(e) => setCategoryTabSizeFilter(e.target.value)}
                          style={{
                            padding: '6px 24px 6px 12px',
                            borderRadius: '16px',
                            border: '1px solid #e2e8f0',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: '#f8fafc',
                            color: '#334155',
                            appearance: 'none',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="All">All Sizes</option>
                          {categoryTabAvailableSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                        <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8', fontSize: '9px' }}>▼</span>
                      </div>
                    )}
                    <div style={{ position: 'relative' }}>
                      <select
                        value={categoryTabPriceSort}
                        onChange={(e) => setCategoryTabPriceSort(e.target.value)}
                        style={{
                          padding: '6px 24px 6px 12px',
                          borderRadius: '16px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: '#f8fafc',
                          color: '#334155',
                          appearance: 'none',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="">Sort by Price</option>
                        <option value="low_to_high">Price: Low to High</option>
                        <option value="high_to_low">Price: High to Low</option>
                      </select>
                      <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8', fontSize: '9px' }}>▼</span>
                    </div>
                  </div>
                )}

                <div className="product-grid" style={{ paddingTop: '12px' }}>
                  {(categoryData[categoryTabVisibleSubSubcategories.length > 0 ? categoryTabActiveSubSub : categoryTabActiveCategory] || [])
                    .filter(product => {
                      let genderMatch = true;
                      if (categoryTabMainCategory === 'Fashion' && categoryTabGenderFilter !== 'All') {
                        genderMatch = product.gender && product.gender.toUpperCase() === categoryTabGenderFilter.toUpperCase();
                      }
                      let sizeMatch = true;
                      if (categoryTabMainCategory === 'Fashion' && categoryTabSizeFilter !== 'All') {
                        sizeMatch = product.sizes && product.sizes.split(',').map(s => s.trim()).includes(categoryTabSizeFilter);
                      }
                      return genderMatch && sizeMatch;
                    })
                    .sort((a, b) => {
                      if (!['Fashion', 'Electronics'].includes(categoryTabMainCategory) || !categoryTabPriceSort) return 0;
                      if (categoryTabPriceSort === 'low_to_high') return a.price - b.price;
                      if (categoryTabPriceSort === 'high_to_low') return b.price - a.price;
                      return 0;
                    })
                    .map((product, idx) => (
                      <div key={idx} className={`product-card ${product.in_stock === 0 ? 'out-of-stock' : ''}`} style={{ minWidth: 'auto', width: '100%', maxWidth: '100%', margin: 0 }}>
                        <div className="product-image-container">
                          {product.gender && (
                            <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: '#334155', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', zIndex: 1 }}>
                              {product.gender}
                            </div>
                          )}
                          <ProductImageSlider product={product} />
                          {product.in_stock !== 0 && (
                            product.sizes ? (
                              getSizedQty(product.name) > 0 ? (
                                <div className="quantity-control">
                                  <button className="qty-btn" onClick={() => setSizeModalProduct(product)}>-</button>
                                  <span className="qty-text">{getSizedQty(product.name)}</span>
                                  <button className="qty-btn" onClick={() => setSizeModalProduct(product)}>+</button>
                                </div>
                              ) : (
                                <button className="add-btn" onClick={() => setSizeModalProduct(product)}>
                                  <span className="plus-sign">+</span>
                                </button>
                              )
                            ) : (
                              cart[product.name] ? (
                                <div className="quantity-control">
                                  <button className="qty-btn" onClick={() => updateCart(product.name, -1)}>-</button>
                                  <span className="qty-text">{cart[product.name]}</span>
                                  <button className="qty-btn" onClick={() => updateCart(product.name, 1)}>+</button>
                                </div>
                              ) : (
                                <button className="add-btn" onClick={() => updateCart(product.name, 1)}>
                                  <span className="plus-sign">+</span>
                                </button>
                              )
                            )
                          )}
                        </div>
                        <div className="product-details">
                          {product.in_stock === 0 && (
                            <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>Out of Stock. Coming Soon</div>
                          )}
                          <div className={`price-row ${product.in_stock === 0 ? 'greyed-out' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                              <span className="current-price">₹{product.currentPrice}</span>
                              <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px' }}>₹{product.cutPrice}</span>
                              {product.cutPrice > product.currentPrice && (
                                <span style={{ color: '#16a34a', fontSize: '11px', fontWeight: 'bold', marginLeft: '4px' }}>
                                  {Math.round(Math.abs(product.cutPrice - product.currentPrice) / product.cutPrice * 100)}% off
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: '#f0fdf4', padding: '2px 6px', borderRadius: '4px' }}>
                              <span style={{ fontSize: '12px', color: '#15803d', fontWeight: 'bold' }}>{product.rating}</span>
                              <span style={{ fontSize: '10px' }}>⭐</span>
                            </div>
                          </div>
                          <h3 className="product-name">{product.name}</h3>
                          <p className="product-quantity">{product.quantity}</p>
                        </div>
                      </div>
                    ))}
                </div>
                {!(categoryData[categoryTabVisibleSubSubcategories.length > 0 ? categoryTabActiveSubSub : categoryTabActiveCategory] || []).length && (
                  <p style={{ textAlign: 'center', marginTop: '40px', color: '#64748b', fontSize: '14px' }}>No products found.</p>
                )}
              </div>
            </div>
          )}

          {/* Cart Page */}
          {activeTab === 'cart' && (
            <div className="cart-page-container" style={{ paddingBottom: '90px' }}>
              <div className="cart-header">
                <ArrowLeft size={24} style={{ marginRight: '16px', cursor: 'pointer', color: 'var(--primary)' }} onClick={() => setActiveTab('home')} />
                <h1>Cart ({totalCartItems} items)</h1>
              </div>

              {cartDetails.items.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingCart size={64} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                  <h3>Your cart is empty</h3>
                  <p>Looks like you haven't added anything yet.</p>
                  <button
                    onClick={() => setActiveTab('home')}
                    style={{ backgroundColor: 'var(--primary-green)', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div style={{ padding: '16px' }}>
                  {/* Cart Items List */}
                  <div className="cart-items-section" style={{ padding: '0', backgroundColor: 'transparent', marginBottom: '24px' }}>
                    {cartDetails.items.map((item, idx) => (
                      <div key={idx} className="cart-item-row-new">
                        <img src={item.image?.startsWith('/uploads') ? `http://localhost:8000${item.image}` : item.image} alt={item.name} className="cart-item-image" />
                        <div className="cart-item-info">
                          <h4 className="cart-item-name">
                            {item.name} {item.selectedSize && <span style={{ fontSize: '12px', color: '#64748b' }}>({item.selectedSize.toUpperCase()})</span>}
                          </h4>
                          <p className="cart-item-qty">{item.quantity}</p>
                          <span className="cart-item-price-unit">₹{item.currentPrice}</span>
                        </div>
                        <div className="cart-item-actions">
                          <span className="cart-item-total">₹{item.currentPrice * item.qty}</span>
                          <div className="quantity-control-new">
                            <button className="qty-btn" onClick={() => updateCart(item.name, -1, item.selectedSize)}>-</button>
                            <span className="qty-text">{item.qty}</span>
                            <button className="qty-btn" onClick={() => updateCart(item.name, 1, item.selectedSize)}>+</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Section */}
                  <div className="coupon-section" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                      <input
                        type="text"
                        className="coupon-input"
                        placeholder="Enter Coupon Code (e.g. FIRST20)"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                      />
                      <button
                        className="coupon-apply-btn"
                        onClick={handleApplyCoupon}
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <span style={{ color: '#ef4444', fontSize: '13px', marginLeft: '4px' }}>{couponError}</span>}
                    {appliedCoupon && !couponError && <span style={{ color: 'var(--primary-green)', fontSize: '13px', fontWeight: 'bold', marginLeft: '4px' }}>'{appliedCoupon}' applied successfully!</span>}
                  </div>

                  {/* Delivery Details */}
                  <div className="delivery-details-section" style={{ backgroundColor: 'var(--white)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)', margin: 0 }}>Delivery Details</h3>
                      {(savedAddresses.length > 0 && addingNewAddress) && (
                        <button onClick={() => setAddingNewAddress(false)} style={{ fontSize: '13px', color: 'var(--primary-green)', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}>
                          Cancel
                        </button>
                      )}
                    </div>

                    {savedAddresses.length > 0 && !addingNewAddress ? (
                      <div>
                        {savedAddresses.map(addr => (
                          <div
                            key={addr.id}
                            onClick={() => {
                              setSelectedAddressId(addr.id);
                              setDeliveryDetails({
                                ...deliveryDetails,
                                street: addr.address.split(',')[0] ? addr.address.split(',')[0].trim() : '',
                                locality: addr.address.split(',')[1] ? addr.address.split(',')[1].trim() : '',
                                city: addr.address.split(',')[2] ? addr.address.split(',')[2].trim() : '',
                                state: addr.address.split(',')[3] ? addr.address.split(',')[3].trim() : '',
                                landmark: addr.landmark || '',
                                lat: addr.lat,
                                lng: addr.lng
                              });
                            }}
                            style={{
                              padding: '12px',
                              border: selectedAddressId === addr.id ? '2px solid var(--primary-green)' : '1px solid #e2e8f0',
                              borderRadius: '8px',
                              marginBottom: '12px',
                              cursor: 'pointer',
                              backgroundColor: selectedAddressId === addr.id ? '#f0fdf4' : 'white',
                              position: 'relative'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 'bold', backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', color: '#475569' }}>
                                {addr.label}
                              </span>
                            </div>
                            <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#334155', fontWeight: '500' }}>{addr.address}</p>
                            {addr.landmark && <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Landmark: {addr.landmark}</p>}

                            {selectedAddressId === addr.id && (
                              <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--primary-green)' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              </div>
                            )}
                          </div>
                        ))}

                        <button
                          onClick={() => {
                            setSelectedAddressId(null);
                            setAddingNewAddress(true);
                            setDeliveryDetails({ ...deliveryDetails, street: '', building: '', locality: '', landmark: '', city: '', state: '', lat: null, lng: null });
                          }}
                          style={{ width: '100%', padding: '12px', border: '1px dashed var(--primary-green)', borderRadius: '8px', backgroundColor: 'transparent', color: 'var(--primary-green)', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                        >
                          <span style={{ fontSize: '18px' }}>+</span> Add New Address
                        </button>
                      </div>
                    ) : (
                      <div>
                        <AddressMap lat={deliveryDetails.lat} lng={deliveryDetails.lng} onChange={(lat, lng) => setDeliveryDetails({ ...deliveryDetails, lat, lng })} />
                        {isOutOfRange && (
                          <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginTop: '12px', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>
                            We are not currently available in this location.
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                          <input
                            type="text"
                            placeholder="Receiver's Name"
                            className="delivery-input"
                            value={deliveryDetails.name}
                            onChange={(e) => setDeliveryDetails({ ...deliveryDetails, name: e.target.value })}
                          />
                          <input
                            type="tel"
                            placeholder="10 digit mobile number"
                            className="delivery-input"
                            value={deliveryDetails.phone}
                            maxLength={10}
                            onChange={(e) => setDeliveryDetails({ ...deliveryDetails, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          />
                          <input
                            type="text"
                            placeholder="Street Name"
                            className="delivery-input"
                            value={deliveryDetails.street || ''}
                            onChange={(e) => setDeliveryDetails({ ...deliveryDetails, street: e.target.value })}
                          />
                          <input
                            type="text"
                            placeholder="Building Name / House No"
                            className="delivery-input"
                            value={deliveryDetails.building || ''}
                            onChange={(e) => setDeliveryDetails({ ...deliveryDetails, building: e.target.value })}
                          />
                          <input
                            type="text"
                            placeholder="Locality / Area"
                            className="delivery-input"
                            value={deliveryDetails.locality || ''}
                            onChange={(e) => setDeliveryDetails({ ...deliveryDetails, locality: e.target.value })}
                          />
                          <input
                            type="text"
                            placeholder="Landmark (Optional)"
                            className="delivery-input"
                            value={deliveryDetails.landmark || ''}
                            onChange={(e) => setDeliveryDetails({ ...deliveryDetails, landmark: e.target.value })}
                          />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              placeholder="City"
                              className="delivery-input"
                              style={{ flex: 1 }}
                              value={deliveryDetails.city || ''}
                              onChange={(e) => setDeliveryDetails({ ...deliveryDetails, city: e.target.value })}
                            />
                            <input
                              type="text"
                              placeholder="State"
                              className="delivery-input"
                              style={{ flex: 1 }}
                              value={deliveryDetails.state || ''}
                              onChange={(e) => setDeliveryDetails({ ...deliveryDetails, state: e.target.value })}
                            />
                          </div>

                          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                            <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>Save this address as (Optional)</p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {['Home', 'Work', 'Other'].map(label => (
                                <button
                                  key={label}
                                  type="button"
                                  onClick={() => setSaveAddressLabel(label)}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    border: saveAddressLabel === label ? '1px solid var(--primary-green)' : '1px solid #cbd5e1',
                                    backgroundColor: saveAddressLabel === label ? '#dcfce7' : 'white',
                                    color: saveAddressLabel === label ? 'var(--primary-green)' : '#64748b'
                                  }}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bill Details */}
                  <div className="bill-details-section" style={{ borderRadius: '12px' }}>
                    <h3 className="bill-details-title">Bill Details</h3>
                    <div className="bill-row">
                      <span>Item Total</span>
                      <span>₹{cartDetails.itemTotal}</span>
                    </div>
                    {cartDetails.discountAmount > 0 && (
                      <div className="bill-row" style={{ color: 'var(--primary-green)' }}>
                        <span>Coupon Discount</span>
                        <span>-₹{cartDetails.discountAmount}</span>
                      </div>
                    )}
                    <div className="bill-row">
                      <span>Delivery Fee</span>
                      <span>{cartDetails.deliveryFee === 0 ? <span style={{ color: 'var(--primary-green)' }}>FREE</span> : `₹${cartDetails.deliveryFee}`}</span>
                    </div>
                    <div className="bill-row grand-total">
                      <span>Grand Total</span>
                      <span>₹{cartDetails.grandTotal}</span>
                    </div>
                  </div>

                  {/* Place Order CTA */}
                  <button
                    className="place-order-btn"
                    onClick={handlePlaceOrder}
                    disabled={isOutOfRange}
                    style={isOutOfRange ? { backgroundColor: '#94a3b8', cursor: 'not-allowed' } : {}}
                  >
                    <span>Place Order</span>
                    <span>₹{cartDetails.grandTotal}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Orders Page */}
          {activeTab === 'orders' && (
            <div className="orders-page-container" style={{ paddingBottom: '90px' }}>
              <div className="orders-header" style={{ padding: '24px 16px 8px 16px' }}>
                <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '24px', fontWeight: '800' }}>My Orders</h2>
              </div>

              <div style={{ padding: '16px' }}>
                {(!user || userOrders.length === 0) ? (
                  <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
                    <ShoppingBag size={64} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', margin: '16px 0 8px 0' }}>{!user ? 'Log in to view orders' : 'No orders yet'}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--gray-text)', marginBottom: '24px' }}>{!user ? 'You need to be logged in to track your order history.' : 'Looks like you haven\'t placed any orders yet.'}</p>
                    <button
                      onClick={() => !user ? setIsAuthModalOpen(true) : setActiveTab('home')}
                      style={{ backgroundColor: 'var(--primary-green)', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                    >
                      {!user ? 'Log In' : 'Start Shopping'}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {userOrders.map((order) => (
                      <div key={order.id} className="order-card" style={{ backgroundColor: 'var(--white)', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e2e8f0', paddingBottom: '12px', marginBottom: '12px' }}>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{order.id}</span>
                            <p style={{ fontSize: '12px', color: 'var(--gray-text)', margin: '4px 0 0 0' }}>{order.date}</p>
                          </div>
                          <span style={{
                            backgroundColor: order.status === 'Delivered' ? '#dcfce7' : (order.status === 'Placed' ? '#f1f5f9' : '#e0f2fe'),
                            color: order.status === 'Delivered' ? '#16a34a' : (order.status === 'Placed' ? '#475569' : '#0284c7'),
                            padding: '4px 12px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}>
                            {order.status || 'Placed'}
                          </span>
                        </div>

                        {['On the way to Hub', 'Picked Up', 'On the way', 'Arrived'].includes(order.status) && order.eta && (
                          <div style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '10px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                            <Timer size={16} /> ETA: {order.eta}
                          </div>
                        )}
                        {order.status === 'Delivered' && order.eta && (
                          <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '10px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                            <Zap size={16} color="#eab308" /> Whoosh!! the order is delivered in {order.eta}
                          </div>
                        )}
                        {order.dp_name && (
                          <div style={{ backgroundColor: '#f8fafc', color: '#334155', padding: '10px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', border: '1px solid #e2e8f0' }}>
                            <User size={16} color="#64748b" /> Delivery Partner: {order.dp_name} ({order.dp_phone})
                          </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--primary)' }}>
                              <span>{item.qty}x {item.name} {item.selectedSize && `(${item.selectedSize.toUpperCase()})`}</span>
                              <span style={{ fontWeight: '600' }}>₹{item.currentPrice * item.qty}</span>
                            </div>
                          ))}
                        </div>

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--gray-text)' }}>
                            <span>Delivery Charge</span>
                            <span style={{ fontWeight: '600', color: 'var(--primary)' }}>₹{order.deliveryDetails?.deliveryFee || 0}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: 'var(--gray-text)' }}>{order.items.reduce((sum, item) => sum + item.qty, 0)} Items</span>
                            <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)' }}>Total: ₹{order.grandTotal}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {order.status === 'Delivered' && (
                              <button
                                onClick={() => downloadInvoice(order)}
                                style={{ flex: 1, backgroundColor: 'var(--white)', border: '1px solid var(--primary-green)', color: 'var(--primary-green)', padding: '10px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', textAlign: 'center' }}
                              >
                                Download Invoice
                              </button>
                            )}
                            {(!order.status || order.status === 'Placed') && (
                              <button
                                onClick={() => cancelOrder(order.id)}
                                style={{ flex: 1, backgroundColor: '#fee2e2', border: '1px solid #ef4444', color: '#b91c1c', padding: '10px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', textAlign: 'center' }}
                              >
                                Cancel Order
                              </button>
                            )}
                          </div>
                          <div style={{ textAlign: 'center', marginTop: '8px' }}>
                            <a
                              href={`https://wa.me/+919239606687?text=${encodeURIComponent(`Hi, my name is ${user?.name || 'Customer'}. My Order id is ${order.id} containing ${order.items.map(item => `${item.name}${item.selectedSize ? ` (${item.selectedSize.toUpperCase()})` : ''} x ${item.qty}`).join(', ')}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '13px', color: 'var(--primary-green)', textDecoration: 'underline', fontWeight: '600' }}
                            >
                              Need help with this order?
                            </a>
                          </div>
                          {order.status === 'Delivered' && (
                            <>
                              <OrderRatingWidget order={order} onReviewSubmitted={handleReviewSubmitted} />
                              <DeliveryRatingWidget order={order} onReviewSubmitted={handleDeliveryReviewSubmitted} />
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Profile Page */}
          {activeTab === 'profile' && (
            <div className="profile-page-container" style={{ paddingBottom: '90px' }}>
              <div className="orders-header" style={{ padding: '24px 16px 8px 16px' }}>
                <h2 style={{ margin: 0, color: 'var(--primary)', fontSize: '24px', fontWeight: '800' }}>Profile</h2>
              </div>
              <div style={{ padding: '16px' }}>
                {user ? (
                  <>
                    <div style={{ backgroundColor: 'var(--white)', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--light-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-green)', overflow: 'hidden' }}>
                          {user.picture ? <img src={user.picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={32} />}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--primary)' }}>{user.name}</h3>
                          <p style={{ margin: '4px 0 0 0', color: 'var(--gray-text)', fontSize: '14px' }}>{user.email}</p>

                          {isEditingPhone ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                              <span style={{ fontSize: '14px', color: 'var(--gray-text)' }}>+91</span>
                              <input
                                type="tel"
                                value={editPhoneInput}
                                onChange={(e) => setEditPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                maxLength={10}
                                style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 8px', fontSize: '14px', width: '120px' }}
                                autoFocus
                              />
                              <button onClick={handleUpdatePhone} style={{ background: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>Save</button>
                              <button onClick={() => setIsEditingPhone(false)} style={{ background: '#f1f5f9', color: 'var(--gray-text)', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <p style={{ margin: 0, color: 'var(--gray-text)', fontSize: '14px' }}>+91 {user.phone}</p>
                              <button
                                onClick={() => {
                                  setEditPhoneInput(user.phone || '');
                                  setIsEditingPhone(true);
                                }}
                                style={{ background: 'none', border: 'none', color: 'var(--primary-green)', fontSize: '12px', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                        <button
                          onClick={() => {
                            setUser(null);
                            setActiveTab('home');
                          }}
                          style={{ width: '100%', padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}
                        >
                          Log Out
                        </button>
                      </div>
                    </div>

                    {/* Address Book Section */}
                    <div style={{ marginTop: '24px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', marginBottom: '16px' }}>Address Book</h3>
                      {savedAddresses.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {savedAddresses.map(addr => (
                            <div key={addr.id} style={{ backgroundColor: 'var(--white)', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                  <span style={{ fontSize: '12px', fontWeight: 'bold', backgroundColor: '#e2e8f0', padding: '4px 8px', borderRadius: '12px', color: '#475569' }}>
                                    {addr.label}
                                  </span>
                                </div>
                                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#334155', fontWeight: '500' }}>{addr.address}</p>
                                {addr.landmark && <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Landmark: {addr.landmark}</p>}
                              </div>
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ backgroundColor: 'var(--white)', padding: '24px', borderRadius: '12px', textAlign: 'center', color: '#64748b' }}>
                          <MapPin size={32} style={{ opacity: 0.5, marginBottom: '12px' }} />
                          <p style={{ margin: 0, fontSize: '14px' }}>No saved addresses yet.</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
                    <User size={64} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)', margin: '16px 0 8px 0' }}>Not logged in</h3>
                    <p style={{ fontSize: '14px', color: 'var(--gray-text)', marginBottom: '24px' }}>Log in to view your profile and manage your details.</p>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      style={{ backgroundColor: 'var(--primary-green)', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                    >
                      Log In / Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div style={{ padding: '24px 16px', backgroundColor: 'var(--white)', minHeight: '100vh', paddingTop: '80px' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '16px' }}>About Us</h2>
              <p style={{ lineHeight: '1.6', color: '#475569', marginBottom: '16px' }}>
                Welcome to <strong>Jupiter Fresh</strong>, a brand proudly brought to you by <strong>LAMIA ENTERPRISES PRIVATE LIMITED</strong>.
              </p>
              <p style={{ lineHeight: '1.6', color: '#475569', marginBottom: '16px' }}>
                Our mission is to bring the freshest groceries, highest quality food, latest fashion, and top-tier electronics straight to your doorstep. We believe in providing a seamless shopping experience where quality meets convenience.
              </p>
              <p style={{ lineHeight: '1.6', color: '#475569', marginBottom: '24px' }}>
                Thank you for choosing Jupiter Fresh for your daily needs.
              </p>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ color: '#334155', marginBottom: '12px', fontSize: '16px' }}>Contact Information</h4>
                <div style={{ color: '#475569', fontSize: '14px', lineHeight: '1.8' }}>
                  <strong>LAMIA ENTERPRISES PRIVATE LIMITED</strong><br />
                  Tipajani Para, Uttar Naji, Arapur, Englis Bazar, Arapur<br />
                  Old Malda, Malda<br />
                  West Bengal - 732143<br />
                  India<br />
                  <br />
                  <strong>Phone:</strong> +91 9733119263
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div style={{ padding: '24px 16px', backgroundColor: 'var(--white)', minHeight: '100vh', paddingTop: '80px' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Privacy Policy</h2>
              <p style={{ lineHeight: '1.6', color: '#475569', marginBottom: '16px' }}>
                <strong>Jupiter Fresh</strong> (under <strong>Lamia Enterprise</strong>) values your privacy and is committed to protecting your personal data.
              </p>
              <h4 style={{ color: '#334155', marginBottom: '8px' }}>1. Information We Collect</h4>
              <p style={{ lineHeight: '1.6', color: '#475569', marginBottom: '16px' }}>
                We collect information you provide directly to us, such as your name, delivery address, phone number, and order details, to fulfill your orders effectively.
              </p>
              <h4 style={{ color: '#334155', marginBottom: '8px' }}>2. How We Use Your Information</h4>
              <p style={{ lineHeight: '1.6', color: '#475569', marginBottom: '16px' }}>
                Your data is used strictly for processing orders, delivery coordination, and improving our services. We do not sell your personal data to third parties.
              </p>
              <h4 style={{ color: '#334155', marginBottom: '8px' }}>3. Data Security</h4>
              <p style={{ lineHeight: '1.6', color: '#475569', marginBottom: '16px' }}>
                We implement robust security measures to safeguard your personal information against unauthorized access.
              </p>
              <h4 style={{ color: '#334155', marginBottom: '8px' }}>4. Contact Us</h4>
              <p style={{ lineHeight: '1.6', color: '#475569' }}>
                For any privacy concerns, please contact Lamia Enterprise customer support.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div style={{ padding: '24px 16px', backgroundColor: 'var(--white)', minHeight: '100vh', paddingTop: '80px' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Terms and Conditions</h2>
              <p style={{ lineHeight: '1.6', color: '#475569', marginBottom: '16px' }}>
                These Terms and Conditions govern your use of <strong>Jupiter Fresh</strong>, a service operated by <strong>Lamia Enterprise</strong>.
              </p>
              <h4 style={{ color: '#334155', marginBottom: '8px' }}>1. Use of Service</h4>
              <p style={{ lineHeight: '1.6', color: '#475569', marginBottom: '16px' }}>
                By using our app, you agree to provide accurate information and use our services for lawful purposes only.
              </p>
              <h4 style={{ color: '#334155', marginBottom: '8px' }}>2. Orders and Pricing</h4>
              <p style={{ lineHeight: '1.6', color: '#475569', marginBottom: '16px' }}>
                All orders are subject to availability. Prices may change without prior notice, but we will always honor the price at the time of your checkout.
              </p>
              <h4 style={{ color: '#334155', marginBottom: '8px' }}>3. Delivery</h4>
              <p style={{ lineHeight: '1.6', color: '#475569', marginBottom: '16px' }}>
                We strive to deliver within the estimated timeframes, but Lamia Enterprise is not liable for delays caused by unforeseen circumstances.
              </p>
              <h4 style={{ color: '#334155', marginBottom: '8px' }}>4. Returns and Refunds</h4>
              <p style={{ lineHeight: '1.6', color: '#475569' }}>
                If you are unsatisfied with the quality of our fresh products, please contact us within 24 hours of delivery for a replacement or refund.
              </p>
            </div>
          )}
        </>
      )}

      {/* Floating WhatsApp Button */}
      <div style={{
        position: 'fixed',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        pointerEvents: 'none',
        zIndex: 999,
      }}>
        <a
          href="https://wa.me/+919239606687"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'absolute',
            bottom: '0',
            right: '20px',
            width: '56px',
            height: '56px',
            backgroundColor: '#25D366',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
            cursor: 'pointer',
            pointerEvents: 'auto',
            transition: 'transform 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp Support"
            style={{ width: '32px', height: '32px' }}
          />
        </a>
      </div>
      {/* Dynamic Floating Cart Button */}
      {totalCartItems > 0 && activeTab !== 'cart' && (
        <div style={{
          position: 'fixed',
          bottom: '76px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          pointerEvents: 'none',
          zIndex: 999,
        }}>
          <div
            onClick={() => setActiveTab('cart')}
            style={{
              position: 'absolute',
              bottom: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'max-content',
              padding: '8px 16px',
              gap: '24px',
              backgroundColor: 'var(--primary)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 12px rgba(2, 113, 185, 0.3)',
              cursor: 'pointer',
              pointerEvents: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {cartDetails.items.slice(0, 3).map((item, idx) => (
                  <div key={item.name + (item.selectedSize || '')} style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    marginLeft: idx > 0 ? '-20px' : '0',
                    border: '2px solid var(--primary)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10 - idx
                  }}>
                    {item.image ? (
                      <img src={item.image.startsWith('/uploads') ? `http://localhost:8000${item.image}` : item.image} alt="item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ShoppingBag size={20} color="var(--primary)" />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '15px', fontWeight: '700' }}>View cart</span>
                <span style={{ fontSize: '12px', fontWeight: '500', opacity: 0.9 }}>{totalCartItems} Item{totalCartItems > 1 ? 's' : ''}</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={20} color="white" />
            </div>
          </div>
        </div>
      )}


      {/* Bottom Nav */}
      <div className="bottom-nav">
        <div className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => { setActiveTab('home'); }}>
          <Home size={24} />
          <span>Home</span>
        </div>
        <div className={`nav-tab ${activeTab === 'category' ? 'active' : ''}`} onClick={() => setActiveTab('category')}>
          <Grid size={24} />
          <span>Category</span>
        </div>
        <div className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          <ShoppingBag size={24} />
          <span>My Orders</span>
        </div>
        <div className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <User size={24} />
          <span>Profile</span>
        </div>
      </div>

      {/* Auth Modal (Bottom Sheet) */}
      {isAuthModalOpen && (
        <>
          <div className="auth-backdrop" onClick={() => setIsAuthModalOpen(false)} />
          <div className="auth-bottom-sheet">
            <div className="auth-header">
              <h3>Sign in with Google</h3>
              <button className="close-auth-btn" onClick={() => setIsAuthModalOpen(false)}>×</button>
            </div>

            <div className="auth-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
              {!isCollectingPhone ? (
                <>
                  {Capacitor.isNativePlatform() ? (
                    <button
                      onClick={handleNativeGoogleLogin}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'white', color: '#334155', border: '1px solid #cbd5e1', padding: '12px 24px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google Logo" style={{ width: '20px', height: '20px' }} />
                      Sign in with Google
                    </button>
                  ) : (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                    />
                  )}
                  <p className="auth-terms" style={{ marginTop: '20px' }}>
                    By continuing, you agree to our Terms of Service & Privacy Policy
                  </p>
                </>
              ) : (
                <div style={{ width: '100%', padding: '0 20px' }}>
                  <p style={{ marginBottom: '16px', textAlign: 'center', color: '#64748b' }}>
                    Please enter your phone number to continue
                  </p>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <div className="phone-input-wrapper">
                      <span className="country-code">+91</span>
                      <input
                        type="tel"
                        placeholder="10 digit mobile number"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        maxLength={10}
                      />
                    </div>
                  </div>
                  <button className="primary-btn mt-4" onClick={handleSavePhone} style={{ width: '100%' }}>Save & Continue</button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {/* Rating Modal */}
      {pendingRatingOrder && (
        <>
          <div className="auth-overlay" onClick={() => setPendingRatingOrder(null)} />
          <div className="auth-modal" style={{ padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '400px', backgroundColor: 'white', position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1001 }}>
            <button className="close-btn" onClick={() => setPendingRatingOrder(null)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
            <h2 style={{ marginBottom: '8px', fontSize: '20px', color: '#0f172a' }}>Order Placed! 🎉</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>Would you like to rate your experience?</p>
            <OrderRatingWidget
              order={pendingRatingOrder}
              onReviewSubmitted={(orderId, rating, review) => {
                handleReviewSubmitted(orderId, rating, review);
                setPendingRatingOrder(null);
              }}
            />
            <button
              onClick={() => setPendingRatingOrder(null)}
              style={{ width: '100%', marginTop: '12px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
            >
              Skip for now
            </button>
          </div>
        </>
      )}
      {sizeModalProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSizeModalProduct(null)}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '24px', borderRadius: '24px', width: '90%', maxWidth: '380px', border: '1px solid rgba(255, 255, 255, 0.5)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#1e293b', fontWeight: '700', letterSpacing: '-0.5px' }}>{sizeModalProduct.name}</h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Select your size</span>
              </div>
              <button onClick={() => setSizeModalProduct(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '28px', lineHeight: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>&times;</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '4px' }}>
              {sizeModalFullSizes.map(sz => {
                const productSizes = sizeModalProduct.sizes ? sizeModalProduct.sizes.split(',').map(s => s.trim()) : [];
                const isAvailable = productSizes.includes(sz);
                const cartKey = `${sizeModalProduct.name}|${sz}`;
                const qty = cart[cartKey] || 0;
                return (
                  <div key={sz} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '12px', backgroundColor: qty > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 255, 255, 0.6)', border: qty > 0 ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.8)', transition: 'all 0.2s ease', opacity: isAvailable ? 1 : 0.6 }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: qty > 0 ? 'var(--primary-green)' : (isAvailable ? '#475569' : '#94a3b8'), textDecoration: isAvailable ? 'none' : 'line-through' }}>{sz.trim().toUpperCase()}</span>

                    {isAvailable ? (
                      qty > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button onClick={() => updateCart(sizeModalProduct.name, -1, sz)} style={{ border: 'none', background: 'white', color: '#475569', width: '28px', height: '28px', borderRadius: '50%', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>-</button>
                          <span style={{ color: '#1e293b', fontWeight: '700', fontSize: '15px', width: '16px', textAlign: 'center' }}>{qty}</span>
                          <button onClick={() => updateCart(sizeModalProduct.name, 1, sz)} style={{ border: 'none', background: 'var(--primary-green)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)' }}>+</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => updateCart(sizeModalProduct.name, 1, sz)}
                          style={{ backgroundColor: 'transparent', color: 'var(--primary-green)', padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--primary-green)', fontWeight: '600', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s ease' }}
                        >
                          Add
                        </button>
                      )
                    ) : (
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.1)', padding: '4px 10px', borderRadius: '12px' }}>Out of stock</span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setSizeModalProduct(null)}
              style={{ marginTop: '24px', width: '100%', padding: '14px', backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', letterSpacing: '0.5px', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
