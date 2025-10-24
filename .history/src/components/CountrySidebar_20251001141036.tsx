import React, { useState } from 'react';
import './CountrySidebar.css';

const countries: Record<string, { lat: number; lng: number; zoom: number }> = {
  USA: { lat: 37.0902, lng: -95.7129, zoom: 4 },
  Canada: { lat: 56.1304, lng: -106.3468, zoom: 4 },
  Egypt: { lat: 26.8206, lng: 30.8025, zoom: 5 },
  France: { lat: 46.6034, lng: 1.8883, zoom: 5 },
  Germany: { lat: 51.1657, lng: 10.4515, zoom: 5 },
  // ...add more countries as needed
};

interface CountrySidebarProps {
  onSearch: (lat: number, lng: number, zoom: number) => void;
}

const CountrySidebar: React.FC<CountrySidebarProps> = ({ onSearch }) => {
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');

  const handleSearch = () => {
    if (countries[country]) {
      setError('');
      const { lat, lng, zoom } = countries[country];
      onSearch(lat, lng, zoom);
    } else {
      setError('Country not found. Try USA, Canada, Egypt, France, Germany.');
    }
  };

  return (
    <aside className="country-sidebar">
      <div className="sidebar-header">
        <h2>🌍 Country Search</h2>
        <p>Find any country and zoom to its location!</p>
      </div>
      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Type country name..."
          value={country}
          onChange={e => setCountry(e.target.value)}
          className="sidebar-input"
        />
        <button className="sidebar-btn" onClick={handleSearch}>
          Search
        </button>
      </div>
      {error && <div className="sidebar-error">{error}</div>}
    </aside>
  );
};

export default CountrySidebar;
