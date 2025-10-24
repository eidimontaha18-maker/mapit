import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './WorldMap.css';
import React, { useEffect, useRef, useState, useCallback } from 'react';
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
}

interface WorldMapProps {
  lat: number;
  lng: number;
  zoom: number;
  highlightedCountry?: string;
}

const ENGLISH_TILE_URL = 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';

// Separate component to use the useMap hook
const PolygonDrawingControl = ({ 
  onZoneCreated, 
  isDrawing, 
  zoneName, 
  zoneColor 
}: { 
  onZoneCreated: (zone: Zone) => void;
  isDrawing: boolean; 
  zoneName: string; 
  zoneColor: string 
}) => {
  const map = useMap();
  const drawingLayerRef = useRef<L.FeatureGroup | null>(null);
  
  // Initialize the drawing layer
  useEffect(() => {
    // Create a FeatureGroup to store editable layers
    const drawingLayer = new L.FeatureGroup();
    map.addLayer(drawingLayer);
    drawingLayerRef.current = drawingLayer;
    
    // Handle created polygon
    const handleCreated = (e: any) => {
      const layer = e.layer;
      
      // Style the polygon
      layer.setStyle({
        color: zoneColor,
        fillColor: zoneColor,
        fillOpacity: 0.3,
      });
      
      // Add a tooltip with the zone name
      layer.bindTooltip(zoneName, { 
        permanent: true, 
        direction: 'center',
        className: 'zone-label'
      }).openTooltip();
      
      // Add the layer to the drawing layer
      drawingLayer.addLayer(layer);
      
      // Create the zone object
      const newZone: Zone = {
        id: uuidv4(),
        name: zoneName,
        color: zoneColor
      };
      
      // Notify parent component
      onZoneCreated(newZone);
    };
    
    // Add the event listener
    map.on('draw:created', handleCreated);
    
    // Cleanup
    return () => {
      map.off('draw:created', handleCreated);
      if (drawingLayerRef.current && map.hasLayer(drawingLayerRef.current)) {
        map.removeLayer(drawingLayerRef.current);
      }
    };
  }, [map, zoneName, zoneColor, onZoneCreated]);
  
  // Enable/disable drawing
  useEffect(() => {
    if (!map) return;
    
    if (isDrawing) {
      try {
        // Use any to bypass TypeScript type checking issues with L.Draw
        const DrawPolygon = L.Draw.Polygon as any;
        const drawControl = new DrawPolygon(map, {
          shapeOptions: {
            color: zoneColor,
            fillColor: zoneColor,
            fillOpacity: 0.3
          }
        });
        drawControl.enable();
        
        // Cancel drawing when the isDrawing state changes
        return () => {
          drawControl.disable();
        };
      } catch (error) {
        console.error('Error creating draw control:', error);
      }
    }
  }, [map, isDrawing, zoneColor]);
  
  return null;
};

const WorldMap: React.FC<WorldMapProps> = ({
  lat,
  lng,
  zoom,
  highlightedCountry
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentZoneDetails, setCurrentZoneDetails] = useState<{ name: string; color: string }>({ name: "", color: "#3388ff" });

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
  const handleStartDrawing = useCallback((name: string, color: string) => {
    if (!name.trim()) {
      alert("Please enter a zone name");
      return;
    }
    
    setIsDrawing(true);
    setCurrentZoneDetails({ name, color });
  }, []);

  const handleCancelDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  // Handle zone creation callback from PolygonDrawingControl
  const handleZoneCreated = useCallback((zoneData: Zone) => {
    setZones(prev => [...prev, zoneData]);
    setIsDrawing(false);
  }, []);

  // Handle deleting a zone
  const handleDeleteZone = useCallback((id: string) => {
    setZones(prev => prev.filter(z => z.id !== id));
    // Note: We would need to also remove the layer from the map,
    // but since PolygonDrawingControl manages the layers, we would need to refactor
    // to keep track of layers separately if we want this functionality
  }, []);

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
        
        {isDrawing && (
          <PolygonDrawingControl 
            onZoneCreated={handleZoneCreated}
            isDrawing={isDrawing}
            zoneName={currentZoneDetails.name}
            zoneColor={currentZoneDetails.color}
          />
        )}
      </MapContainer>

      <ZoneControls
        zones={zones}
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
