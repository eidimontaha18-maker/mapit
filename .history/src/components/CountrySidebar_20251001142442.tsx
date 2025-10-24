import React, { useState } from 'react';
import './CountrySidebar.css';
import allCountries from '../assets/allCountries.json';
import allCities from '../assets/allCities.json';

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' }
];

interface LocationData {
  lat: number;
  lng: number;
  ar?: string;
}

interface CountrySidebarProps {
  onSearch: (lat: number, lng: number, zoom: number) => void;
}

const CountrySidebar: React.FC<CountrySidebarProps> = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('en');

  // Cast imported JSONs to index signature type
  const countries: Record<string, LocationData> = allCountries as Record<string, LocationData>;
  const cities: Record<string, LocationData> = allCities as Record<string, LocationData>;

  const handleSearch = () => {
    const input = location.trim().toLowerCase();
    let countryKey = Object.keys(countries).find(
      c => c.toLowerCase() === input
    );
    let cityKey = Object.keys(cities).find(
      c => c.toLowerCase() === input
    );
    if (language === 'ar') {
      countryKey = Object.keys(countries).find(
        c => c.toLowerCase() === input || (countries[c].ar && countries[c].ar.toLowerCase() === input)
      );
      cityKey = Object.keys(cities).find(
        c => c.toLowerCase() === input || (cities[c].ar && cities[c].ar.toLowerCase() === input)
      );
    }
    if (countryKey) {
      setError('');
      const { lat, lng } = countries[countryKey];
      onSearch(lat, lng, 7);
      return;
    }
    if (cityKey) {
      setError('');
      const { lat, lng } = cities[cityKey];
      onSearch(lat, lng, 11);
      return;
    }
    setError(language === 'ar' ? 'لم يتم العثور على الموقع. تحقق من الإملاء.' : 'Location not found. Please check spelling.');
  };

  return (
    <aside className="country-sidebar">
      <div className="sidebar-header">
        <h2>🌍 {language === 'ar' ? 'بحث عن الموقع' : 'Location Search'}</h2>
        <p>{language === 'ar' ? 'ابحث عن أي دولة أو مدينة وانتقل إلى موقعها!' : 'Find any country or city and zoom to its location!'}</p>
      </div>
      <div className="sidebar-lang-select">
        <label htmlFor="lang-select">{language === 'ar' ? 'اللغة:' : 'Language:'}</label>
        <select id="lang-select" value={language} onChange={e => setLanguage(e.target.value)}>
          {languageOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="sidebar-search">
        <input
          type="text"
          placeholder={language === 'ar' ? 'اكتب اسم الدولة أو المدينة...' : 'Type country or city name...'}
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="sidebar-input"
        />
        <button className="sidebar-btn" onClick={handleSearch}>
          {language === 'ar' ? 'بحث' : 'Search'}
        </button>
      </div>
      {error && <div className="sidebar-error">{error}</div>}
    </aside>
  );
};

export default CountrySidebar;
