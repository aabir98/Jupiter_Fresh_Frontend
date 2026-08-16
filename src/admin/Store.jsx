import React, { useState, useEffect } from 'react';

const ProductImageSlider = ({ product }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  let addImgs = [];
  try { addImgs = JSON.parse(product.additional_images || '[]'); } catch (e) {}
  
  const hasMultiple = addImgs.length > 0;
  const allImages = [product.image, ...addImgs].filter(Boolean);

  if (!hasMultiple) {
    return (
      <img src={product.image?.startsWith('/uploads') ? `http://192.168.0.112:8000${product.image}` : product.image} alt={product.name} style={{ width: '100%', height: '100px', objectFit: 'contain', marginBottom: '12px', borderRadius: '8px' }} />
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
    <div style={{ position: 'relative', width: '100%', height: '100px', marginBottom: '12px', borderRadius: '8px', overflow: 'hidden' }}>
      <div 
        id={`store-slider-${product.id}`} 
        style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', width: '100%', height: '100%', scrollbarWidth: 'none' }} 
        className="no-scrollbar"
        onScroll={handleScroll}
      >
        {allImages.map((img, i) => (
          <img 
            key={i} 
            src={img.startsWith('/uploads') ? `http://192.168.0.112:8000${img}` : img} 
            alt={`${product.name} ${i}`} 
            style={{ flex: '0 0 100%', scrollSnapAlign: 'center', objectFit: 'contain', width: '100%', height: '100%' }} 
          />
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: '4px', left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {allImages.map((_, i) => (
            <div 
              key={i} 
              onClick={(e) => { 
                e.stopPropagation(); 
                const slider = document.getElementById(`store-slider-${product.id}`);
                slider.scrollTo({ left: slider.clientWidth * i, behavior: 'smooth' });
              }}
              style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: i === activeIndex ? 'var(--primary-green, #10b981)' : 'rgba(0,0,0,0.3)', transition: 'background-color 0.2s', cursor: 'pointer' }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

function Store() {
  const [mainCategories, setMainCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);

  // Use 'deals' to represent the deals of the day section, otherwise it's a mainCategory ID
  const [activeMainCategory, setActiveMainCategory] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubSubcategory, setActiveSubSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stockFilter, setStockFilter] = useState('all');

  // Modals
  const [editingMainCategory, setEditingMainCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingDeal, setEditingDeal] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState([]);
  
  const openProductModal = (p = null) => {
    if (p) {
      setEditingProduct(p);
      setSelectedSizes(p.sizes ? p.sizes.split(',') : []);
    } else {
      setEditingProduct({ name: '', description: '', price: '', unit: '', currentPrice: '', cutPrice: '', in_stock: 1, image: '' });
      setSelectedSizes([]);
    }
  };
  
  const toggleSize = (size) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  useEffect(() => {
    fetchMainCategories();
    fetchCategories();
    fetchProducts();
    fetchDeals();
  }, []);

  const fetchMainCategories = async () => {
    const res = await fetch('http://192.168.0.112:8000/api/main-categories');
    const data = await res.json();
    setMainCategories(data);
    if (!activeMainCategory && data.length > 0) setActiveMainCategory(data[0].id);
  };

  const fetchCategories = async () => {
    const res = await fetch('http://192.168.0.112:8000/api/categories');
    const data = await res.json();
    setCategories(data);
  };

  const fetchProducts = async () => {
    const res = await fetch('http://192.168.0.112:8000/api/products');
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  const fetchDeals = async () => {
    const res = await fetch('http://192.168.0.112:8000/api/deals');
    const data = await res.json();
    setDeals(data);
  };

  const handleSaveMainCategory = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (!formData.get('name')) return;

    if (editingMainCategory.id) {
      await fetch(`http://192.168.0.112:8000/api/main-categories/${editingMainCategory.id}`, { method: 'PUT', body: formData });
    } else {
      await fetch(`http://192.168.0.112:8000/api/main-categories`, { method: 'POST', body: formData });
    }
    setEditingMainCategory(null);
    fetchMainCategories();
  };

  const handleDeleteMainCategory = async (id) => {
    if (window.confirm("Delete this main category and all its subcategories/products?")) {
      await fetch(`http://192.168.0.112:8000/api/main-categories/${id}`, { method: 'DELETE' });
      fetchMainCategories();
      fetchCategories();
      fetchProducts();
      if (activeMainCategory === id) {
        setActiveMainCategory(null);
        setActiveCategory(null);
      }
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (!formData.get('name')) return;
    formData.append('main_category_id', activeMainCategory);
    
    if (editingCategory.isSubSub) {
      formData.append('parent_category_id', activeCategory);
    }

    if (editingCategory.id) {
      await fetch(`http://192.168.0.112:8000/api/categories/${editingCategory.id}`, { method: 'PUT', body: formData });
    } else {
      await fetch(`http://192.168.0.112:8000/api/categories`, { method: 'POST', body: formData });
    }
    setEditingCategory(null);
    fetchCategories();
  };

  const handleDeleteCategory = async (id, isSubSub = false) => {
    if (window.confirm("Delete this category and all its contents?")) {
      await fetch(`http://192.168.0.112:8000/api/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
      fetchProducts();
      if (!isSubSub && activeCategory === id) {
        setActiveCategory(null);
        setActiveSubSubcategory(null);
      } else if (isSubSub && activeSubSubcategory === id) {
        setActiveSubSubcategory(null);
      }
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inStockVal = formData.get('in_stock') === 'on' ? 1 : 0;
    formData.set('in_stock', inStockVal);
    
    const targetCategoryId = activeSubSubcategory || activeCategory;
    formData.append('category_id', targetCategoryId);
    
    if (selectedSizes.length > 0) {
      formData.append('sizes', selectedSizes.join(','));
    } else {
      formData.append('sizes', '');
    }

    if (editingProduct.id) {
      await fetch(`http://192.168.0.112:8000/api/products/${editingProduct.id}`, { method: 'PUT', body: formData });
    } else {
      await fetch(`http://192.168.0.112:8000/api/products`, { method: 'POST', body: formData });
    }
    setEditingProduct(null);
    setSelectedSizes([]);
    fetchProducts();
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Delete this product?")) {
      await fetch(`http://192.168.0.112:8000/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    }
  };

  const handleSaveDeal = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inStockVal = formData.get('in_stock') === 'on' ? 1 : 0;
    formData.set('in_stock', inStockVal);

    if (editingDeal.id) {
      await fetch(`http://192.168.0.112:8000/api/deals/${editingDeal.id}`, { method: 'PUT', body: formData });
    } else {
      await fetch(`http://192.168.0.112:8000/api/deals`, { method: 'POST', body: formData });
    }
    setEditingDeal(null);
    fetchDeals();
  };

  const handleDeleteDeal = async (id) => {
    if (window.confirm("Delete this deal?")) {
      await fetch(`http://192.168.0.112:8000/api/deals/${id}`, { method: 'DELETE' });
      fetchDeals();
    }
  };

  let currentSubcategories = categories.filter(c => c.main_category_id === activeMainCategory && !c.parent_category_id);
  let currentSubSubcategories = activeCategory ? categories.filter(c => c.parent_category_id === activeCategory) : [];
  
  useEffect(() => {
    if (activeMainCategory && activeMainCategory !== 'deals') {
      const subs = categories.filter(c => c.main_category_id === activeMainCategory && !c.parent_category_id);
      if (subs.length > 0 && !subs.find(c => c.id === activeCategory)) {
        setActiveCategory(subs[0].id);
        setActiveSubSubcategory(null);
      } else if (subs.length === 0) {
        setActiveCategory(null);
        setActiveSubSubcategory(null);
      }
    }
  }, [activeMainCategory, categories]);

  let targetCategoryId = activeSubSubcategory || activeCategory;
  let currentProducts = products.filter(p => p.category_id === targetCategoryId);
  if (stockFilter === 'in_stock') currentProducts = currentProducts.filter(p => p.in_stock !== 0);
  if (stockFilter === 'out_of_stock') currentProducts = currentProducts.filter(p => p.in_stock === 0);

  let currentDeals = deals;
  if (stockFilter === 'in_stock') currentDeals = currentDeals.filter(p => p.in_stock !== 0);
  if (stockFilter === 'out_of_stock') currentDeals = currentDeals.filter(p => p.in_stock === 0);

  const activeCategoryObj = categories.find(c => c.id === activeCategory);
  const isFashionMenWomen = activeCategoryObj && (activeCategoryObj.name.toLowerCase().trim() === 'men' || activeCategoryObj.name.toLowerCase().trim() === 'women');

  if (loading) return <div>Loading store data...</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1 style={{ margin: 0 }}>Store Inventory</h1>
        <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>Manage your main categories, subcategories, products, and deals.</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', padding: '20px', alignItems: 'flex-start' }}>
        
        {/* Sidebar Level 1: Main Categories + Deals */}
        <div style={{ width: '240px', backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px' }}>Store Sections</h3>
            <button onClick={() => setEditingMainCategory({})} style={{ backgroundColor: '#f1f5f9', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>+ Add Cat</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', backgroundColor: activeMainCategory === 'deals' ? '#eff2ff' : 'transparent', border: activeMainCategory === 'deals' ? '1px solid #bfdbfe' : '1px solid transparent' }}
              onClick={() => { setActiveMainCategory('deals'); setActiveCategory(null); }}
            >
              <span style={{ fontWeight: activeMainCategory === 'deals' ? 'bold' : 'normal', color: activeMainCategory === 'deals' ? '#0271b9' : '#334155', fontSize: '14px' }}>
                ⚡ Deals of the Day
              </span>
            </div>

            <hr style={{ borderTop: '1px solid #e2e8f0', margin: '4px 0' }} />

            {mainCategories.map(mc => (
              <div 
                key={mc.id} 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', backgroundColor: activeMainCategory === mc.id ? '#eff2ff' : 'transparent', border: activeMainCategory === mc.id ? '1px solid #bfdbfe' : '1px solid transparent' }}
                onClick={() => setActiveMainCategory(mc.id)}
              >
                <span style={{ fontWeight: activeMainCategory === mc.id ? 'bold' : 'normal', color: activeMainCategory === mc.id ? '#0271b9' : '#334155', fontSize: '14px' }}>
                  {mc.name}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={(e) => { e.stopPropagation(); setEditingMainCategory(mc); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', color: '#3b82f6', padding: 0 }}>Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteMainCategory(mc.id); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', color: '#ef4444', padding: 0 }}>Del</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Level 2: Subcategories (Hidden for deals) */}
        {activeMainCategory !== 'deals' && (
          <div style={{ width: '240px', backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '15px' }}>Subcategories</h3>
              <button 
                onClick={() => setEditingCategory({})} 
                disabled={!activeMainCategory}
                style={{ backgroundColor: activeMainCategory ? '#f1f5f9' : '#e2e8f0', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: activeMainCategory ? 'pointer' : 'not-allowed', fontSize: '12px' }}
              >
                + Add
              </button>
            </div>
            
            {!activeMainCategory ? (
              <p style={{ fontSize: '12px', color: '#64748b' }}>Select a main category first.</p>
            ) : currentSubcategories.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#64748b' }}>No subcategories found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentSubcategories.map(c => (
                  <div 
                    key={c.id} 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', backgroundColor: activeCategory === c.id ? '#eff6ff' : 'transparent', border: activeCategory === c.id ? '1px solid #bfdbfe' : '1px solid transparent' }}
                    onClick={() => { setActiveCategory(c.id); setActiveSubSubcategory(null); }}
                  >
                    <span style={{ fontWeight: activeCategory === c.id ? 'bold' : 'normal', color: activeCategory === c.id ? '#1e3a8a' : '#334155', fontSize: '14px' }}>{c.name}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={(e) => { e.stopPropagation(); setEditingCategory(c); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', color: '#3b82f6', padding: 0 }}>Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(c.id); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', color: '#ef4444', padding: 0 }}>Del</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sidebar Level 3: Sub-Subcategories */}
        {activeMainCategory !== 'deals' && isFashionMenWomen && (
          <div style={{ width: '240px', backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '15px' }}>Sub-Subcats</h3>
              <button 
                onClick={() => setEditingCategory({ isSubSub: true })} 
                style={{ backgroundColor: '#f1f5f9', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                + Add
              </button>
            </div>
            
            {currentSubSubcategories.length === 0 ? (
              <p style={{ fontSize: '12px', color: '#64748b' }}>No sub-subcategories found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentSubSubcategories.map(c => (
                  <div 
                    key={c.id} 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', backgroundColor: activeSubSubcategory === c.id ? '#eff6ff' : 'transparent', border: activeSubSubcategory === c.id ? '1px solid #bfdbfe' : '1px solid transparent' }}
                    onClick={() => setActiveSubSubcategory(c.id)}
                  >
                    <span style={{ fontWeight: activeSubSubcategory === c.id ? 'bold' : 'normal', color: activeSubSubcategory === c.id ? '#1e3a8a' : '#334155', fontSize: '14px' }}>{c.name}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={(e) => { e.stopPropagation(); setEditingCategory({ ...c, isSubSub: true }); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', color: '#3b82f6', padding: 0 }}>Edit</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(c.id, true); }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', color: '#ef4444', padding: 0 }}>Del</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Area: Products / Deals */}
        <div style={{ flex: 1, backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          {activeMainCategory === 'deals' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Deals of the Day</h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <select 
                    value={stockFilter} 
                    onChange={(e) => setStockFilter(e.target.value)}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#334155' }}
                  >
                    <option value="all">All Items</option>
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                  <button 
                    onClick={() => setEditingDeal({ name: '', quantity: '', currentPrice: '', cutPrice: '', rating: 4.5, image: '' })}
                    style={{ backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    + Add Deal
                  </button>
                </div>
              </div>

              {currentDeals.length === 0 ? (
                <p style={{ color: '#64748b' }}>No deals found.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {currentDeals.map(p => (
                    <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column' }}>
                      <img src={p.image?.startsWith('/uploads') ? `http://192.168.0.112:8000${p.image}` : p.image} alt={p.name} style={{ width: '100%', height: '100px', objectFit: 'contain', marginBottom: '12px' }} />
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{p.name}</h4>
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>{p.quantity}</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontWeight: 'bold', color: '#0f172a', marginRight: '6px' }}>₹{p.currentPrice}</span>
                          <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px' }}>₹{p.cutPrice}</span>
                        </div>
                        <span style={{ backgroundColor: '#f0fdf4', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>★ {p.rating}</span>
                      </div>
                      {p.in_stock === 0 && <div style={{ color: 'red', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Out of Stock</div>}
                      
                      <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                        <button onClick={() => setEditingDeal(p)} style={{ flex: 1, padding: '6px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                        <button onClick={() => handleDeleteDeal(p.id)} style={{ flex: 1, padding: '6px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : activeCategory ? (
            isFashionMenWomen && !activeSubSubcategory ? (
              <p style={{ color: '#64748b' }}>Please select a sub-subcategory under {activeCategoryObj?.name} to view/add products.</p>
            ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Products in {activeSubSubcategory ? categories.find(c => c.id === activeSubSubcategory)?.name : activeCategoryObj?.name}</h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <select 
                    value={stockFilter} 
                    onChange={(e) => setStockFilter(e.target.value)}
                    style={{ padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#334155' }}
                  >
                    <option value="all">All Items</option>
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                  <button 
                    onClick={() => openProductModal(null)}
                    style={{ backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    + Add Product
                  </button>
                </div>
              </div>

              {currentProducts.length === 0 ? (
                <p style={{ color: '#64748b' }}>No products in this subcategory.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {currentProducts.map(p => (
                    <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column' }}>
                      <ProductImageSlider product={p} />
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{p.name}</h4>
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>{p.quantity}</p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontWeight: 'bold', color: '#0f172a', marginRight: '6px' }}>₹{p.currentPrice}</span>
                          <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '12px' }}>₹{p.cutPrice}</span>
                        </div>
                        <span style={{ backgroundColor: '#f0fdf4', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>★ {p.rating}</span>
                      </div>
                      {p.in_stock === 0 && <div style={{ color: 'red', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Out of Stock</div>}
                      
                      <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                        <button onClick={() => openProductModal(p)} style={{ flex: 1, padding: '6px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                        <button onClick={() => handleDeleteProduct(p.id)} style={{ flex: 1, padding: '6px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
            )
          ) : (
            <p style={{ color: '#64748b' }}>Select a section to view products.</p>
          )}
        </div>
      </div>

      {/* Main Category Modal */}
      {editingMainCategory && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '300px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>{editingMainCategory.id ? 'Edit Main Category' : 'New Main Category'}</h3>
            <form onSubmit={handleSaveMainCategory}>
              <input name="name" defaultValue={editingMainCategory.name} placeholder="Main Category Name" style={{ width: '100%', padding: '8px', marginBottom: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} autoFocus required />
              <label style={{ fontSize: '12px', color: '#64748b' }}>Cover Image</label>
              <input name="image" type="file" accept="image/*" style={{ width: '100%', padding: '8px', marginBottom: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setEditingMainCategory(null)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '8px', backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {editingCategory && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '300px' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>{editingCategory.id ? 'Edit Subcategory' : 'New Subcategory'}</h3>
            <form onSubmit={handleSaveCategory}>
              <input name="name" defaultValue={editingCategory.name} placeholder="Subcategory Name" style={{ width: '100%', padding: '8px', marginBottom: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} autoFocus required />
              <label style={{ fontSize: '12px', color: '#64748b' }}>Subcategory Icon/Image</label>
              <input name="image" type="file" accept="image/*" style={{ width: '100%', padding: '8px', marginBottom: '16px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setEditingCategory(null)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '8px', backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>{editingProduct.id ? 'Edit Product' : 'New Product'}</h3>
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b' }}>Name</label>
                <input name="name" defaultValue={editingProduct.name} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b' }}>Quantity (e.g. '1 kg', '500 grams')</label>
                <input name="quantity" defaultValue={editingProduct.quantity} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#64748b' }}>Current Price (₹)</label>
                  <input name="currentPrice" type="number" step="0.01" defaultValue={editingProduct.currentPrice} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#64748b' }}>Cut Price (₹)</label>
                  <input name="cutPrice" type="number" step="0.01" defaultValue={editingProduct.cutPrice} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b' }}>Rating (e.g. 4.5)</label>
                <input name="rating" type="number" step="0.1" max="5" min="1" defaultValue={editingProduct.rating} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input name="in_stock" type="checkbox" defaultChecked={editingProduct.in_stock !== 0} id="product_in_stock" />
                <label htmlFor="product_in_stock" style={{ fontSize: '12px', color: '#64748b', cursor: 'pointer' }}>In Stock</label>
              </div>
              {(() => {
                const tCat = categories.find(c => c.id === targetCategoryId);
                const tName = tCat ? tCat.name.toLowerCase() : '';
                const isTopInner = tName.includes('topwear') || tName.includes('inner wear') || tName.includes('innerwear');
                const isBottom = tName.includes('bottomwear');
                const isShoes = tName.includes('shoes');
                
                let availableSizes = [];
                if (isTopInner) availableSizes = ['xs', 's', 'm', 'l', 'xl', 'xxl'];
                if (isBottom) availableSizes = ['20', '22', '24', '26', '28', '30', '32', '34'];
                if (isShoes) availableSizes = ['5', '6', '7', '8', '9', '10', '11'];
                
                if (availableSizes.length > 0) {
                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Available Sizes</label>
                        <button 
                          type="button"
                          onClick={() => {
                            if (selectedSizes.length === availableSizes.length) {
                              setSelectedSizes([]);
                            } else {
                              setSelectedSizes([...availableSizes]);
                            }
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--primary-green)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          {selectedSizes.length === availableSizes.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {availableSizes.map(sz => (
                          <div 
                            key={sz} 
                            onClick={() => toggleSize(sz)}
                            style={{ padding: '6px 12px', border: selectedSizes.includes(sz) ? '2px solid var(--primary-green)' : '1px solid #cbd5e1', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', backgroundColor: selectedSizes.includes(sz) ? '#f0fdf4' : 'white', color: selectedSizes.includes(sz) ? 'var(--primary-green)' : '#64748b', textTransform: 'uppercase' }}
                          >
                            {sz}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
              {(() => {
                const mCat = mainCategories.find(mc => mc.id === activeMainCategory);
                if (mCat && mCat.name.toLowerCase() === 'fashion') {
                  return (
                    <div>
                      <label style={{ fontSize: '12px', color: '#64748b' }}>Target Gender</label>
                      <select name="gender" defaultValue={editingProduct.gender || 'unisex'} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="unisex">Unisex</option>
                      </select>
                    </div>
                  );
                }
                return null;
              })()}
              
              {(() => {
                const mCat = mainCategories.find(mc => mc.id === activeMainCategory);
                const isFashion = mCat && mCat.name.toLowerCase() === 'fashion';
                return (
                  <div>
                    <label style={{ fontSize: '12px', color: '#64748b' }}>Product Image {isFashion ? '(Max 5)' : ''}</label>
                    <input 
                      name="image" 
                      type="file" 
                      accept="image/*" 
                      multiple={isFashion}
                      onChange={(e) => {
                        if (isFashion && e.target.files.length > 5) {
                          alert("You can only upload a maximum of 5 images.");
                          e.target.value = "";
                        }
                      }}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                    />
                    {editingProduct.image && <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Current: {editingProduct.image.split('/').pop()}</p>}
                    {isFashion && editingProduct.additional_images && JSON.parse(editingProduct.additional_images).length > 0 && (
                      <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Current additional images: {JSON.parse(editingProduct.additional_images).length}</p>
                    )}
                  </div>
                );
              })()}
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="button" onClick={() => setEditingProduct(null)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deal Modal */}
      {editingDeal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>{editingDeal.id ? 'Edit Deal' : 'New Deal'}</h3>
            <form onSubmit={handleSaveDeal} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b' }}>Name</label>
                <input name="name" defaultValue={editingDeal.name} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b' }}>Quantity (e.g. '1 kg')</label>
                <input name="quantity" defaultValue={editingDeal.quantity} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#64748b' }}>Current Price (₹)</label>
                  <input name="currentPrice" type="number" step="0.01" defaultValue={editingDeal.currentPrice} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: '#64748b' }}>Cut Price (₹)</label>
                  <input name="cutPrice" type="number" step="0.01" defaultValue={editingDeal.cutPrice} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b' }}>Rating (e.g. 4.5)</label>
                <input name="rating" type="number" step="0.1" max="5" min="1" defaultValue={editingDeal.rating} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input name="in_stock" type="checkbox" defaultChecked={editingDeal.in_stock !== 0} id="deal_in_stock" />
                <label htmlFor="deal_in_stock" style={{ fontSize: '12px', color: '#64748b', cursor: 'pointer' }}>In Stock</label>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b' }}>Deal Image</label>
                <input name="image" type="file" accept="image/*" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                {editingDeal.image && <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>Current: {editingDeal.image.split('/').pop()}</p>}
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button type="button" onClick={() => setEditingDeal(null)} style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: 'var(--primary-green)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Save Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Store;
