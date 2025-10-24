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
  cityMarkers?: CityMarker[];
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

/**
 * WorldMap component - displays a map with English-only labels
 */
const WorldMap: React.FC<WorldMapProps> = ({ lat, lng, zoom, cityMarkers = [] }) => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: NAVBAR_HEIGHT, 
      left: 0, 
      width: 'calc(100vw - 300px)', 
      height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, 
      zIndex: 1
    }}>
      {/* @ts-expect-error - Using expect-error directive to bypass type issues with react-leaflet */}
      <MapContainer 
        center={[lat, lng]} 
        zoom={zoom} 
        minZoom={2} 
        maxZoom={18} 
        style={{ width: '100%', height: '100%' }}
      >
        {/* @ts-expect-error - Using expect-error directive to bypass type issues with react-leaflet */}
        <TileLayer
          attribution={ENGLISH_ATTRIBUTION}
          url={ENGLISH_TILE_URL}
        />
        <MapUpdater lat={lat} lng={lng} zoom={zoom} />
        
        {/* Render city markers */}
        {cityMarkers.map((city) => (
          <Marker 
            key={city.name}
            // @ts-expect-error - Using expect-error directive for react-leaflet types
            position={[city.lat, city.lng]}
            // @ts-expect-error - Using expect-error directive for react-leaflet types
            icon={city.isCapital ? capitalIcon : cityIcon}
          >
            {/* @ts-expect-error - Using expect-error directive for react-leaflet types */}
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ fontSize: '16px' }}>{city.name}</strong>
                {city.isCapital && <div style={{ color: 'red', fontWeight: 'bold' }}>Capital City</div>}
                <div style={{ color: '#555', marginTop: '4px' }}>Country: {city.country}</div>
              </div>
            </Popup>
            {/* @ts-expect-error - Using expect-error directive for react-leaflet types */}
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
      </MapContainer>
    </div>
  );
};

export default WorldMap;
