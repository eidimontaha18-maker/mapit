import { MapContainer, TileLayer, useMap, Marker, Popup, Circle, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './WorldMap.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Fix for Leaflet marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom city icons
const cityIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Special icon for capital cities
const capitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [30, 45],  // Slightly larger
  iconAnchor: [15, 45],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const NAVBAR_HEIGHT = 64; // px

// This component updates the map view when props change
function MapUpdater({ lat, lng, zoom }: { lat: number, lng: number, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lng !== null && zoom !== null) {
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, zoom, map]);
  return null;
}

// City marker type definition
interface CityMarker {
  name: string;
  lat: number;
  lng: number;
  country: string;
  isCapital?: boolean;
}

// Props interface for the WorldMap component
interface WorldMapProps {
  lat: number;
  lng: number;
  zoom: number;
  // Keeping the language prop for compatibility
  language?: 'en' | 'ar';
  cityMarkers: CityMarker[];
  highlightedCountry?: string;
  showAllCities?: boolean;
  searchedCity?: string | null;
}

// English-only map tile configuration
const ENGLISH_TILE_URL = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';
const ENGLISH_ATTRIBUTION = '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

/**
 * MapLegend component to display marker information
 */
const MapLegend: React.FC = () => {
  return (
    <div className="map-legend">
      <h4>Map Legend</h4>
      <div className="legend-item">
        <div className="legend-icon capital"></div>
        <span>Capital City</span>
      </div>
      <div className="legend-item">
        <div className="legend-icon city"></div>
        <span>City</span>
      </div>
      <div className="legend-note">
        Click on any marker to see city details
      </div>
    </div>
  );
};

// Gray versions for non-highlighted cities
const grayIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [20, 33], // Smaller than the main icons
  iconAnchor: [10, 33],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const grayCapitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 39], // Slightly larger than regular gray
  iconAnchor: [12, 39],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

/**
 * WorldMap component - displays a map with English-only labels
 */
const WorldMap: React.FC<WorldMapProps> = ({ 
  lat, 
  lng, 
  zoom, 
  cityMarkers = [], 
  highlightedCountry,
  showAllCities = true
}) => {
  // Get all cities and map them to our marker format
  const [allCityMarkers, setAllCityMarkers] = useState<CityMarker[]>([]);

  // Load all cities from allCities.json
  useEffect(() => {
    // Function to load all cities
    const loadAllCities = async () => {
      const allCitiesData = await import('../assets/allCities.json').then(m => m.default);
      const allCountriesData = await import('../assets/allCountries.json').then(m => m.default);
      
      // Map of country capitals for reference
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

      // Find country for each city
      const cityToCountry: Record<string, string> = {};
      
      // Process city-country mappings
      for (const [cityName, cityData] of Object.entries(allCitiesData)) {
        // Try to guess the country based on proximity to country coordinates
        let closestCountry = '';
        let shortestDistance = Infinity;
        
        for (const [countryName, countryData] of Object.entries(allCountriesData)) {
          const country = countryData as { lat: number; lng: number };
          const city = cityData as { lat: number; lng: number };
          
          // Calculate distance between city and country center
          const distance = Math.sqrt(
            Math.pow(country.lat - city.lat, 2) + 
            Math.pow(country.lng - city.lng, 2)
          );
          
          if (distance < shortestDistance) {
            shortestDistance = distance;
            closestCountry = countryName;
          }
        }
        
        cityToCountry[cityName] = closestCountry;
      }
      
      // Convert to CityMarker array
      const markers: CityMarker[] = Object.entries(allCitiesData).map(([cityName, cityData]) => {
        const city = cityData as { lat: number; lng: number };
        const country = cityToCountry[cityName] || 'Unknown';
        
        return {
          name: cityName,
          lat: city.lat,
          lng: city.lng,
          country: country,
          isCapital: capitals[country] === cityName
        };
      });
      
      setAllCityMarkers(markers);
    };
    
    loadAllCities();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: NAVBAR_HEIGHT, 
      left: 0, 
      width: 'calc(100vw - 300px)', 
      height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, 
      zIndex: 1
    }}>
      <MapContainer 
        center={[lat, lng]} 
        zoom={zoom} 
        minZoom={2} 
        maxZoom={18} 
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution={ENGLISH_ATTRIBUTION}
          url={ENGLISH_TILE_URL}
        />
        <MapUpdater lat={lat} lng={lng} zoom={zoom} />
        
        {/* Map Legend */}
        <div className="map-legend">
          <h4>Map Legend</h4>
          <div className="legend-item">
            <div className="legend-icon capital"></div>
            <span>Capital City</span>
          </div>
          <div className="legend-item">
            <div className="legend-icon city"></div>
            <span>City</span>
          </div>
          {showAllCities && highlightedCountry && (
            <div className="legend-item">
              <div className="legend-icon gray"></div>
              <span>Other Cities</span>
            </div>
          )}
          <div className="legend-note">
            Click on any marker to see city details
          </div>
          {highlightedCountry && (
            <div className="highlighted-country">
              {highlightedCountry ? `Highlighting: ${highlightedCountry}` : 'Showing all countries'}
            </div>
          )}
          <div className="cities-count">
            {cityMarkers.length > 0 ? 
              `Showing ${cityMarkers.length} cities${highlightedCountry ? ` in ${highlightedCountry}` : ''}` : 
              `Total cities: ${allCityMarkers.length}`}
          </div>
        </div>
        
        {/* Render highlighted city markers */}
        {cityMarkers.map((city) => (
          <Marker 
            key={`highlighted-${city.name}-${city.country}`}
            position={[city.lat, city.lng]}
            icon={city.isCapital ? capitalIcon : cityIcon}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ fontSize: '16px' }}>{city.name}</strong>
                {city.isCapital && <div style={{ color: 'red', fontWeight: 'bold' }}>Capital City</div>}
                <div style={{ color: '#555', marginTop: '4px' }}>Country: {city.country}</div>
              </div>
            </Popup>
            <Tooltip 
              permanent={city.isCapital} 
              direction="top" 
              offset={[0, city.isCapital ? -25 : -20]} 
              opacity={0.9}
              className={city.isCapital ? "capital-tooltip" : "city-tooltip"}
            >
              {city.name} {city.isCapital ? ' (Capital)' : ''}
            </Tooltip>
          </Marker>
        ))}
        
        {/* Render all other cities in gray if showAllCities is true */}
        {showAllCities && allCityMarkers.filter(city => 
          // Don't show cities that are already highlighted
          !cityMarkers.some(m => m.name === city.name && m.country === city.country)
        ).map((city) => (
          <Marker 
            key={`all-${city.name}-${city.country}`}
            position={[city.lat, city.lng]}
            icon={city.isCapital ? grayCapitalIcon : grayIcon}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ fontSize: '16px' }}>{city.name}</strong>
                {city.isCapital && <div style={{ color: '#888', fontWeight: 'bold' }}>Capital City</div>}
                <div style={{ color: '#777', marginTop: '4px' }}>Country: {city.country}</div>
              </div>
            </Popup>
            <Tooltip 
              permanent={false}
              direction="top" 
              offset={[0, -15]} 
              opacity={0.7}
              className="gray-tooltip"
            >
              {city.name}
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default WorldMap;
