import React, { useState, useEffect } from 'react';
import './CountrySidebar.css';
import './MapCardStyles.css';
import './MapFormStyles.css';
import allCountries from '../assets/allCountries.json';
import allCities from '../assets/allCities.json';
import { COUNTRY_COORDINATES } from '../utils/countryCoordinates';

interface CityMarker {
  name: string;
  lat: number;
  lng: number;
  country: string;
  isCapital?: boolean;
}

interface CountrySidebarProps {
  onSearch: (lat: number, lng: number, zoom: number, countryName?: string) => void;
}

const CountrySidebar: React.FC<CountrySidebarProps> = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  // We need selectedCountry for tracking the current country being displayed
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [error, setError] = useState('');
  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);
  const [showMapForm, setShowMapForm] = useState(false);
  const [mapTitle, setMapTitle] = useState('');
  const [mapDescription, setMapDescription] = useState('');
  const [maps, setMaps] = useState<Array<{ id: number; title: string; description: string; coordinates?: {lat: number, lng: number} }>>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentCoordinates, setCurrentCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const isLoggedIn = localStorage.getItem('mapit_logged_in') === 'true';
  
  // Load saved maps when user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      // This would be replaced with an actual API call in production
      const savedMaps = localStorage.getItem('user_maps');
      if (savedMaps) {
        try {
          setMaps(JSON.parse(savedMaps));
        } catch (e) {
          console.error('Failed to parse saved maps', e);
        }
      }
    }
  }, [isLoggedIn]);
  
  // Initialize map on component mount
  useEffect(() => {
    // Show world view
    onSearch(20, 0, 2);
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

  // Enhanced autocomplete country suggestions with real-time search and auto-zoom
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
      
      // Prioritize countries over cities and limit to 5 suggestions total
      const combinedSuggestions = [...countrySugs, ...citySugs];
      setCountrySuggestions(combinedSuggestions.slice(0, 5));
      
      // Auto-search: If we have a match, zoom to it automatically
      // Find exact matches first
      const exactCountryMatch = Object.keys(allCountries).find(c => 
        c.toLowerCase() === value.toLowerCase()
      );
      
      const exactCityMatch = Object.keys(allCities).find(c => 
        c.toLowerCase() === value.toLowerCase()
      );
      
      // If no exact matches and we have at least 2 characters, try fuzzy match
      const fuzzyCountryMatch = (!exactCountryMatch && value.length >= 2) ? 
        Object.keys(allCountries).find(c => 
          c.toLowerCase().startsWith(value.toLowerCase())
        ) : null;
      
      if (exactCountryMatch) {
        // Exact country match - zoom to country with higher zoom level
        setSelectedCountry(exactCountryMatch);
        const { lat, lng } = (allCountries as Record<string, { lat: number; lng: number }>)[exactCountryMatch];
        console.log('Exact country match found:', exactCountryMatch, lat, lng);
        
        // Use a more dramatic zoom level for countries
        // Larger countries need less zoom
        let countryZoom = 6;
        const largeCountries = ['Russia', 'United States', 'China', 'Canada', 'Brazil', 'Australia'];
        if (largeCountries.includes(exactCountryMatch)) {
          countryZoom = 4;
        }
        
        onSearch(lat, lng, countryZoom, exactCountryMatch);
      } else if (exactCityMatch) {
        // Exact city match - zoom to city with higher zoom level
        const cityData = (allCities as Record<string, { lat: number; lng: number; ar?: string }>)[exactCityMatch];
        const countryOfCity = findCountryForCity(exactCityMatch);
        console.log('Exact city match found:', exactCityMatch, cityData.lat, cityData.lng);
        
        if (countryOfCity) {
          setSelectedCountry(countryOfCity);
          onSearch(cityData.lat, cityData.lng, 15, countryOfCity);
        } else {
          onSearch(cityData.lat, cityData.lng, 15);
        }
      } else if (fuzzyCountryMatch) {
        // Fuzzy country match - zoom to matching country
        setSelectedCountry(fuzzyCountryMatch);
        const { lat, lng } = (allCountries as Record<string, { lat: number; lng: number }>)[fuzzyCountryMatch];
        onSearch(lat, lng, 8, fuzzyCountryMatch);
      } else if (countrySugs.length > 0 && value.length >= 2) {
        // Partial match - zoom to first matching country if input is long enough
        const firstMatch = countrySugs[0];
        setSelectedCountry(firstMatch);
        const { lat, lng } = (allCountries as Record<string, { lat: number; lng: number }>)[firstMatch];
        onSearch(lat, lng, 8, firstMatch);
      } else if (citySugs.length > 0 && value.length >= 2) {
        // Partial match - zoom to first matching city if input is long enough
        const firstMatch = citySugs[0];
        const cityData = (allCities as Record<string, { lat: number; lng: number; ar?: string }>)[firstMatch];
        const countryOfCity = findCountryForCity(firstMatch);
        if (countryOfCity) {
          setSelectedCountry(countryOfCity);
          onSearch(cityData.lat, cityData.lng, 12, countryOfCity);
        } else {
          onSearch(cityData.lat, cityData.lng, 12);
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
        
        // Zoom to city with the country highlighted
        onSearch(cityData.lat, cityData.lng, 11, countryOfCity);
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
      onSearch(lat, lng, 7, suggestion);
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
    console.log('User searched for:', input);
    setError(''); // Clear any previous errors
    
    // If the search field is empty, reset the map to world view
    if (!input) {
      setSelectedCountry('');
      const allMarkers = createAllCityMarkers();
      onSearch(20, 0, 2, allMarkers);
      return;
    }
    
    // Special direct handling for Lebanon and other important countries
    // This ensures these key countries always work correctly regardless of other logic
    if (input.toLowerCase() === 'lebanon') {
      console.log('Special case for Lebanon');
      setSelectedCountry('Lebanon');
      const coords = COUNTRY_COORDINATES['Lebanon'];
      onSearch(coords.lat, coords.lng, coords.zoom, 'Lebanon');
      return;
    }
    
    // Check for other exact matches in our coordinates list (case insensitive)
    const exactCoordMatch = Object.keys(COUNTRY_COORDINATES).find(
      country => country.toLowerCase() === input.toLowerCase()
    );
    
    if (exactCoordMatch) {
      console.log(`Direct coordinate match for ${exactCoordMatch}`);
      setSelectedCountry(exactCoordMatch);
      const coords = COUNTRY_COORDINATES[exactCoordMatch];
      onSearch(coords.lat, coords.lng, coords.zoom, exactCoordMatch);
      return;
    }
    
    const inputLower = input.toLowerCase();
    
    // First prioritize exact matches
    let countryKey = Object.keys(allCountries).find(
      c => c.toLowerCase() === inputLower
    );
    
    let cityKey = Object.keys(allCities).find(
      c => c.toLowerCase() === inputLower
    );
    
    // Try to find a best match for country or city if exact match not found
    if (!countryKey) {
      // Find the best matching country first (prioritized)
      const allCountryOptions = Object.keys(allCountries);
      const allLowerCountryOptions = allCountryOptions.map(c => c.toLowerCase());
      const bestCountry = getBestMatch(inputLower, allLowerCountryOptions);
      
      if (bestCountry) {
        // Find the original case-sensitive country key
        countryKey = allCountryOptions.find(c => c.toLowerCase() === bestCountry);
        console.log('Found best match country:', countryKey);
      }
    }
    
    if (!cityKey && !countryKey) {
      // Only try city matching if no country match was found
      const allCityOptions = Object.keys(allCities);
      const allLowerCityOptions = allCityOptions.map(c => c.toLowerCase());
      const bestCity = getBestMatch(inputLower, allLowerCityOptions);
      
      if (bestCity) {
        // Find the original case-sensitive city key
        cityKey = allCityOptions.find(c => c.toLowerCase() === bestCity);
        console.log('Found best match city:', cityKey);
      }
    }
    
    // Prioritize country matches over city matches
    if (countryKey) {
      setError('');
      console.log('Zooming to country:', countryKey);
      
      // Set the country in state
      setSelectedCountry(countryKey);
      setCountrySuggestions([]);
      
      // First try to use our predefined COUNTRY_COORDINATES for more reliable positioning
      const countryCoords = COUNTRY_COORDINATES[countryKey];
      
      if (countryCoords) {
        console.log(`Using predefined coordinates for ${countryKey}:`, countryCoords);
        // Use our precise coordinates and zoom level
        const { lat, lng, zoom } = countryCoords;
        
        // First update with the exact coordinates
        console.log(`Zooming to ${countryKey} with precise coordinates:`, lat, lng, 'at zoom level:', zoom);
        onSearch(lat, lng, zoom, countryKey);
        
        // No need for offsets or multiple updates since we're using MapUpdater
      } else {
        // Fallback to allCountries data if not in our predefined list
        console.log(`No predefined coordinates for ${countryKey}, using fallback data`);
        const { lat, lng } = (allCountries as Record<string, { lat: number; lng: number }>)[countryKey];
        
        // Define zoom level based on country size
        const largeCountries = ['Russia', 'United States', 'China', 'Canada', 'Brazil', 'Australia'];
        const mediumCountries = ['India', 'Argentina', 'Kazakhstan', 'Algeria', 'Mexico'];
        const smallCountries = ['Lebanon', 'Israel', 'Jordan', 'Syria', 'United Arab Emirates', 'Kuwait', 'Qatar', 'Bahrain'];
        
        let zoomLevel = 6; // Default zoom for most countries
        
        if (largeCountries.includes(countryKey)) {
          zoomLevel = 4; // Less zoom for large countries
        } else if (mediumCountries.includes(countryKey)) {
          zoomLevel = 5; // Medium zoom for medium countries
        } else if (smallCountries.includes(countryKey)) {
          zoomLevel = 8; // Higher zoom for small countries like Lebanon
        }
        
        console.log('Country zoom level (fallback):', zoomLevel);
        console.log(`Zooming to ${countryKey} with fallback coordinates:`, lat, lng);
        
        // Just one update is enough since we have MapUpdater component now
        onSearch(lat, lng, zoomLevel, countryKey);
      }
      
      return;
    }
    
    // If no country match, try city match
    if (cityKey) {
      setError('');
      const cityData = (allCities as Record<string, { lat: number; lng: number; ar?: string }>)[cityKey];
      console.log('Zooming to city:', cityKey, cityData);
      
      // Find which country this city belongs to
      const countryOfCity = findCountryForCity(cityKey);
      
      if (countryOfCity) {
        // Set the country in state to populate the dropdown with cities
        setSelectedCountry(countryOfCity);
        
        // Create markers for all cities in this country
        // Country found
        
        // Move map to city position with city-appropriate zoom
        onSearch(cityData.lat, cityData.lng, 12, countryOfCity);
      } else {
        // Just show the single city
        onSearch(cityData.lat, cityData.lng, 12);
      }
      
      return;
    }
    
    // No matches found
    setError('Location not found. Please check spelling.');
    console.log('No matches found for:', input);
  };

  // Enhanced version that prioritizes prefix matches first, then partial matches, then fuzzy matches
  function getBestMatch(input: string, options: string[]): string | undefined {
    if (!input || input.length < 2) return undefined;
    
    const lowerInput = input.toLowerCase();
    
    // 1. First check for exact matches (case-insensitive)
    const exactMatch = options.find(opt => opt.toLowerCase() === lowerInput);
    if (exactMatch) return exactMatch;
    
    // 2. Then check for prefix matches (strongly preferred)
    const exactPrefixMatches = options.filter(opt => 
      opt.toLowerCase() === lowerInput
    );
    if (exactPrefixMatches.length > 0) {
      return exactPrefixMatches[0]; // Exact match is highest priority
    }
    
    // Then try prefix matches
    const prefixMatches = options.filter(opt => 
      opt.toLowerCase().startsWith(lowerInput)
    );
    if (prefixMatches.length > 0) {
      // For countries like 'Lebanon', ensure exact name match has priority
      const exactNameMatch = prefixMatches.find(m => m.toLowerCase() === lowerInput);
      if (exactNameMatch) return exactNameMatch;
      
      // If we have multiple prefix matches, return the shortest one (likely more specific)
      return prefixMatches.sort((a, b) => a.length - b.length)[0];
    }
    
    // 3. Then check for word beginning matches (e.g., "new" matches "New York")
    const wordBeginningMatches = options.filter(opt => {
      const words = opt.toLowerCase().split(/\s+/);
      return words.some(word => word.startsWith(lowerInput));
    });
    if (wordBeginningMatches.length > 0) {
      return wordBeginningMatches[0];
    }
    
    // 4. Then check for contains matches
    const containsMatches = options.filter(opt => 
      opt.toLowerCase().includes(lowerInput)
    );
    if (containsMatches.length > 0) {
      return containsMatches[0];
    }
    
    // 5. Finally, fall back to fuzzy matching with Levenshtein distance
    let bestMatch: string | undefined;
    let minDistance = Infinity;
    
    for (const option of options) {
      const distance = levenshtein(lowerInput, option.toLowerCase());
      // Weight shorter distances and shorter option names (more specific matches)
      const weightedDistance = distance * (1 + option.length / 100); 
      
      if (weightedDistance < minDistance) {
        minDistance = weightedDistance;
        bestMatch = option;
      }
    }
    
    // Only accept matches with a reasonable distance relative to input length
    const acceptableDistance = Math.min(3, Math.ceil(lowerInput.length / 3));
    if (minDistance <= acceptableDistance) {
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
    <div className={`country-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
      <button
        className="sidebar-toggle-btn"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <span className="chevron-icon"></span>
      </button>
      
      {isLoggedIn && showMapForm ? (
        <div className="sidebar-header">
          <h2>Create New Map</h2>
        </div>
      ) : (
        <div className="sidebar-header">
          <h2>Location Search</h2>
          <p>Search for countries, cities or coordinates</p>
        </div>
      )}

      {!showMapForm && (
        <div className="sidebar-search">
        <div className="search-row">
          <input
            type="text"
            placeholder="Type a country or city name..."
            value={location}
            onChange={e => {
              setLocation(e.target.value);
              handleCountryInput(e);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleSearch();
                // Flash the search button to provide visual feedback
                const searchBtn = document.querySelector('.search-button') as HTMLElement;
                if (searchBtn) {
                  searchBtn.style.backgroundColor = '#3a7cd8';
                  setTimeout(() => {
                    searchBtn.style.backgroundColor = '';
                  }, 300);
                }
              }
            }}
            className="sidebar-input"
            autoComplete="off"
            style={{
              border: error ? '1px solid #ff6b6b' : '1px solid #b6d0f7',
              boxShadow: selectedCountry ? '0 0 0 2px rgba(79, 140, 255, 0.3)' : 'none'
            }}
          />
          <button 
            className="sidebar-btn search-button" 
            onClick={() => {
              // Provide visual feedback
              const btn = document.querySelector('.search-button') as HTMLElement;
              if (btn) {
                btn.style.transform = 'scale(0.95)';
                btn.style.backgroundColor = '#3a6fbf';
                btn.innerHTML = '<span style="font-weight: bold">Searching...</span>';
                
                // Reset after animation
                setTimeout(() => {
                  btn.style.transform = 'scale(1.05)';
                  btn.style.backgroundColor = '#4f8cff';
                  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>';
                }, 1500);
              }
              
              // Get the current input
              const searchInput = document.querySelector('.sidebar-input') as HTMLInputElement;
              const searchValue = searchInput?.value?.trim() || location;
              
              console.log('Search button clicked for:', searchValue);
              
              if (searchValue) {
                // First store the input if it's not already set
                if (searchValue !== location) {
                  setLocation(searchValue);
                }
                
                // DIRECT COUNTRY MAPPING - most reliable approach
                const countryMapping: Record<string, {lat: number, lng: number, zoom: number}> = {
                  'lebanon': { lat: 33.8547, lng: 35.8623, zoom: 8 },
                  'syria': { lat: 34.8021, lng: 38.9968, zoom: 7 },
                  'jordan': { lat: 30.5852, lng: 36.2384, zoom: 7 },
                  'israel': { lat: 31.0461, lng: 34.8516, zoom: 8 },
                  'united arab emirates': { lat: 23.4241, lng: 53.8478, zoom: 7 },
                  'kuwait': { lat: 29.3117, lng: 47.4818, zoom: 8 },
                  'qatar': { lat: 25.3548, lng: 51.1839, zoom: 8 },
                  'russia': { lat: 61.5240, lng: 105.3188, zoom: 3 }
                };
                
                // Direct country match check (case insensitive)
                const lowerSearchValue = searchValue.toLowerCase();
                if (countryMapping[lowerSearchValue]) {
                  console.log(`Direct coordinates found for ${searchValue}`);
                  const coords = countryMapping[lowerSearchValue];
                  const countryName = searchValue.charAt(0).toUpperCase() + searchValue.slice(1);
                  
                  // First zoom attempt
                  onSearch(coords.lat, coords.lng, coords.zoom, countryName);
                  
                  // Follow-up zoom attempts with slight delays
                  [300, 800, 1500, 2500].forEach((delay, index) => {
                    setTimeout(() => {
                      // Add tiny offset to force map update
                      const offset = 0.0001 * (index + 1);
                      onSearch(
                        coords.lat + offset, 
                        coords.lng + offset, 
                        coords.zoom, 
                        [], 
                        countryName
                      );
                    }, delay);
                  });
                } else {
                  // Normal search for other countries
                  handleSearch();
                }
              } else {
                handleSearch(); // Empty search shows world map
              }
            }} 
            title="Search for this location"
            style={{
              backgroundColor: '#4f8cff',
              color: 'white',
              transition: 'all 0.2s ease',
              transform: 'scale(1.05)',
              boxShadow: '0 3px 8px rgba(79, 140, 255, 0.4)',
              fontWeight: 'bold'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </button>
        </div>
        <div className="auto-search-hint" style={{ 
          fontSize: '0.75rem', 
          color: '#666', 
          marginTop: '4px', 
          textAlign: 'center' 
        }}>
          Just type to auto-zoom to matching locations
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
      )}

      {/* Remove the plus button as we have an Add Map button in the maps list */}

      {/* New map form modal/inline */}
      {showMapForm && (
        <div className="map-form">
          <div className="form-group">
            <label htmlFor="map-title">Map Title</label>
            <input
              id="map-title"
              type="text"
              placeholder="Enter a title for your map"
              value={mapTitle}
              onChange={(e) => setMapTitle(e.target.value)}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="map-description">Map Description</label>
            <textarea
              id="map-description"
              placeholder="Enter a brief description"
              value={mapDescription}
              onChange={(e) => setMapDescription(e.target.value)}
              className="form-control"
              rows={4}
            ></textarea>
          </div>

          <div className="form-group coordinates-display">
            <div className="coordinates-label" style={{ color: '#000' }}>Current Map Center:</div>
            <div className="coordinates-value" style={{ color: '#000' }}>
              {currentCoordinates ? 
                `Lat: ${currentCoordinates.lat.toFixed(4)}, Lng: ${currentCoordinates.lng.toFixed(4)}` : 
                'Move the map to set coordinates'}
            </div>
          </div>
          
          <div className="form-actions">
            <button
              className="sidebar-btn save-btn"
              onClick={() => {
                if (!mapTitle.trim()) {
                  setError('Title is required');
                  return;
                }
                setError('');
                
                // In a real app, this would send data to a backend API
                // For now, we'll just store in localStorage
                const newMap = {
                  id: Date.now(),
                  title: mapTitle,
                  description: mapDescription,
                  coordinates: currentCoordinates || undefined
                };
                
                const updatedMaps = [...maps, newMap];
                localStorage.setItem('user_maps', JSON.stringify(updatedMaps));
                setMaps(updatedMaps);
                setShowMapForm(false);
                setMapTitle('');
                setMapDescription('');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"/>
              </svg>
              Save Map
            </button>
            <button 
              className="sidebar-btn cancel-btn" 
              onClick={() => setShowMapForm(false)}>
              Cancel
            </button>
          </div>
          
          {error && <div className="sidebar-error">{error}</div>}
        </div>
      )}

      {/* List of maps in sidebar */}
      {isLoggedIn && !showMapForm && (
        <div className="sidebar-maps-list">
          <h4>My Maps</h4>
          {maps.length > 0 ? (
            <div className="maps-container">
              {maps.map(map => (
                <div key={map.id} className="map-card">
                  <div className="map-card-title">{map.title}</div>
                  <div className="map-card-description">{map.description}</div>
                  {map.coordinates && (
                    <div className="map-card-coordinates">
                      Lat: {map.coordinates.lat.toFixed(2)}, Lng: {map.coordinates.lng.toFixed(2)}
                    </div>
                  )}
                  <div className="map-card-actions">
                    <button className="map-card-btn" onClick={() => {
                      if (map.coordinates) {
                        onSearch(map.coordinates.lat, map.coordinates.lng, 10);
                      }
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                      </svg>
                      View
                    </button>
                    <button className="map-card-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                      </svg>
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-maps-message">You haven't created any maps yet.</div>
          )}
          
          <button className="add-map-btn" onClick={() => {
            setShowMapForm(true);
            // Get current map position for new map
            navigator.geolocation.getCurrentPosition(
              (position) => {
                setCurrentCoordinates({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                });
              },
              () => {
                // Default coordinates if geolocation fails
                setCurrentCoordinates({ lat: 20, lng: 0 });
              }
            );
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            <span>Create New Map</span>
          </button>
        </div>
      )}

      {error && <div className="sidebar-error">{error}</div>}
    </div>
  );
};

export default CountrySidebar;
