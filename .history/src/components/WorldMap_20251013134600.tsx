import { MapContainer, TileLayer, useMap, Polygon, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './WorldMap.css';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import { COUNTRY_COORDINATES } from '../utils/countryCoordinates';
import ZoneControls from './ZoneControls';
import LayerControls from './LayerControls';
import './ZoneControls.css';
import { v4 as uuidv4 } from 'uuid';
import type { Zone } from '../types/zones';

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
  initialZones?: Zone[];
  mapId?: number;
}

// Different tile layer URLs
const TILE_LAYERS = {
  standard: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  terrain: 'https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png',
  dark: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
};

// Overlay layer URLs
const OVERLAY_LAYERS = {
  buildings: 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', // Buildings overlay
  streets: 'https://stamen-tiles.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.png' // Street labels
};

// Component to display the zones that have been created
const ZonesDisplay = ({ zones }: { zones: Zone[] }) => {
  return (
    <React.Fragment>
      {zones.map((zone) => {
        // Only render zones with coordinates
        if (!zone.coordinates || zone.coordinates.length === 0) return null;
        
        return (
          <Polygon 
            key={zone.id} 
            positions={zone.coordinates}
            pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.3 }}
          >
            <Tooltip permanent>
              {zone.name}
            </Tooltip>
          </Polygon>
        );
      })}
    </React.Fragment>
  );
};

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
    const handleCreated = (e: L.LeafletEvent) => {
      // Cast the event to access draw event properties
  const drawEvent = e as unknown as { layer: L.Polygon; layerType: string };
  const layer = drawEvent.layer;
      
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
      
      // Extract coordinates from the layer
      const coords: [number, number][] = [];
      if (layer.getLatLngs && typeof layer.getLatLngs === 'function') {
        // For polygons, getLatLngs returns an array of arrays
        const latLngGroups = layer.getLatLngs() as L.LatLng[][] | L.LatLng[][][];
        const firstRing = Array.isArray(latLngGroups[0]) ? latLngGroups[0] as L.LatLng[] : latLngGroups as unknown as L.LatLng[];
        for (const latLng of firstRing) {
          coords.push([latLng.lat, latLng.lng]);
        }
      }
      
      // Create the zone object
      const newZone: Zone = {
        id: uuidv4(),
        name: zoneName,
        color: zoneColor,
        coordinates: coords
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
        // Create a proper type for L.Draw.Polygon 
        interface DrawOptions {
          shapeOptions?: L.PathOptions;
        }
        
        interface DrawPolygonStatic {
          new(map: L.Map, options?: DrawOptions): L.Draw.Polygon;
        }
        
        const DrawPolygon = L.Draw.Polygon as unknown as DrawPolygonStatic;
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
  highlightedCountry,
  initialZones = [],
  mapId
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const [zones, setZones] = useState<Zone[]>(initialZones);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentZoneDetails, setCurrentZoneDetails] = useState<{ name: string; color: string }>({ name: "", color: "#3388ff" });
  
  // Layer management state
  const [currentLayers, setCurrentLayers] = useState({
    baseMap: 'standard',
    buildings: false,
    streets: false
  });

  // Initialize zones when initialZones prop changes
  useEffect(() => {
    setZones(initialZones);
  }, [initialZones]);

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
  
  // Load zones from database when mapId changes
  useEffect(() => {
    const loadZones = async () => {
      if (!mapId) {
        console.log('No mapId provided, skipping zone loading');
        return;
      }
      
      try {
        console.log(`Loading zones for map ID: ${mapId}`);
        const response = await fetch(`/api/db/tables/zones?map_id=${mapId}`);
        const data = await response.json();
        
        if (data.success && Array.isArray(data.records)) {
          // Parse coordinates from JSON strings
          const zonesWithParsedCoords = data.records.map((zone: Zone & { coordinates: string | [number, number][] }) => ({
            ...zone,
            coordinates: typeof zone.coordinates === 'string' 
              ? JSON.parse(zone.coordinates) 
              : zone.coordinates
          }));
          
          setZones(zonesWithParsedCoords);
          console.log(`Loaded ${zonesWithParsedCoords.length} zones for map ${mapId}`);
        } else {
          console.log('No zones found for this map');
          setZones([]);
        }
      } catch (err) {
        console.error('Failed to load zones:', err);
        setZones([]);
      }
    };
    
    loadZones();
  }, [mapId]);

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
  const handleZoneCreated = useCallback(async (zoneData: Zone) => {
    const updatedZones = [...zones, zoneData];
    setZones(updatedZones);
    setIsDrawing(false);
    
    // Save zone to database with map_id
    try {
      if (mapId) {
        // Use the db-routes endpoint to save to zones table
        const response = await fetch('/api/db/tables/zones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: zoneData.id,
            map_id: mapId,
            name: zoneData.name,
            color: zoneData.color,
            coordinates: JSON.stringify(zoneData.coordinates)
          })
        });
        
        const result = await response.json();
        if (result.success) {
          console.log('Zone saved successfully:', result);
        } else {
          console.error('Failed to save zone:', result.error);
          alert('Failed to save zone: ' + result.error);
        }
      } else {
        console.warn('No mapId provided, zone not saved to database');
      }
    } catch (err) {
      console.error('Failed to save zone:', err);
      alert('Failed to save zone. Please try again.');
    }
  }, [zones, mapId]);

  // Handle deleting a zone
  const handleDeleteZone = useCallback(async (id: string) => {
    try {
      // Delete from database first
      const response = await fetch(`/api/db/tables/zones/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.success) {
        // Remove from local state
        setZones(prev => prev.filter(z => z.id !== id));
        console.log('Zone deleted successfully');
      } else {
        console.error('Failed to delete zone:', result.error);
        alert('Failed to delete zone: ' + result.error);
      }
    } catch (err) {
      console.error('Failed to delete zone:', err);
      alert('Failed to delete zone. Please try again.');
    }
  }, []);

  // Handle layer changes
  const handleLayerChange = useCallback((layerType: string, value: string | boolean) => {
    setCurrentLayers(prev => ({
      ...prev,
      [layerType]: value
    }));
  }, []);  return (
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
        {/* Base tile layer */}
        <TileLayer 
          url={TILE_LAYERS[currentLayers.baseMap as keyof typeof TILE_LAYERS]} 
          attribution="© OpenStreetMap contributors"
        />
        
        {/* Buildings overlay */}
        {currentLayers.buildings && (
          <TileLayer 
            url={OVERLAY_LAYERS.buildings}
            opacity={0.6}
            attribution="Buildings data"
          />
        )}
        
        {/* Street labels overlay */}
        {currentLayers.streets && (
          <TileLayer 
            url={OVERLAY_LAYERS.streets}
            opacity={0.8}
            attribution="Street labels"
          />
        )}
        
        {/* Display all saved zones */}
        <ZonesDisplay zones={zones} />
      
      {/* Show drawing controls only when actively drawing */}
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
      
      <LayerControls
        currentLayers={currentLayers}
        onLayerChange={handleLayerChange}
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
