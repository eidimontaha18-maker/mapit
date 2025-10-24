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
  onLanguageChange?: (lang: 'en' | 'ar') => void;
}

const CountrySidebar: React.FC<CountrySidebarProps> = ({ onSearch, onLanguageChange }) => {
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  // Cast imported JSONs to index signature type
  const countries: Record<string, LocationData> = allCountries as Record<string, LocationData>;
  const cities: Record<string, LocationData> = allCities as Record<string, LocationData>;

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

  const handleSearch = () => {
    const input = location.trim().toLowerCase();
    let countryKey: string | undefined;
    let cityKey: string | undefined;
    if (language === 'ar') {
      countryKey = Object.keys(countries).find(
        c => countries[c].ar && countries[c].ar.toLowerCase() === input
      );
      cityKey = Object.keys(cities).find(
        c => cities[c].ar && cities[c].ar.toLowerCase() === input
      );
      if (!countryKey) {
        // Fuzzy match for Arabic
        const arCountryNames = Object.keys(countries).map(c => countries[c].ar).filter(Boolean) as string[];
        const bestArCountry = getBestMatch(input, arCountryNames);
        if (bestArCountry) {
          countryKey = Object.keys(countries).find(c => countries[c].ar === bestArCountry);
        }
      }
      if (!cityKey) {
        const arCityNames = Object.keys(cities).map(c => cities[c].ar).filter(Boolean) as string[];
        const bestArCity = getBestMatch(input, arCityNames);
        if (bestArCity) {
          cityKey = Object.keys(cities).find(c => cities[c].ar === bestArCity);
        }
      }
    } else {
      countryKey = Object.keys(countries).find(
        c => c.toLowerCase() === input
      );
      cityKey = Object.keys(cities).find(
        c => c.toLowerCase() === input
      );
      if (!countryKey) {
        // Fuzzy match for English
        const bestCountry = getBestMatch(input, Object.keys(countries));
        if (bestCountry) countryKey = bestCountry;
      }
      if (!cityKey) {
        const bestCity = getBestMatch(input, Object.keys(cities));
        if (bestCity) cityKey = bestCity;
      }
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

  const handleLanguageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value as 'en' | 'ar';
    setLanguage(lang);
    if (onLanguageChange) onLanguageChange(lang);
  };

  return (
    <aside className="country-sidebar">
      <div className="sidebar-header">
        <h2>🌍 {language === 'ar' ? 'بحث عن الموقع' : 'Location Search'}</h2>
        <p>{language === 'ar' ? 'ابحث عن أي دولة أو مدينة وانتقل إلى موقعها!' : 'Find any country or city and zoom to its location!'}</p>
      </div>
      <div className="sidebar-lang-select">
        <label htmlFor="lang-select">{language === 'ar' ? 'اللغة:' : 'Language:'}</label>
        <select id="lang-select" value={language} onChange={handleLanguageSelect}>
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
