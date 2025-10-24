import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './WorldMap.css';
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { COUNTRY_COORDINATES } from '../utils/countryCoordinates';

// Fix for Leaflet marker icons in React
// Using a more specific type for the prototype
interface LeafletIcon {
  _getIconUrl?: unknown;
}

// Fix for Leaflet marker icons in React
delete (L.Icon.Default.prototype as LeafletIcon)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const NAVBAR_HEIGHT = 56;

interface WorldMapProps {
  lat: number;
  lng: number;
  zoom: number;
  highlightedCountry?: string;
}

const ENGLISH_TILE_URL = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';

const WorldMap: React.FC<WorldMapProps> = ({
  lat,
  lng,
  zoom,
  cityMarkers = [],
  highlightedCountry,
  searchedCity
}) => {
  const mapRef = useRef<L.Map | null>(null);

  // Update map view when highlighted country changes
  useEffect(() => {
    if (highlightedCountry && COUNTRY_COORDINATES[highlightedCountry] && mapRef.current) {
      const { lat: countryLat, lng: countryLng, zoom: countryZoom } = COUNTRY_COORDINATES[highlightedCountry];
      mapRef.current.setView([countryLat, countryLng], countryZoom, { animate: true });
    }
  }, [highlightedCountry]);

  // Update map when lat/lng/zoom changes
  useEffect(() => {
    if (mapRef.current && lat && lng) {
      mapRef.current.setView([lat, lng], zoom, { animate: true });
    }
  }, [lat, lng, zoom]);

  return (
    <div style={{ position: 'fixed', top: NAVBAR_HEIGHT, left: 0, width: '100vw', height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, zIndex: 1 }}>
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        minZoom={2}
        maxZoom={18}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        zoomControl={true}
        ref={(map) => {
          if (map) {
            mapRef.current = map;
          }
        }}
      >
        <TileLayer 
          url={ENGLISH_TILE_URL} 
        />

        {/* Current location marker removed */}
      </MapContainer>
      
      {highlightedCountry && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: '8px 16px',
          borderRadius: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          zIndex: 1000,
          pointerEvents: 'none',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#4f8cff'
        }}>
          {highlightedCountry}
        </div>
      )}
    </div>
  );
};

export default WorldMap;
