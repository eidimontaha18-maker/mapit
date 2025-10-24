import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './WorldMap.css';
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix for Leaflet marker icons in React
// @ts-expect-error: This is a known workaround for Leaflet marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});



const NAVBAR_HEIGHT = 56; // px, must match the actual navbar height

// This component updates the map view when props change with a smooth animation
function MapUpdater({ lat, lng, zoom }: { lat: number, lng: number, zoom: number }) {
  const map = useMap();
  
  // Use a more robust approach to update the map view
  useEffect(() => {
    console.log('MapUpdater received new position:', { lat, lng, zoom });
    
    // Only update if we have valid coordinates
    if (lat !== null && lng !== null && zoom !== null && !isNaN(lat) && !isNaN(lng) && !isNaN(zoom)) {
      console.log('Setting view to:', [lat, lng], zoom);
      
      // First try using flyTo for a smoother animation
      try {
        // Set a timeout to ensure the map is fully loaded
        setTimeout(() => {
          console.log('Executing flyTo:', [lat, lng], zoom);
          map.flyTo([lat, lng], zoom, {
            duration: 1.5, // Slightly longer for smoother animation
          });
        }, 100);
      } catch (e) {
        console.error('Error with flyTo, using setView instead:', e);
        // Fallback to setView if flyTo fails
        map.setView([lat, lng], zoom);
      }
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
 * LocationMarker component to display a marker at a specific location
 * with an automatically opened popup for better visibility
 */
function LocationMarker({ lat, lng, label }: { lat: number, lng: number, label: string }) {
  // Create a reference to the marker element
  const markerRef = useRef<L.Marker | null>(null);
  
  // Use effect to open the popup after the marker is rendered
  useEffect(() => {
    if (markerRef.current) {
      // First open immediately
      markerRef.current.openPopup();
      
      // Then try again after a short delay to ensure it works
      setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.openPopup();
        }
      }, 300);
    }
  }, []);
  
  return (
    <Marker 
      position={[lat, lng]}
      // @ts-expect-error - Type issue with react-leaflet refs
      ref={markerRef}
      eventHandlers={{
        add: (e: any) => {
          // Open popup when marker is added to the map
          const marker = e.target;
          setTimeout(() => {
            marker.openPopup();
          }, 200);
        }
      }}
    >
      <Popup>
        <strong>{label}</strong>
        <br/>
        <span style={{ fontSize: '0.8em', color: '#666' }}>
          Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </Popup>
    </Marker>
  );
}

/**
 * WorldMap component - displays a map with English-only labels
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
const WorldMap: React.FC<WorldMapProps> = ({ 
  lat, 
  lng, 
  zoom,
  cityMarkers = [],
  highlightedCountry,
  searchedCity
}) => {
  // Enhanced map with location marker and debugging info
  console.log('WorldMap rendering with:', { lat, lng, zoom, highlightedCountry });
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: NAVBAR_HEIGHT, 
      left: 0, 
      width: '100vw', // Full width of viewport 
      height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, 
      zIndex: 1 // Lower z-index so the sidebar appears above
    }}>
      <MapContainer 
        // @ts-expect-error - Ignoring type issues with react-leaflet
        center={[lat, lng]} 
        zoom={zoom} 
        minZoom={2} 
        maxZoom={18}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        zoomControl={true}
      >
        <TileLayer
          // @ts-expect-error - Ignoring type issues with react-leaflet
          attribution={ENGLISH_ATTRIBUTION}
          url={ENGLISH_TILE_URL}
        />
        <MapUpdater lat={lat} lng={lng} zoom={zoom} />
        
        {/* Add a marker for the current search position */}
        {lat && lng && (
          <LocationMarker lat={lat} lng={lng} label={searchedCity || highlightedCountry || 'Selected Location'} />
        )}
        
        {/* We can't use direct overlay in MapContainer, using a different approach */}
      </MapContainer>
    </div>
  );
};

export default WorldMap;
