import React, { useState, useEffect } from 'react';import React, { useState, useEffect } from 'react';

import './CountrySidebar.css';import './CountrySidebar.css';

import './MapCardStyles.css';import './MapCardStyles.css';

import './MapFormStyles.css';import './MapFormStyles.css';

import allCountries from '../assets/allCountries.json';import allCountries from '../assets/allCountries.json';

import allCities from '../assets/allCities.json';import allCities from '../assets/allCities.json';

import { COUNTRY_COORDINATES } from '../utils/countryCoordinates';import { COUNTRY_COORDINATES } from '../utils/countryCoordinates';



// Define the props interface// Props interface for the component

interface CountrySidebarProps {interface CountrySidebarProps {

  onSearch: (lat: number, lng: number, zoom: number, countryName?: string) => void;  onSearch: (lat: number, lng: number, zoom: number, countryName?: string) => void;

}}



const CountrySidebar: React.FC<CountrySidebarProps> = ({ onSearch }) => {const CountrySidebar: React.FC<CountrySidebarProps> = ({ onSearch }) => {

  const [location, setLocation] = useState('');  // State management

  const [selectedCountry, setSelectedCountry] = useState<string>('');  const [location, setLocation] = useState('');

  const [error, setError] = useState('');  const [selectedCountry, setSelectedCountry] = useState<string>('');

  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);  const [error, setError] = useState('');

  const [showMapForm, setShowMapForm] = useState(false);  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);

  const [mapTitle, setMapTitle] = useState('');  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [mapDescription, setMapDescription] = useState('');  const isLoggedIn = localStorage.getItem('mapit_logged_in') === 'true';

  const [maps, setMaps] = useState<Array<{ id: number; title: string; description: string; coordinates?: {lat: number, lng: number} }>>([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);  // Initialize map on component mount

  const [currentCoordinates, setCurrentCoordinates] = useState<{lat: number, lng: number} | null>(null);  useEffect(() => {

  const isLoggedIn = localStorage.getItem('mapit_logged_in') === 'true';    // Show world view

      onSearch(20, 0, 2);

  // Load saved maps when user is logged in  }, [onSearch]);

  useEffect(() => {

    if (isLoggedIn) {  // Handle country selection

      // This would be replaced with an actual API call in production  const handleCountrySelect = (countryName: string) => {

      const savedMaps = localStorage.getItem('user_maps');    // Find corresponding coordinates

      if (savedMaps) {    setSelectedCountry(countryName);

        try {    setCountrySuggestions([]);

          setMaps(JSON.parse(savedMaps));

        } catch (e) {    const coordinates = COUNTRY_COORDINATES[countryName];

          console.error('Failed to parse saved maps', e);    if (coordinates) {

        }      const { lat, lng } = coordinates;

      }      const zoom = 5; // Default zoom level for countries

    }      

  }, [isLoggedIn]);      onSearch(lat, lng, zoom, countryName);

        setLocation(countryName); // Update input field

  // Initialize map on component mount      setError('');

  useEffect(() => {    } else {

    // Show world view      setError(`Could not find coordinates for ${countryName}`);

    onSearch(20, 0, 2);    }

  }, [onSearch]);  };



  // Get cities for a country  // Handle search submit

  function getCitiesForCountry(country: string) {  const handleSearch = (e: React.FormEvent) => {

    try {    e.preventDefault();

      // First check if we have the country in our mapping    const countryName = location.trim();

      const countryToCities = getCityCountryMapping();    

      if (countryToCities[country]) {    if (countryName) {

        return countryToCities[country];      // Find country coordinates

      } else {      const coordinates = COUNTRY_COORDINATES[countryName];

        console.warn(`No cities found for ${country}`);      

        return [];      if (coordinates) {

      }        const { lat, lng } = coordinates;

    } catch (error) {        const zoom = 5; // Default zoom level

      console.error('Error getting cities for country:', error);        

      return [];        onSearch(lat, lng, zoom, countryName);

    }        setSelectedCountry(countryName);

  }        setError('');

        } else {

  // Get a mapping of countries to their cities        setError(`Could not find coordinates for "${countryName}". Try another location.`);

  function getCityCountryMapping() {      }

    try {    }

      const countryToCities: Record<string, string[]> = {};  };

      

      // Loop through all countries and extract city data  // Handle input changes for country search

      Object.entries(allCountries).forEach(([country]) => {  const handleCountryInput = (e: React.ChangeEvent<HTMLInputElement>) => {

        const cities = [];    const input = e.target.value;

            setLocation(input);

        // Add all matching cities for this country    

        for (const [cityName, cityData] of Object.entries(allCities as Record<string, any>)) {    if (input.length > 1) {

          if (cityData.country === country) {      // Find matching countries

            cities.push(cityName);      const matches = Object.keys(COUNTRY_COORDINATES)

          }        .filter(country => country.toLowerCase().includes(input.toLowerCase()))

        }        .slice(0, 5); // Limit to 5 suggestions

              

        // Add to our mapping if we found cities      setCountrySuggestions(matches);

        if (cities.length > 0) {    } else {

          countryToCities[country] = cities;      setCountrySuggestions([]);

        }    }

      });  };

      

      return countryToCities;  // Reset to world view

    } catch (error) {  const handleWorldView = () => {

      console.error('Error creating city-country mapping:', error);    setSelectedCountry('');

      return {};    setLocation('');

    }    onSearch(20, 0, 2);

  }  };



  // Find which country a city belongs to  // Render component

  const findCountryForCity = (cityName: string): string | null => {  return (

    // Create a mapping of city to country    <div className={`country-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>

    const cityToCountry: Record<string, string> = {};      <button

            className="sidebar-toggle-btn"

    // Iterate through each country and its cities        onClick={() => setIsSidebarOpen(!isSidebarOpen)}

    Object.entries(getCityCountryMapping()).forEach(([country, cities]) => {        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}

      cities.forEach(city => {      >

        cityToCountry[city.toLowerCase()] = country;        <span className="chevron-icon"></span>

      });      </button>

    });      

          <div className="sidebar-header">

    return cityToCountry[cityName.toLowerCase()] || null;        <h2>Location Search</h2>

  }        <p>Search for countries, cities or coordinates</p>

        </div>

  // Handle input change for search

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {      <div className="sidebar-search">

    const input = e.target.value;        <div className="search-row">

    setLocation(input);          <form onSubmit={handleSearch}>

                <input

    if (input.length >= 2) {              type="text"

      // Filter countries first              placeholder="Search for a country..."

      const countryMatches = Object.keys(allCountries)              value={location}

        .filter(country => country.toLowerCase().includes(input.toLowerCase()))              onChange={handleCountryInput}

        .slice(0, 5);              className="search-input"

                    autoFocus

      setCountrySuggestions(countryMatches);            />

    } else {            <button type="submit" className="search-button">Search</button>

      setCountrySuggestions([]);          </form>

    }        </div>

  };        

          {error && <div className="error-message">{error}</div>}

  // Handle country selection        

  const handleCountrySelect = (countryName: string) => {        {countrySuggestions.length > 0 && (

    // Find corresponding coordinates          <ul className="country-suggestions">

    setSelectedCountry(countryName);            {countrySuggestions.map(country => (

    setCountrySuggestions([]);              <li 

                key={country} 

    const coordinates = COUNTRY_COORDINATES[countryName];                onClick={() => handleCountrySelect(country)}

    if (coordinates) {                className={selectedCountry === country ? 'selected' : ''}

      const { lat, lng } = coordinates;              >

      const zoom = 5; // Default zoom level for countries                {country}

                    </li>

      onSearch(lat, lng, zoom, countryName);            ))}

      setLocation(countryName); // Update input field          </ul>

      setError('');        )}

    } else {        

      setError(`Could not find coordinates for ${countryName}`);        <div className="common-countries">

    }          <h3>Common Countries</h3>

  };          <div className="country-buttons">

            <button onClick={() => handleCountrySelect('United States')}>USA</button>

  // Handle search submit            <button onClick={() => handleCountrySelect('United Kingdom')}>UK</button>

  const handleSearch = (e: React.FormEvent) => {            <button onClick={() => handleCountrySelect('Canada')}>Canada</button>

    e.preventDefault();            <button onClick={() => handleCountrySelect('Australia')}>Australia</button>

    const countryName = location.trim();            <button onClick={() => handleCountrySelect('Germany')}>Germany</button>

                <button onClick={() => handleCountrySelect('Japan')}>Japan</button>

    if (countryName) {            <button onClick={() => handleCountrySelect('Brazil')}>Brazil</button>

      // Find country coordinates            <button onClick={() => handleCountrySelect('India')}>India</button>

      const coordinates = COUNTRY_COORDINATES[countryName];          </div>

                <button 

      if (coordinates) {            className="world-view-btn"

        const { lat, lng } = coordinates;            onClick={handleWorldView}

        const zoom = 5; // Default zoom level          >

                    Show World View

        onSearch(lat, lng, zoom, countryName);          </button>

        setSelectedCountry(countryName);        </div>

        setError('');      </div>

      } else {    </div>

        setError(`Could not find coordinates for "${countryName}". Try another location.`);  );

      }};

    }

  };export default CountrySidebar;



  // Handle suggestion click// Props interface for the component

  const handleSuggestionClick = (suggestion: string) => {interface CountrySidebarProps {

    setLocation(suggestion);  onSearch: (lat: number, lng: number, zoom: number, countryName?: string) => void;

    setCountrySuggestions([]);}

    

    // Check if it's a cityconst CountrySidebar: React.FC<CountrySidebarProps> = ({ onSearch }) => {

    const cityData = (allCities as Record<string, any>)[suggestion];  // State management

    if (cityData) {  const [location, setLocation] = useState('');

      const countryOfCity = findCountryForCity(suggestion);  const [selectedCountry, setSelectedCountry] = useState<string>('');

      if (countryOfCity) {  const [error, setError] = useState('');

        setSelectedCountry(countryOfCity);  const [countrySuggestions, setCountrySuggestions] = useState<string[]>([]);

          const [showMapForm, setShowMapForm] = useState(false);

        // Zoom to city with the country highlighted  const [mapTitle, setMapTitle] = useState('');

        onSearch(cityData.lat, cityData.lng, 11, countryOfCity);  const [mapDescription, setMapDescription] = useState('');

      } else {  const [maps, setMaps] = useState<Array<{ id: number; title: string; description: string; coordinates?: {lat: number, lng: number} }>>([]);

        // Just zoom to the city if we can't find its country  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

        onSearch(cityData.lat, cityData.lng, 11);  const isLoggedIn = localStorage.getItem('mapit_logged_in') === 'true';

      }  

    }  // Load saved maps when user is logged in

    // Check if it's a country  useEffect(() => {

    else if (suggestion in allCountries) {    if (isLoggedIn) {

      setSelectedCountry(suggestion);      // This would be replaced with an actual API call in production

            const savedMaps = localStorage.getItem('user_maps');

      // Get coordinates for this country      if (savedMaps) {

      const coordinates = COUNTRY_COORDINATES[suggestion];        try {

      if (coordinates) {          setMaps(JSON.parse(savedMaps));

        const { lat, lng } = coordinates;        } catch (e) {

        onSearch(lat, lng, 7, suggestion);          console.error('Failed to parse saved maps', e);

      } else {        }

        setError(`Could not find coordinates for ${suggestion}`);      }

      }    }

    }  }, [isLoggedIn]);

  };  

    // Initialize map on component mount

  // Toggle sidebar  useEffect(() => {

  const toggleSidebar = () => {    // Show world view

    setIsSidebarOpen(!isSidebarOpen);    onSearch(20, 0, 2);

  };  }, [onSearch]);



  // Render the component  function getCitiesForCountry(country: string) {

  return (    // Get mapping from our centralized function

    <div className={`country-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>    const countryToCities = getCityCountryMapping();

      <div className="sidebar-toggle" onClick={toggleSidebar}>    

        {isSidebarOpen ? '←' : '→'}    // Return cities that exist in our allCities data

      </div>    // Using a type assertion to help TypeScript understand the indexing

      <div className="sidebar-content">    const cities = countryToCities[country as keyof typeof countryToCities] || [];

        <div className="sidebar-header">    return cities.filter((city: string) => 

          <h2>Location Search</h2>      city in (allCities as Record<string, { lat: number; lng: number }>)

          <p>Search for countries, cities or coordinates</p>    );

        </div>  }

        

        <form onSubmit={handleSearch} className="search-form">  // Enhanced autocomplete country suggestions with real-time search and auto-zoom

          <input  const handleCountryInput = (e: React.ChangeEvent<HTMLInputElement>) => {

            type="text"    const value = e.target.value;

            value={location}    setLocation(value);

            onChange={handleInputChange}    setError(''); // Clear any previous errors

            placeholder="Enter a country or city..."    

            className="search-input"    if (value.length > 0) {

          />      // Get both country and city suggestions

          <button type="submit" className="search-button">Search</button>      const countrySugs = Object.keys(allCountries).filter(c => 

        </form>        c.toLowerCase().includes(value.toLowerCase())

              );

        {error && <div className="error-message">{error}</div>}      

              const citySugs = Object.keys(allCities).filter(c => 

        {countrySuggestions.length > 0 && (        c.toLowerCase().includes(value.toLowerCase())

          <div className="suggestions">      );

            {countrySuggestions.map(suggestion => (      

              <div       // Prioritize countries over cities and limit to 5 suggestions total

                key={suggestion}       const combinedSuggestions = [...countrySugs, ...citySugs];

                className="suggestion-item"      setCountrySuggestions(combinedSuggestions.slice(0, 5));

                onClick={() => handleSuggestionClick(suggestion)}      

              >      // Auto-search: If we have a match, zoom to it automatically

                {suggestion}      // Find exact matches first

              </div>      const exactCountryMatch = Object.keys(allCountries).find(c => 

            ))}        c.toLowerCase() === value.toLowerCase()

          </div>      );

        )}      

              const exactCityMatch = Object.keys(allCities).find(c => 

        {isLoggedIn && (        c.toLowerCase() === value.toLowerCase()

          <div className="saved-maps">      );

            <h3>Saved Maps</h3>      

            {maps.length > 0 ? (      // If no exact matches and we have at least 2 characters, try fuzzy match

              <div className="maps-list">      const fuzzyCountryMatch = (!exactCountryMatch && value.length >= 2) ? 

                {maps.map(map => (        Object.keys(allCountries).find(c => 

                  <div key={map.id} className="map-card">          c.toLowerCase().startsWith(value.toLowerCase())

                    <h4>{map.title}</h4>        ) : null;

                    <p>{map.description}</p>      

                    {map.coordinates && (      if (exactCountryMatch) {

                      <button         // Exact country match - zoom to country with higher zoom level

                        className="view-map-btn"        setSelectedCountry(exactCountryMatch);

                        onClick={() => {        const { lat, lng } = (allCountries as Record<string, { lat: number; lng: number }>)[exactCountryMatch];

                          onSearch(map.coordinates!.lat, map.coordinates!.lng, 5);        console.log('Exact country match found:', exactCountryMatch, lat, lng);

                        }}        

                      >        // Use a more dramatic zoom level for countries

                        View Map        // Larger countries need less zoom

                      </button>        let countryZoom = 6;

                    )}        const largeCountries = ['Russia', 'United States', 'China', 'Canada', 'Brazil', 'Australia'];

                  </div>        if (largeCountries.includes(exactCountryMatch)) {

                ))}          countryZoom = 4;

              </div>        }

            ) : (        

              <p>No saved maps yet.</p>        onSearch(lat, lng, countryZoom, exactCountryMatch);

            )}      } else if (exactCityMatch) {

          </div>        // Exact city match - zoom to city with higher zoom level

        )}        const cityData = (allCities as Record<string, { lat: number; lng: number; ar?: string }>)[exactCityMatch];

      </div>        const countryOfCity = findCountryForCity(exactCityMatch);

    </div>        console.log('Exact city match found:', exactCityMatch, cityData.lat, cityData.lng);

  );        

};        if (countryOfCity) {

          setSelectedCountry(countryOfCity);

export default CountrySidebar;          onSearch(cityData.lat, cityData.lng, 15, countryOfCity);
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

  // We removed the createCityMarkers function as it's no longer needed with the updated WorldMap component

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
  
  // We no longer need to create city markers as the WorldMap component has been updated
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
