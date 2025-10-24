import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

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

// Props interface for the WorldMap component
interface WorldMapProps {
  lat: number;
  lng: number;
  zoom: number;
  // Keeping the language prop for compatibility
  language?: 'en' | 'ar';
}

// English-only map tile configuration
const ENGLISH_TILE_URL = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';
const ENGLISH_ATTRIBUTION = '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

/**
 * WorldMap component - displays a map with English-only labels
 */
const WorldMap: React.FC<WorldMapProps> = ({ lat, lng, zoom }) => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: NAVBAR_HEIGHT, 
      left: 0, 
      width: 'calc(100vw - 300px)', 
      height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, 
      zIndex: 1 
    }}>
      {/* @ts-ignore - Using ignore directive to bypass type issues with react-leaflet */}
      <MapContainer 
        center={[lat, lng]} 
        zoom={zoom} 
        minZoom={2} 
        maxZoom={18} 
        style={{ width: '100%', height: '100%' }}
      >
        {/* @ts-ignore - Using ignore directive to bypass type issues with react-leaflet */}
        <TileLayer
          attribution={ENGLISH_ATTRIBUTION}
          url={ENGLISH_TILE_URL}
        />
        <MapUpdater lat={lat} lng={lng} zoom={zoom} />
      </MapContainer>
    </div>
  );
};

export default WorldMap;
