import React, { useState } from 'react';
import './CountrySidebar.css';
import allCountries from '../assets/allCountries.json';
import allCities from '../assets/allCities.json';

interface CountrySidebarProps {
  onSearch: (lat: number, lng: number, zoom: number) => void;
}


interface CountrySidebarProps {
  onSearch: (lat: number, lng: number, zoom: number) => void;
}

const CountrySidebar: React.FC<CountrySidebarProps> = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [error, setError] = useState('');
  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);

  function getCitiesForCountry(country: string) {
    return Object.keys(allCities).filter(city => {
      const cityObj = (allCities as Record<string, { lat: number; lng: number; country: string }>)[city];
      return cityObj.country === country;
    });
  }

  // Autocomplete country suggestions
  const handleCountryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedCountry(value);
    setLocation(value);
    if (value.length > 0) {
      const suggestions = Object.keys(allCountries).filter(c => c.toLowerCase().includes(value.toLowerCase()));
      setCountrySuggestions(suggestions.slice(0, 5));
    } else {
      setCountrySuggestions([]);
    }
    setSelectedCity('');
  };

  const handleCountrySuggestionClick = (country: string) => {
    setSelectedCountry(country);
    setLocation(country);
    setCountrySuggestions([]);
    setSelectedCity('');
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
    setLocation(e.target.value);
  };

  const handleSearch = () => {
    const input = location.trim().toLowerCase();
    let countryKey = Object.keys(allCountries).find(
      c => c.toLowerCase() === input
    );
    let cityKey = Object.keys(allCities).find(
      c => c.toLowerCase() === input
    );
    if (!countryKey) {
      const bestCountry = getBestMatch(input, Object.keys(allCountries).map(c => c.toLowerCase()));
      if (bestCountry) countryKey = Object.keys(allCountries).find(c => c.toLowerCase() === bestCountry);
    }
    if (!cityKey) {
      const bestCity = getBestMatch(input, Object.keys(allCities).map(c => c.toLowerCase()));
      if (bestCity) cityKey = Object.keys(allCities).find(c => c.toLowerCase() === bestCity);
    }
    if (cityKey) {
      setError('');
      const { lat, lng } = (allCities as Record<string, { lat: number; lng: number; country: string }>)[cityKey];
      onSearch(lat, lng, 11);
      return;
    }
    if (countryKey) {
      setError('');
      const { lat, lng } = (allCountries as Record<string, { lat: number; lng: number }>)[countryKey];
      onSearch(lat, lng, 7);
      return;
    }
    setError('Location not found. Please check spelling.');
  };

  function getBestMatch(input: string, options: string[]): string | undefined {
    input = input.toLowerCase();
    let bestMatch: string | undefined;
    let minDistance = Infinity;
    for (const option of options) {
      const distance = levenshtein(input, option.toLowerCase());
      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = option;
      }
    }
    // Only accept matches with a reasonable distance (e.g., <= 2 for short names, <= 3 for longer)
    if (minDistance <= 2 || (input.length > 5 && minDistance <= 3)) {
      return bestMatch;
    }
    return undefined;
  }

  function levenshtein(a: string, b: string): number {
    const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = 1 + Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]);
        }
      }
    }
    return matrix[a.length][b.length];
  }

  return (
    <aside className="country-sidebar">
      <div className="sidebar-header">
        <h2>🌍 Location Search</h2>
        <p>Find any country or city and zoom to its location!</p>
      </div>

      <div className="sidebar-search">
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            placeholder="Type country name..."
            value={selectedCountry}
            onChange={handleCountryInput}
            className="sidebar-input"
            autoComplete="off"
          />
          {countrySuggestions.length > 0 && (
            <ul style={{ position: 'absolute', left: 0, right: 0, top: '100%', background: '#fff', border: '1px solid #b0c4de', borderRadius: '8px', zIndex: 10, margin: 0, padding: '0.5rem 0', listStyle: 'none' }}>
              {countrySuggestions.map(s => (
                <li key={s} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }} onClick={() => handleCountrySuggestionClick(s)}>{s}</li>
              ))}
            </ul>
          )}
        </div>
        {selectedCountry && (
          <select value={selectedCity} onChange={handleCityChange} className="sidebar-input">
            <option value="">Select city...</option>
            {getCitiesForCountry(selectedCountry).map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        )}
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
