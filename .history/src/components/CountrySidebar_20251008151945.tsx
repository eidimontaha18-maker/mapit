import React, { useState, useEffect } from 'react';
import './CountrySidebar.css';
import './MapCardStyles.css';
import './MapFormStyles.css';
import allCountries from '../assets/allCountries.json';
import allCities from '../assets/allCities.json';
import { COUNTRY_COORDINATES } from '../utils/countryCoordinates';

// Props interface for the component
interface CountrySidebarProps {
  onSearch: (lat: number, lng: number, zoom: number, countryName?: string) => void;
  showMaps?: boolean; // New prop to control whether to show maps section
  onSaveMap?: () => void; // New prop to handle saving the map directly to database
  currentMapData?: {
    title: string;
    description: string;
    position: { lat: number; lng: number; zoom: number };
    isEditing?: boolean;
  };
}

const CountrySidebar: React.FC<CountrySidebarProps> = ({ 
  onSearch, 
  showMaps = true,
  onSaveMap,
  currentMapData
}) => {
  const [location, setLocation] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [error, setError] = useState('');
  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);
  const [showMapForm, setShowMapForm] = useState(false);
  const [mapTitle, setMapTitle] = useState('');
  const [mapDescription, setMapDescription] = useState('');
  const [maps, setMaps] = useState<Array<{ id: number; title: string; description: string; coordinates?: {lat: number, lng: number} }>>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isLoggedIn = localStorage.getItem('mapit_logged_in') === 'true';
  const [currentCoordinates, setCurrentCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize map on component mount
  useEffect(() => {
    // Show world view
    onSearch(20, 0, 2);

    // Load saved maps when user is logged in
    if (isLoggedIn) {
      const savedMaps = localStorage.getItem('user_maps');
      if (savedMaps) {
        try {
          setMaps(JSON.parse(savedMaps));
        } catch (e) {
          console.error('Failed to parse saved maps', e);
        }
      }
    }
  }, [onSearch, isLoggedIn]);

  // Handle country selection
  useEffect(() => {
    if (selectedCountry) {
      // Find corresponding coordinates
      const coordinates = COUNTRY_COORDINATES[selectedCountry];
      if (coordinates) {
        const { lat, lng } = coordinates;
        const zoom = 5; // Default zoom level for countries
        onSearch(lat, lng, zoom, selectedCountry);
        setLocation(selectedCountry); // Update input field
        setError('');
      } else {
        setError(`Could not find coordinates for ${selectedCountry}`);
        // Show world view as fallback
        onSearch(20, 0, 2);
      }
    }
  }, [selectedCountry, onSearch]);

  // Get cities for a country
  function getCitiesForCountry(country: string) {
    try {
      // First check if we have the country in our mapping
      const countryName = location.trim();
      const countryToCities = getCityCountryMapping();
      if (countryToCities[country]) {
        return countryToCities[country];
      } else {
        // If not found, try to get coordinates and zoom to them
        const coordinates = COUNTRY_COORDINATES[countryName];
        if (coordinates) {
          const { lat, lng } = coordinates;
          const zoom = 5; // Default zoom level
          onSearch(lat, lng, zoom, countryName);
        }
      }
    } catch (error) {
      console.error('Error getting cities for country:', error);
    }
    return [];
  }

  // Get a mapping of countries to their cities
  function getCityCountryMapping() {
    const countryToCities: Record<string, string[]> = {};
    // Loop through all countries and extract city data
    Object.entries(allCountries).forEach(([country]) => {
      const cities = [];
      // Add all matching cities for this country
      for (const [cityName, cityData] of Object.entries(allCities as Record<string, any>)) {
        if (cityData.country === country) {
          cities.push(cityName);
        }
      }
      countryToCities[country] = cities;
    });
    return countryToCities;
  }

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

  // Handle input change for search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setLocation(input);
    if (input.length >= 2) {
      // Filter countries first
      const countryMatches = Object.keys(allCountries)
        .filter(country => country.toLowerCase().includes(input.toLowerCase()))
        .slice(0, 5);
      setCountrySuggestions(countryMatches);
    } else {
      setCountrySuggestions([]);
    }
  };

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const countryName = location.trim();
    if (countryName) {
      // Find country coordinates
      const coordinates = COUNTRY_COORDINATES[countryName];
      if (coordinates) {
        const { lat, lng } = coordinates;
        const zoom = 5; // Default zoom level for countries
        onSearch(lat, lng, zoom, countryName);
        setSelectedCountry(countryName);
        setError('');
      } else {
        setError(`Could not find coordinates for "${countryName}". Try another location.`);
      }
    } else {
      // Show world view
      onSearch(20, 0, 2);
    }
  };

  // Handle country selection
  const handleCountrySelect = (countryName: string) => {
    // Find corresponding coordinates
    setSelectedCountry(countryName);
    setCountrySuggestions([]);
    const coordinates = COUNTRY_COORDINATES[countryName];
    if (coordinates) {
      const { lat, lng } = coordinates;
      const zoom = 5; // Default zoom level for countries
      onSearch(lat, lng, zoom, countryName);
      setLocation(countryName); // Update input field
      setError('');
    } else {
      setError(`Could not find coordinates for ${countryName}`);
      // Show world view as fallback
      onSearch(20, 0, 2);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setLocation(suggestion);
    setCountrySuggestions([]);
    // Check if it's a city
    const cityData = (allCities as Record<string, any>)[suggestion];
    if (cityData) {
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

      {/* Add Save to Database button when currentMapData is available */}
      {currentMapData && !showMapForm && (
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '16px'
        }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: '15px', 
            marginBottom: '8px',
            color: '#000'
          }}>
            Current Map: {currentMapData.title}
          </div>
          <button
            onClick={() => {
              if (onSaveMap) {
                setIsSaving(true);
                try {
                  onSaveMap();
                } finally {
                  setTimeout(() => setIsSaving(false), 1000);
                }
              }
            }}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '15px',
              background: '#4f8cff',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              boxShadow: '0 3px 10px rgba(79,140,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '12px'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            {isSaving ? 'Saving...' : 'Save Map to Database'}
          </button>
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

      {/* List of maps in sidebar - only show when showMaps prop is true */}
      {isLoggedIn && !showMapForm && showMaps && (
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
