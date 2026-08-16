import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import L from 'leaflet';

// Reliable custom icon using an emoji instead of external images which can fail
const customIcon = L.divIcon({
  html: '<div style="font-size: 32px; text-align: center; margin-top: -32px; margin-left: -16px; text-shadow: 2px 2px 4px rgba(0,0,0,0.4);">📍</div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon}></Marker>
  );
}

// Fixes Leaflet tile loading issues by invalidating size after mount
function MapFixer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);
  return null;
}

function MapFlyTo({ position }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16);
    }
  }, [position, map]);
  return null;
}

export default function AddressMap({ lat, lng, onChange }) {
  const [position, setPosition] = React.useState(lat && lng ? { lat, lng } : null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = React.useRef(null);

  useEffect(() => {
    if (lat && lng) {
      setPosition({ lat, lng });
    }
  }, [lat, lng]);

  const handleSetPosition = (newPos) => {
    setPosition(newPos);
    onChange(newPos.lat, newPos.lng);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const restrictedQuery = query.toLowerCase().includes('west bengal') ? query : `${query}, West Bengal`;
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(restrictedQuery)}&countrycodes=in`);
          const data = await res.json();
          setSearchResults(data || []);
        } catch (err) {
        console.error("Search error:", err);
      }
      setIsSearching(false);
    }, 500);
  };

  const handleSelectResult = (result) => {
    const latNum = parseFloat(result.lat);
    const lonNum = parseFloat(result.lon);
    handleSetPosition({ lat: latNum, lng: lonNum });
    setSearchQuery(result.display_name);
    setSearchResults([]);
  };

  const handleGetCurrentLocation = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const permissions = await Geolocation.requestPermissions();
        if (permissions.location !== 'granted') {
          alert("Location permission denied. Please enable it in your phone settings.");
          return;
        }
        const coordinates = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        handleSetPosition({ lat: coordinates.coords.latitude, lng: coordinates.coords.longitude });
      } else {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              handleSetPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            (err) => alert("Could not fetch location. Please ensure location services are enabled.")
          );
        } else {
          alert("Geolocation is not supported by this browser.");
        }
      }
    } catch (e) {
      alert("Error fetching location: " + e.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
      <div style={{ position: 'relative', zIndex: 1000 }}>
        <input 
          type="text" 
          placeholder="Search for a location..." 
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
        />
        {isSearching && <div style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '12px', color: '#64748b' }}>Searching...</div>}
        
        {searchResults.length > 0 && (
          <ul style={{ 
            position: 'absolute', top: '100%', left: 0, right: 0, 
            backgroundColor: 'white', border: '1px solid #cbd5e1', 
            borderRadius: '8px', marginTop: '4px', padding: 0, 
            listStyle: 'none', maxHeight: '200px', overflowY: 'auto', 
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
          }}>
            {searchResults.map((result, idx) => (
              <li 
                key={idx} 
                onClick={() => handleSelectResult(result)}
                style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {result.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button 
        onClick={handleGetCurrentLocation}
        type="button"
        style={{ padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        📍 Get Current Location automatically
      </button>
      
      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Or click on the map to manually set your exact location:</p>
      
      <div style={{ height: '200px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
        <MapContainer 
          center={position || [20.5937, 78.9629]} 
          zoom={position ? 15 : 5} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapFixer />
          <LocationMarker position={position} setPosition={handleSetPosition} />
          {position && <MapFlyTo position={position} />}
        </MapContainer>
      </div>
    </div>
  );
}
