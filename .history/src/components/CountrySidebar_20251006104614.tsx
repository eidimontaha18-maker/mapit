import React, { useState, useEffect } from 'react';
import './CountrySidebar.css';
import allCountries from '../assets/allCountries.json';
import allCities from '../assets/allCities.json';

interface CityMarker {
  name: string;
  lat: number;
  lng: number;
  country: string;
  isCapital?: boolean;
}

interface CountrySidebarProps {
  onSearch: (lat: number, lng: number, zoom: number, cities?: CityMarker[], countryName?: string) => void;
}

const CountrySidebar: React.FC<CountrySidebarProps> = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [error, setError] = useState('');
  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);
  
  // Load all cities on component mount
  useEffect(() => {
    // Show all cities on the map (world view)
    const allMarkers = createAllCityMarkers();
    onSearch(20, 0, 2, allMarkers);
    // We're ignoring the createAllCityMarkers dependency since it won't change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSearch]);

  function getCitiesForCountry(country: string) {
    // Get mapping from our centralized function
    const countryToCities = getCityCountryMapping();
    
    // Return cities that exist in our allCities data
    // Using a type assertion to help TypeScript understand the indexing
    const cities = countryToCities[country as keyof typeof countryToCities] || [];
    return cities.filter((city: string) => 
      city in (allCities as Record<string, { lat: number; lng: number }>)
    );
  }

  // Autocomplete country suggestions with real-time search
  const handleCountryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    setError(''); // Clear any previous errors
    
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
      
      // Auto-search: If we have an exact match or very close match, zoom to it automatically
      const exactCountryMatch = Object.keys(allCountries).find(c => 
        c.toLowerCase() === value.toLowerCase()
      );
      
      const exactCityMatch = Object.keys(allCities).find(c => 
        c.toLowerCase() === value.toLowerCase()
      );
      
      if (exactCountryMatch) {
        // Exact country match - zoom to country
        setSelectedCountry(exactCountryMatch);
        const { lat, lng } = (allCountries as Record<string, { lat: number; lng: number }>)[exactCountryMatch];
        onSearch(lat, lng, 7, [], exactCountryMatch);
      } else if (exactCityMatch) {
        // Exact city match - zoom to city
        const cityData = (allCities as Record<string, { lat: number; lng: number; ar?: string }>)[exactCityMatch];
        const countryOfCity = findCountryForCity(exactCityMatch);
        if (countryOfCity) {
          setSelectedCountry(countryOfCity);
          onSearch(cityData.lat, cityData.lng, 11, [], countryOfCity);
        } else {
          onSearch(cityData.lat, cityData.lng, 11);
        }
      } else if (countrySugs.length > 0 && value.length >= 3) {
        // Partial match - zoom to first matching country if input is long enough
        const firstMatch = countrySugs[0];
        setSelectedCountry(firstMatch);
        const { lat, lng } = (allCountries as Record<string, { lat: number; lng: number }>)[firstMatch];
        onSearch(lat, lng, 7, [], firstMatch);
      } else if (citySugs.length > 0 && value.length >= 3) {
        // Partial match - zoom to first matching city if input is long enough
        const firstMatch = citySugs[0];
        const cityData = (allCities as Record<string, { lat: number; lng: number; ar?: string }>)[firstMatch];
        const countryOfCity = findCountryForCity(firstMatch);
        if (countryOfCity) {
          setSelectedCountry(countryOfCity);
          onSearch(cityData.lat, cityData.lng, 11, [], countryOfCity);
        } else {
          onSearch(cityData.lat, cityData.lng, 11);
        }
      }
    } else {
      // When the input field is cleared, clear the selected country and reset the map
      setCountrySuggestions([]);
      setSelectedCountry('');
      
      // Reset the map to world view
      const allMarkers = createAllCityMarkers();
      onSearch(20, 0, 2, allMarkers);
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
        
        // Create markers for all cities in this country
        const cityMarkers = createCityMarkers(countryOfCity);
        
        // Zoom to city and show all city markers from the country
        onSearch(cityData.lat, cityData.lng, 11, cityMarkers, countryOfCity);
      } else {
        // Just zoom to the city if we can't find its country
        onSearch(cityData.lat, cityData.lng, 11);
      }
    }
    // Check if it's a country
    else if (suggestion in allCountries) {
      setSelectedCountry(suggestion);
      
      // Zoom to country center without showing cities list
      const { lat, lng } = (allCountries as Record<string, { lat: number; lng: number }>)[suggestion];
      onSearch(lat, lng, 7, [], suggestion);
    }
  };

  // Create city markers for display on the map
  
  // Create city markers for a country
  const createCityMarkers = (countryName: string): CityMarker[] => {
    const cities = getCitiesForCountry(countryName);
    
    // Define capital cities for common countries
    const capitals: Record<string, string> = {
      'Syria': 'Damascus',
      'Lebanon': 'Beirut',
      'United States': 'Washington D.C.',
      'United Kingdom': 'London',
      'France': 'Paris',
      'Germany': 'Berlin',
      'Japan': 'Tokyo',
      'China': 'Beijing',
      'India': 'New Delhi',
      'Australia': 'Canberra',
      'Brazil': 'Brasília',
      'Canada': 'Ottawa',
      'Russia': 'Moscow',
      'Italy': 'Rome',
      'Spain': 'Madrid',
      'Mexico': 'Mexico City',
      'Egypt': 'Cairo',
      'United Arab Emirates': 'Abu Dhabi'
    };
    
    return cities.map((city: string) => {
      const cityData = (allCities as Record<string, { lat: number; lng: number; ar?: string }>)[city];
      return {
        name: city,
        lat: cityData.lat,
        lng: cityData.lng,
        country: countryName,
        isCapital: capitals[countryName] === city
      };
    });
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
  
  // Create markers for all cities in all countries
  const createAllCityMarkers = (): CityMarker[] => {
    const allMarkers: CityMarker[] = [];
    const countryMapping = getCityCountryMapping();
    
    // Define capitals for reference
    const capitals: Record<string, string> = {
      'Syria': 'Damascus',
      'Lebanon': 'Beirut',
      'United States': 'Washington D.C.',
      'United Kingdom': 'London',
      'France': 'Paris',
      'Germany': 'Berlin',
      'Japan': 'Tokyo',
      'China': 'Beijing',
      'India': 'New Delhi',
      'Australia': 'Canberra',
      'Brazil': 'Brasília',
      'Canada': 'Ottawa',
      'Russia': 'Moscow',
      'Italy': 'Rome',
      'Spain': 'Madrid',
      'Mexico': 'Mexico City',
      'Egypt': 'Cairo',
      'United Arab Emirates': 'Abu Dhabi'
    };
    
    // Process each country and its cities
    Object.entries(countryMapping).forEach(([country, cities]) => {
      cities.forEach(city => {
        if (city in allCities) {
          const cityData = (allCities as Record<string, { lat: number; lng: number; ar?: string }>)[city];
          allMarkers.push({
            name: city,
            lat: cityData.lat,
            lng: cityData.lng,
            country: country,
            isCapital: capitals[country] === city
          });
        }
      });
    });
    
    return allMarkers;
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
      'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Shubra El-Kheima', 'Port Said'],
      'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Al Ain', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain']
    };
  };

  const handleSearch = () => {
    const input = location.trim();
    
    // If the search field is empty, reset the map to world view
    if (!input) {
      setSelectedCountry('');
      const allMarkers = createAllCityMarkers();
      onSearch(20, 0, 2, allMarkers);
      return;
    }
    
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
        
        // Create markers for all cities in this country
        const cityMarkers = createCityMarkers(countryOfCity);
        
        // Move map to city position and show all city markers with closer zoom
        onSearch(cityData.lat, cityData.lng, 13, cityMarkers, countryOfCity);
      } else {
        // Just show the single city if we can't find its country with closer zoom
        onSearch(cityData.lat, cityData.lng, 13);
      }
      
      return;
    }
    
    // Then check if input matches a country
    if (countryKey) {
      setError('');
      const { lat, lng } = (allCountries as Record<string, { lat: number; lng: number }>)[countryKey];
      
      // When a country is found, update the selected country to populate cities dropdown
      setSelectedCountry(countryKey);
      setCountrySuggestions([]); // Hide suggestions
      
      // Move map to country position without showing cities list
      onSearch(lat, lng, 8, [], countryKey);
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
        

      </div>
      
      {error && <div className="sidebar-error">{error}</div>}
    </aside>
  );
};

export default CountrySidebar;
