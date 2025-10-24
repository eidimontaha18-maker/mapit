import React, { useState } from 'react';
import './CountrySidebar.css';
import allCountries from '../assets/allCountries.json';
import allCities from '../assets/allCities.json'; // Add a JSON file with cities and their coordinates

interface CountrySidebarProps {
  onSearch: (lat: number, lng: number, zoom: number) => void;
}

const CountrySidebar: React.FC<CountrySidebarProps> = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  const handleSearch = () => {
    const countryKey = Object.keys(allCountries).find(
      c => c.toLowerCase() === location.trim().toLowerCase()
    );
    if (countryKey) {
      setError('');
      const { lat, lng } = allCountries[countryKey];
      onSearch(lat, lng, 7); // More zoom for country
      return;
    }
    const cityKey = Object.keys(allCities).find(
      c => c.toLowerCase() === location.trim().toLowerCase()
    );
    if (cityKey) {
      setError('');
      const { lat, lng } = allCities[cityKey];
      onSearch(lat, lng, 11); // Higher zoom for city
      return;
    }
    setError('Location not found. Please check spelling.');
  };

  return (
    <aside className="country-sidebar">
      <div className="sidebar-header">
        <h2>🌍 Location Search</h2>
        <p>Find any country or city and zoom to its location!</p>
      </div>
      <div className="sidebar-search">
        <input
          type="text"
          placeholder="Type country or city name..."
          value={location}
          onChange={e => setLocation(e.target.value)}
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
