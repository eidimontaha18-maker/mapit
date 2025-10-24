import React, { useState } from 'react';
import './CountrySidebar.css';
import allCountries from '../assets/allCountries.json'; // Add a JSON file with all countries and their coordinates

interface CountrySidebarProps {
  onSearch: (lat: number, lng: number, zoom: number) => void;
}

const CountrySidebar: React.FC<CountrySidebarProps> = ({ onSearch }) => {
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');

  const handleSearch = () => {
    const countryKey = Object.keys(allCountries).find(
      c => c.toLowerCase() === country.trim().toLowerCase()
    );
    if (countryKey) {
      setError('');
      const { lat, lng } = allCountries[countryKey];
      onSearch(lat, lng, 5); // Default zoom for country
    } else {
      setError('Country not found. Please check spelling.');
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
