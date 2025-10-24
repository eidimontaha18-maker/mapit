import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './WorldMap.css';
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import { COUNTRY_COORDINATES } from '../utils/countryCoordinates';
import ZoneControls from './ZoneControls';
import './ZoneControls.css';
import { v4 as uuidv4 } from 'uuid';

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

interface Zone {
  id: string;
  name: string;
  color: string;
  polygon: L.Layer;
}

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
  highlightedCountry
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentZone, setCurrentZone] = useState<{ name: string; color: string } | null>(null);

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

  // Handle starting to draw a zone
  const handleStartDrawing = (name: string, color: string) => {
    setIsDrawing(true);
    setCurrentZone({ name, color });
    
    // Enable drawing mode
    if (mapRef.current) {
      // We'll use the EditControl to handle the drawing
      // Just set up the state for when the creation happens
    }
  };

  const handleCancelDrawing = () => {
    setIsDrawing(false);
    setCurrentZone(null);
    
    // Disable drawing mode
    if (mapRef.current) {
      // Stop any active drawing
      mapRef.current.fire('draw:drawstop');
    }
  };

  // Handle polygon created
  const handleCreated = (e: { layer: L.Layer }) => {
    if (currentZone) {
      const { name, color } = currentZone;
      const layer = e.layer as L.Polygon;
      
      // Style the polygon
      layer.setStyle({
        color: color,
        fillColor: color,
        fillOpacity: 0.3,
      });
      
      // Add a popup with the zone name
      layer.bindTooltip(name, { 
        permanent: true, 
        direction: 'center',
        className: 'zone-label'
      }).openTooltip();
      
      // Add to zones
      const newZone: Zone = {
        id: uuidv4(),
        name: name,
        color: color,
        polygon: layer
      };
      
      setZones(prev => [...prev, newZone]);
      setIsDrawing(false);
      setCurrentZone(null);
    }
  };

  // Handle deleting a zone
  const handleDeleteZone = (id: string) => {
    setZones(prev => {
      const zoneToDelete = prev.find(z => z.id === id);
      if (zoneToDelete && featureGroupRef.current) {
        featureGroupRef.current.removeLayer(zoneToDelete.polygon);
      }
      return prev.filter(z => z.id !== id);
    });
  };

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

        <FeatureGroup 
          ref={(group) => {
            if (group) {
              featureGroupRef.current = group;
            }
          }}
        />
        {/* We'll use Leaflet.draw directly instead of EditControl */}
      </MapContainer>

      <ZoneControls
        zones={zones.map(z => ({ id: z.id, name: z.name, color: z.color }))}
        isDrawing={isDrawing}
        onCancelDrawing={handleCancelDrawing}
        onCreateZone={handleStartDrawing}
        onDeleteZone={handleDeleteZone}
      />
      
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
