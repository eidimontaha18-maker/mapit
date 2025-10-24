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
  const [error, setError] = useState('');
  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);

  function getCitiesForCountry(country: string) {
    // Get mapping from our centralized function
    const countryToCities = getCityCountryMapping();
    
    // Return cities that exist in our allCities data
    return (countryToCities[country] || []).filter(city => 
      city in (allCities as Record<string, { lat: number; lng: number }>)
    );
  }

  // Autocomplete country suggestions
  const handleCountryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    
    if (value.length > 0) {
      // Get both country and city suggestions
      const countrySugs = Object.keys(allCountries).filter(c => 
        c.toLowerCase().includes(value.toLowerCase())
      );
      
      const citySugs = Object.keys(allCities).filter(c => 
        c.toLowerCase().includes(value.toLowerCase())
      );
      
      // Combine and limit to 5 suggestions total
      const combinedSuggestions = [...citySugs, ...countrySugs];
      setCountrySuggestions(combinedSuggestions.slice(0, 5));
    } else {
      setCountrySuggestions([]);
    }
  };

  const handleCountrySuggestionClick = (suggestion: string) => {
    setLocation(suggestion);
    setCountrySuggestions([]);
    
    // Check if it's a city
    if (suggestion in allCities) {
      const cityData = (allCities as Record<string, { lat: number; lng: number; ar?: string }>)[suggestion];
      
      // Find corresponding country
      const countryOfCity = findCountryForCity(suggestion);
      if (countryOfCity) {
        setSelectedCountry(countryOfCity);
      }
      
      // Zoom to city
      onSearch(cityData.lat, cityData.lng, 11);
    }
    // Check if it's a country
    else if (suggestion in allCountries) {
      setSelectedCountry(suggestion);
      
      // Zoom to country
      const { lat, lng } = (allCountries as Record<string, { lat: number; lng: number }>)[suggestion];
      onSearch(lat, lng, 7);
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);
    
    if (cityName) {
      // Get city coordinates
      const cityData = (allCities as Record<string, { lat: number; lng: number; ar?: string }>)[cityName];
      if (cityData) {
        onSearch(cityData.lat, cityData.lng, 11);
      }
    }
  };

  // Find which country a city belongs to
  const findCountryForCity = (cityName: string): string | null => {
    // Create a mapping of city to country
    const cityToCountry: Record<string, string> = {};
    
    // Iterate through each country and its cities
    Object.entries(getCityCountryMapping()).forEach(([country, cities]) => {
      cities.forEach(city => {
        cityToCountry[city.toLowerCase()] = country;
      });
    });
    
    return cityToCountry[cityName.toLowerCase()] || null;
  };
  
  // Get the mapping of countries to cities
  const getCityCountryMapping = () => {
    return {
      'Syria': ['Damascus', 'Aleppo', 'Homs', 'Hama', 'Latakia', 'Raqqa', 'Deir ez-Zor', 'Idlib', 'Al-Hasakah', 'Daraa'],
      'Lebanon': ['Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Baalbek'],
      'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
      'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Glasgow'],
      'France': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice'],
      'Germany': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt'],
      'Japan': ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Sapporo'],
      'China': ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Hong Kong'],
      'India': ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata'],
      'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
      'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza'],
      'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'],
      'Russia': ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan'],
      'Italy': ['Rome', 'Milan', 'Naples', 'Turin', 'Florence'],
      'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza'],
      'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana'],
      'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Shubra El-Kheima', 'Port Said']
    };
  };

  const handleSearch = () => {
    const input = location.trim();
    const inputLower = input.toLowerCase();
    
    let countryKey = Object.keys(allCountries).find(
      c => c.toLowerCase() === inputLower
    );
    
    let cityKey = Object.keys(allCities).find(
      c => c.toLowerCase() === inputLower
    );
    
    // Try to find a best match for country or city if exact match not found
    if (!countryKey) {
      const bestCountry = getBestMatch(inputLower, Object.keys(allCountries).map(c => c.toLowerCase()));
      if (bestCountry) countryKey = Object.keys(allCountries).find(c => c.toLowerCase() === bestCountry);
    }
    
    if (!cityKey) {
      const bestCity = getBestMatch(inputLower, Object.keys(allCities).map(c => c.toLowerCase()));
      if (bestCity) cityKey = Object.keys(allCities).find(c => c.toLowerCase() === bestCity);
    }
    
    // First check if input matches a city
    if (cityKey) {
      setError('');
      const cityData = (allCities as Record<string, { lat: number; lng: number; ar?: string }>)[cityKey];
      
      // Find which country this city belongs to
      const countryOfCity = findCountryForCity(cityKey);
      
      if (countryOfCity) {
        // Set the country in state to populate the dropdown with all cities from this country
        setSelectedCountry(countryOfCity);
      }
      
      // Move map to city position
      onSearch(cityData.lat, cityData.lng, 11);
      return;
    }
    
    // Then check if input matches a country
    if (countryKey) {
      setError('');
      const { lat, lng } = (allCountries as Record<string, { lat: number; lng: number }>)[countryKey];
      
      // When a country is found, update the selected country to populate cities dropdown
      setSelectedCountry(countryKey);
      setCountrySuggestions([]); // Hide suggestions
      
      // Move map to country position
      onSearch(lat, lng, 7);
      return;
    }
    
    // No matches found
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
        <h2>Location Search</h2>
        <p>Find any country or city and zoom to its location!</p>
      </div>

      <div className="sidebar-search">
        <div className="search-row">
          <input
            type="text"
            placeholder="Enter city name..."
            value={location}
            onChange={e => {
              setLocation(e.target.value);
              handleCountryInput(e);
            }}
            className="sidebar-input"
            autoComplete="off"
          />
          <button className="sidebar-btn" onClick={handleSearch}>
            Search
          </button>
        </div>
        
        {countrySuggestions.length > 0 && (
          <ul className="country-suggestions">
            {countrySuggestions.map(s => {
              const isCountry = s in allCountries;
              return (
                <li 
                  key={s} 
                  onClick={() => handleCountrySuggestionClick(s)}
                  style={{ color: isCountry ? '#000000' : '' }}
                >
                  {s}
                </li>
              );
            })}
          </ul>
        )}
        
        {selectedCountry && (
          <div className="cities-container">
            <h3 className="cities-heading">Cities in {selectedCountry}</h3>
            <div className="cities-list">
              {getCitiesForCountry(selectedCountry).map((city: string) => (
                <div 
                  key={city} 
                  className="city-item"
                  onClick={() => {
                    setSelectedCity(city);
                    handleCityChange({ target: { value: city } } as React.ChangeEvent<HTMLSelectElement>);
                  }}
                >
                  {city}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {error && <div className="sidebar-error">{error}</div>}
    </aside>
  );
};

export default CountrySidebar;
