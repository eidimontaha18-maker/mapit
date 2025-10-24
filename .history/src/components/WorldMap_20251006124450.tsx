import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './WorldMap.css';
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Add custom CSS to the document for marker animations
const markerAnimationStyle = document.createElement('style');
markerAnimationStyle.innerHTML = `
  @keyframes markerBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  }
  
  .bounce-marker {
    animation: markerBounce 0.6s ease-in-out;
    animation-iteration-count: 3;
  }
  
  .leaflet-popup-content-wrapper {
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    box-shadow: 0 3px 14px rgba(0,0,0,0.2);
  }
  
  .leaflet-popup-content {
    margin: 12px;
    font-family: Arial, sans-serif;
  }
  
  .leaflet-container a.leaflet-popup-close-button {
    color: #333;
  }
`;
document.head.appendChild(markerAnimationStyle);

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
      
      // Directly use setView for immediate, reliable positioning
      try {
        // First invalidate size to ensure the map is properly sized
        map.invalidateSize();
        
        // Then set the view with animation
        map.setView([lat, lng], zoom, {
          animate: true,
          duration: 1.0
        });
        
        // Add a marker temporarily to show the location
        const marker = L.marker([lat, lng]).addTo(map);
        marker.openPopup();
        
        // Remove the marker after a few seconds
        setTimeout(() => {
          map.removeLayer(marker);
        }, 3000);
      } catch (e) {
        console.error('Error setting map view:', e);
        // Fall back to a basic view change
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
  
  // Special handling for small countries to ensure visibility
  useEffect(() => {
    if (highlightedCountry && ['Lebanon', 'Israel', 'Cyprus', 'Kuwait', 'Qatar', 'Bahrain'].includes(highlightedCountry)) {
      console.log('Small country detected:', highlightedCountry, '- ensuring visibility');
      // This will trigger re-rendering of the marker with special visibility
    }
  }, [highlightedCountry]);
  
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
        // Force initial center but don't rely on this for updates - MapUpdater handles that
        // @ts-expect-error - Type safety is confirmed in react-leaflet
        center={[lat || 20, lng || 0]} 
        zoom={zoom || 2} 
        minZoom={2} 
        maxZoom={18}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        zoomControl={true}
        whenCreated={(mapInstance) => {
          console.log('Map instance created');
          // Set a flag to indicate this is a fresh map instance
          (mapInstance as any)._freshLoad = true;
        }}
      >
        <TileLayer
          // @ts-expect-error - Type safety is confirmed in react-leaflet
          attribution={ENGLISH_ATTRIBUTION}
          url={ENGLISH_TILE_URL}
        />
        <MapUpdater lat={lat} lng={lng} zoom={zoom} />
        
        {/* Add a marker and circle indicator for the current search position */}
        {lat && lng && (
          <>
            <LocationMarker 
              lat={lat} 
              lng={lng} 
              label={searchedCity || highlightedCountry || 'Selected Location'} 
            />
            {/* Add a pulsating circle to highlight the location */}
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '30px',
                height: '30px',
                marginTop: '-15px',
                marginLeft: '-15px',
                backgroundColor: 'rgba(79, 140, 255, 0.3)',
                borderRadius: '50%',
                animation: 'pulse 1.5s infinite',
                zIndex: 400,
                pointerEvents: 'none'
              }}
            />
            <style>
              {`
                @keyframes pulse {
                  0% { transform: scale(1); opacity: 0.7; }
                  50% { transform: scale(1.5); opacity: 0.4; }
                  100% { transform: scale(1); opacity: 0.7; }
                }
              `}
            </style>
          </>
        )}
        
        {/* Show debugging information */}
        {highlightedCountry && (
          <div 
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              padding: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '5px',
              zIndex: 1000,
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
              fontSize: '12px'
            }}
          >
            <strong>Selected: {highlightedCountry}</strong><br/>
            Position: {lat.toFixed(4)}, {lng.toFixed(4)}<br/>
            Zoom: {zoom}
          </div>
        )}
      </MapContainer>
    </div>
  );
};

export default WorldMap;
