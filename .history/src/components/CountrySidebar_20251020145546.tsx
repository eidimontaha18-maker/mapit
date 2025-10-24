import React, { useState, useEffect } from 'react';
import './CountrySidebar.css';
import './MapCardStyles.css';
import './MapFormStyles.css';
import allCountries from '../assets/allCountries.json';
import allCities from '../assets/allCities.json';
import { COUNTRY_COORDINATES } from '../utils/countryCoordinates';
import { CITY_TO_COUNTRY } from '../utils/cityToCountry';
import { MAJOR_CITIES_BY_COUNTRY } from '../data/majorCitiesByCountry';

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
  const [countryCities, setCountryCities] = useState<Array<{name: string; lat: number; lng: number}>>([]);
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [showMapForm, setShowMapForm] = useState(false);
  const [mapTitle, setMapTitle] = useState('');
  const [mapDescription, setMapDescription] = useState('');
  const [maps, setMaps] = useState<Array<{ id: number; title: string; description: string; coordinates?: {lat: number, lng: number} }>>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const isLoggedIn = localStorage.getItem('mapit_logged_in') === 'true';
  const [currentCoordinates, setCurrentCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Alternative method: Fetch cities using Overpass API (more comprehensive)
  const fetchCitiesViaOverpass = React.useCallback(async (countryName: string): Promise<Array<{name: string; lat: number; lng: number}>> => {
    try {
      // Get country ISO code for Overpass query
      const countryISOCodes: Record<string, string> = {
        'United States': 'US',
        'United Kingdom': 'GB',
        'France': 'FR',
        'Germany': 'DE',
        'Italy': 'IT',
        'Spain': 'ES',
        'Canada': 'CA',
        'Brazil': 'BR',
        'India': 'IN',
        'China': 'CN',
        'Japan': 'JP',
        'Australia': 'AU',
        'Lebanon': 'LB',
        'Syria': 'SY',
        'Egypt': 'EG',
        'United Arab Emirates': 'AE',
        'Saudi Arabia': 'SA',
        'Turkey': 'TR',
        'Russia': 'RU',
        'Mexico': 'MX',
        'Argentina': 'AR',
        'South Africa': 'ZA',
        'Nigeria': 'NG',
        'Kenya': 'KE',
        'Morocco': 'MA',
        'Algeria': 'DZ',
        'Indonesia': 'ID',
        'Thailand': 'TH',
        'Vietnam': 'VN',
        'Philippines': 'PH',
        'Malaysia': 'MY',
        'Singapore': 'SG',
        'Pakistan': 'PK',
        'Bangladesh': 'BD',
        'Netherlands': 'NL',
        'Belgium': 'BE',
        'Sweden': 'SE',
        'Norway': 'NO',
        'Denmark': 'DK',
        'Finland': 'FI',
        'Poland': 'PL',
        'Greece': 'GR',
        'Portugal': 'PT',
        'Switzerland': 'CH',
        'Austria': 'AT',
        'Ireland': 'IE',
        'New Zealand': 'NZ',
        'Chile': 'CL',
        'Colombia': 'CO',
        'Peru': 'PE',
        'Venezuela': 'VE',
        // Add more as needed
      };
      
      const isoCode = countryISOCodes[countryName];
      if (!isoCode) {
        throw new Error('Country ISO code not found');
      }
      
      // Query Overpass API for cities and towns
      const query = `
        [out:json][timeout:25];
        area["ISO3166-1"="${isoCode}"][admin_level=2];
        (
          node["place"="city"](area);
          node["place"="town"](area);
        );
        out body 100;
      `;
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });
      
      if (!response.ok) {
        throw new Error('Overpass API failed');
      }
      
      const data = await response.json();
      const cities: Array<{name: string; lat: number; lng: number}> = [];
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.elements?.forEach((element: any) => {
        if (element.tags?.name) {
          cities.push({
            name: element.tags.name,
            lat: element.lat,
            lng: element.lon
          });
        }
      });
      
      return cities.sort((a, b) => a.name.localeCompare(b.name)).slice(0, 100); // Increased from 40 to 100
    } catch (error) {
      console.error('Overpass API failed:', error);
      return [];
    }
  }, []);

  // Get cities for a selected country - ALWAYS fetch ALL cities from APIs
  const getCitiesForCountry = React.useCallback(async (countryName: string): Promise<Array<{name: string; lat: number; lng: number}>> => {
    console.log(`🔍 Fetching ALL cities for: ${countryName}`);
    
    // Always fetch from APIs to get comprehensive city lists
    console.log(`🌐 Fetching all cities from APIs for ${countryName}...`);
    try {
      setIsLoadingCities(true);
      
      // Use multiple queries to get comprehensive city data (increased limits)
      const queries = [
        // Query 1: Search for cities
        fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `country=${encodeURIComponent(countryName)}` +
          `&featuretype=city` +
          `&format=json` +
          `&limit=100` +
          `&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'MapIt-App/1.0'
            }
          }
        ),
        // Query 2: Search for settlements (towns, villages)
        fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `country=${encodeURIComponent(countryName)}` +
          `&featuretype=settlement` +
          `&format=json` +
          `&limit=100` +
          `&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'MapIt-App/1.0'
            }
          }
        ),
        // Query 3: Search using place parameter for cities and towns
        fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `country=${encodeURIComponent(countryName)}` +
          `&format=json` +
          `&limit=100` +
          `&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'MapIt-App/1.0'
            }
          }
        )
      ];
      
      const responses = await Promise.all(queries);
      const allData = await Promise.all(responses.map(r => r.json()));
      
      console.log(`📦 Raw API data for ${countryName}:`, allData.map(d => `${d.length} items`).join(', '));
      
      // Combine and parse all responses
      const fetchedCities: Array<{name: string; lat: number; lng: number}> = [];
      const seenCities = new Set<string>();
      
      allData.forEach(data => {
        console.log(`Processing ${data.length} items from API...`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.forEach((item: any) => {
          // Prioritize address fields over name to avoid getting country names
          let cityName = item.address?.city || 
                        item.address?.town || 
                        item.address?.village ||
                        item.address?.municipality ||
                        item.address?.suburb ||
                        item.address?.hamlet;
          
          // If no address field found, try item.name only if it's explicitly a place type
          if (!cityName && (item.type === 'city' || item.type === 'town' || item.type === 'village' || item.type === 'administrative')) {
            cityName = item.name;
          }
          
          // Skip if it's the country name itself or empty
          if (cityName && 
              !seenCities.has(cityName) && 
              cityName !== countryName &&
              cityName.toLowerCase() !== countryName.toLowerCase()) {
            seenCities.add(cityName);
            fetchedCities.push({
              name: cityName,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon)
            });
          }
        });
      });
      
      setIsLoadingCities(false);
      
      console.log(`✅ Total unique cities collected: ${fetchedCities.length}`);
      
      // If we found cities, return them sorted (increased limit to 100)
      if (fetchedCities.length > 0) {
        console.log(`✅ API returned ${fetchedCities.length} cities for ${countryName}:`, fetchedCities.slice(0, 10).map(c => c.name).join(', '), fetchedCities.length > 10 ? '...' : '');
        return fetchedCities
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, 100); // Increased from 30 to 100 cities
      }
      
      // If no cities found, try overpass API as alternative
      console.log('⚠️ No cities found via Nominatim, trying Overpass API...');
      const overpassCities = await fetchCitiesViaOverpass(countryName);
      if (overpassCities.length > 0) {
        console.log(`✅ Overpass API returned ${overpassCities.length} cities for ${countryName}:`, overpassCities.slice(0, 10).map(c => c.name).join(', '), overpassCities.length > 10 ? '...' : '');
      } else {
        console.log(`❌ No cities found for ${countryName} from any source`);
      }
      return overpassCities;
      
    } catch (error) {
      console.error('Error fetching cities from Nominatim:', error);
      setIsLoadingCities(false);
      
      // No fallback proximity search - return empty to avoid showing cities from neighboring countries
      console.log(`⚠️ Could not fetch cities for ${countryName}. No fallback used to prevent showing wrong cities.`);
      return [];
    }
  }, [fetchCitiesViaOverpass]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - only run once on mount

  // Handle country selection
  useEffect(() => {
    const loadCitiesForCountry = async () => {
      if (selectedCountry) {
        // Find corresponding coordinates
        const coordinates = COUNTRY_COORDINATES[selectedCountry];
        if (coordinates) {
          const { lat, lng } = coordinates;
          const zoom = 10; // Increased zoom level for much deeper zoom into countries
          onSearch(lat, lng, zoom, selectedCountry);
          setLocation(selectedCountry); // Update input field
          setError('');
          
          // Load cities for the selected country (async)
          const cities = await getCitiesForCountry(selectedCountry);
          setCountryCities(cities);
          setCitySearchTerm(''); // Reset city search when country changes
        } else {
          setError(`Could not find coordinates for ${selectedCountry}`);
          // Show world view as fallback
          onSearch(20, 0, 2);
          setCountryCities([]);
        }
      } else {
        setCountryCities([]);
        setCitySearchTerm('');
      }
    };
    
    loadCitiesForCountry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, getCitiesForCountry]); // onSearch intentionally excluded to prevent infinite loops

  // Handle search submit
  const handleSearch = () => {
    const countryName = location.trim();
    if (countryName) {
      // Find country coordinates
      const coordinates = COUNTRY_COORDINATES[countryName];
      if (coordinates) {
        const { lat, lng } = coordinates;
        const zoom = 10; // Increased zoom level for much deeper zoom into countries
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
            onClick={async () => {
              if (onSaveMap) {
                setIsSaving(true);
                try {
                  await onSaveMap();
                  // Show success message or update UI if needed
                } catch (error) {
                  console.error("Error saving map:", error);
                  // Show error message if needed
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
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Type a country or city name..."
              value={location}
              onChange={e => {
                setLocation(e.target.value);
                // Handle country input
                const input = e.target.value;
                if (input.length >= 2) {
                  // Filter countries first
                  const countryMatches = Object.keys(allCountries)
                    .filter(country => country.toLowerCase().includes(input.toLowerCase()))
                    .slice(0, 5);
                  setCountrySuggestions(countryMatches);
                } else {
                  setCountrySuggestions([]);
                }
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
                boxShadow: selectedCountry ? '0 0 0 2px rgba(79, 140, 255, 0.3)' : 'none',
                paddingRight: '36px' // Make room for the clear button
              }}
            />
            {location && (
              <button
                className="search-input-clear"
                onClick={() => {
                  setLocation('');
                  setSelectedCountry(''); // Also clear selected country
                  setCountrySuggestions([]);
                  // Focus back on the input after clearing
                  const searchInput = document.querySelector('.sidebar-input') as HTMLInputElement;
                  if (searchInput) searchInput.focus();
                }}
                title="Delete country"
                aria-label="Delete country"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
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
        
        {/* Display selected country with delete button */}
        {selectedCountry && (
          <div className="selected-country-pill" style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#e9f0ff',
            border: '1px solid #c2d8ff',
            borderRadius: '16px',
            padding: '4px 12px 4px 16px',
            margin: '10px 0',
            fontSize: '14px',
            color: '#1e40af'
          }}>
            {selectedCountry}
            <button
              onClick={() => {
                setLocation('');
                setSelectedCountry('');
                setCountrySuggestions([]);
                setCountryCities([]);
                setCitySearchTerm('');
                // Focus back on the input after clearing
                const searchInput = document.querySelector('.sidebar-input') as HTMLInputElement;
                if (searchInput) searchInput.focus();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                marginLeft: '8px',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Delete country"
              aria-label="Delete country"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
        
        {/* Display cities for selected country */}
        {selectedCountry && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#334155',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Cities in {selectedCountry} {countryCities.length > 0 && `(${countryCities.length})`}
            </div>
            
            {/* Loading indicator */}
            {isLoadingCities && (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '13px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '3px solid #e2e8f0',
                  borderTop: '3px solid #4f8cff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
                Loading cities...
              </div>
            )}
            
            {/* City search input */}
            {!isLoadingCities && countryCities.length > 3 && (
              <div style={{ marginBottom: '10px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search cities..."
                  value={citySearchTerm}
                  onChange={(e) => setCitySearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 32px 8px 10px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '13px',
                    outline: 'none',
                    backgroundColor: 'white'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#4f8cff';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(79, 140, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {citySearchTerm && (
                  <button
                    onClick={() => setCitySearchTerm('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: 0.5
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            )}
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {!isLoadingCities && countryCities
                .filter(city => city.name.toLowerCase().includes(citySearchTerm.toLowerCase()))
                .map((city) => (
                <button
                  key={city.name}
                  onClick={() => {
                    // Zoom to city with high zoom level
                    onSearch(city.lat, city.lng, 13, selectedCountry);
                  }}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: '#1e293b',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <span style={{ fontWeight: '500' }}>{city.name}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                    <path d="M11 8v6"></path>
                    <path d="M8 11h6"></path>
                  </svg>
                </button>
              ))}
              
              {/* No results message */}
              {countryCities.filter(city => city.name.toLowerCase().includes(citySearchTerm.toLowerCase())).length === 0 && (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '13px'
                }}>
                  No cities found matching "{citySearchTerm}"
                </div>
              )}
            </div>
          </div>
        )}
        
        {countrySuggestions.length > 0 && (
          <ul className="country-suggestions">
            {countrySuggestions.map(s => {
              const isCountry = s in allCountries;
              return (
                <li 
                  key={s} 
                  onClick={() => {
                    // Handle country suggestion click
                    setLocation(s);
                    setCountrySuggestions([]);
                    // Check if it's a country
                    if (s in allCountries) {
                      setSelectedCountry(s);
                      // Zoom to country center
                      const { lat, lng } = (allCountries as Record<string, { lat: number; lng: number }>)[s];
                      onSearch(lat, lng, 7, s);
                    }
                  }}
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
