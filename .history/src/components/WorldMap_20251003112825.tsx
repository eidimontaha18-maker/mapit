import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useRef, useEffect } from 'react';

const NAVBAR_HEIGHT = 64; // px

function MapUpdater({ lat, lng, zoom }: { lat: number, lng: number, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lng !== null && zoom !== null) {
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, zoom, map]);
  return null;
}

interface WorldMapProps {
  lat: number;
  lng: number;
  zoom: number;
  language?: 'en' | 'ar';
}

const tileUrls = {
  // Use a tile server that provides English-only labels
  en: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
  // Keep this as a fallback but we'll ensure English is always used
  ar: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png'
};

const tileAttribution = {
  en: '&copy; OpenStreetMap contributors',
  ar: '&copy; OpenStreetMap contributors' // Replace with Arabic attribution if needed
};

const WorldMap: React.FC<WorldMapProps> = ({ lat, lng, zoom, language = 'en' }) => {
  return (
    <div style={{ position: 'fixed', top: NAVBAR_HEIGHT, left: 0, width: 'calc(100vw - 300px)', height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, zIndex: 1 }}>
      <MapContainer center={[lat, lng]} zoom={zoom} minZoom={2} maxZoom={18} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution={tileAttribution[language]}
          url={tileUrls[language]}
        />
        <MapUpdater lat={lat} lng={lng} zoom={zoom} />
      </MapContainer>
    </div>
  );
};

export default WorldMap;
