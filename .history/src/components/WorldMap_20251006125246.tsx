import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './WorldMap.css';
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// Direct country coordinate mapping for reliable positioning
const COUNTRY_COORDINATES = {
  'Lebanon': { lat: 33.8547, lng: 35.8623, zoom: 8 },
  'Syria': { lat: 34.8021, lng: 38.9968, zoom: 7 },
  'Jordan': { lat: 30.5852, lng: 36.2384, zoom: 7 },
  'Israel': { lat: 31.0461, lng: 34.8516, zoom: 8 },
  'Palestine': { lat: 31.9466, lng: 35.3027, zoom: 9 },
  'United Arab Emirates': { lat: 23.4241, lng: 53.8478, zoom: 7 },
  'Kuwait': { lat: 29.3117, lng: 47.4818, zoom: 8 },
  'Qatar': { lat: 25.3548, lng: 51.1839, zoom: 8 },
  'Bahrain': { lat: 26.0667, lng: 50.5577, zoom: 9 },
  'Russia': { lat: 61.5240, lng: 105.3188, zoom: 3 },
  'United States': { lat: 37.0902, lng: -95.7129, zoom: 4 },
  'China': { lat: 35.8617, lng: 104.1954, zoom: 4 },
  'Canada': { lat: 56.1304, lng: -106.3468, zoom: 3 },
  'Brazil': { lat: -14.2350, lng: -51.9253, zoom: 4 },
  'Australia': { lat: -25.2744, lng: 133.7751, zoom: 4 }
};

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

// This component forces the map view to update when coordinates change
function MapUpdater({ lat, lng, zoom }: { lat: number, lng: number, zoom: number }) {
  const map = useMap();
  
  // Use aggressive approach to force map updates
  useEffect(() => {
    console.log('MapUpdater received new position:', { lat, lng, zoom });
    
    // Validate coordinates
    if (lat !== null && lng !== null && zoom !== null && !isNaN(lat) && !isNaN(lng) && !isNaN(zoom)) {
      console.log('FORCING map view update to:', [lat, lng], zoom);
      
      // HARD RESET THE MAP
      const forceMapReset = () => {
        // Clear any existing markers first
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            map.removeLayer(layer);
          }
        });
        
        // Reset map size
        map.invalidateSize(true);
        
        // First stop any animations
        map.stop();
        
        // Set center with no animation
        map.setView([lat, lng], zoom, { animate: false, duration: 0 });
        
        // Add a highly visible marker
        const marker = L.marker([lat, lng], {
          icon: new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })
        }).addTo(map);
        
        // Open popup
        marker.bindPopup(`<b>${lat.toFixed(4)}, ${lng.toFixed(4)}</b>`).openPopup();
        
        // Add a highlight circle
        const circle = L.circle([lat, lng], {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.2,
          radius: 30000
        }).addTo(map);
      };
      
      // Run immediately
      forceMapReset();
      
      // Run again to ensure it takes effect
      setTimeout(forceMapReset, 500);
      setTimeout(forceMapReset, 1500);
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
 * Enhanced LocationMarker component that guarantees visibility
 * and adds visual indicators to help locate countries on the map
 */
function LocationMarker({ lat, lng, label }: { lat: number, lng: number, label: string }) {
  // Create a reference to the marker element
  const markerRef = useRef<L.Marker | null>(null);
  const map = useMap();
  
  // Aggressively ensure the marker is visible and popup is open
  useEffect(() => {
    // First immediate attempt
    if (markerRef.current) {
      // Center map on marker
      map.setView([lat, lng], map.getZoom());
      
      // Open popup
      markerRef.current.openPopup();
      
      // Add bounce effect to marker
      const icon = markerRef.current.getElement();
      if (icon) {
        icon.classList.add('bounce-marker');
        setTimeout(() => {
          if (icon) icon.classList.remove('bounce-marker');
        }, 2000);
      }
      
      // Add a highlight circle
      const circle = L.circle([lat, lng], {
        color: '#4f8cff',
        fillColor: '#4f8cff',
        fillOpacity: 0.15,
        radius: 50000, // 50km radius
        weight: 2
      }).addTo(map);
      
      // Remove circle after animation
      setTimeout(() => map.removeLayer(circle), 5000);
    }
    
    // Series of follow-up attempts to ensure visibility
    const times = [300, 600, 1200];
    times.forEach(delay => {
      setTimeout(() => {
        if (markerRef.current) {
          map.setView([lat, lng], map.getZoom());
          markerRef.current.openPopup();
        }
      }, delay);
    });
  }, [lat, lng, map]);
  
  return (
    <Marker 
      position={[lat, lng]}
      // @ts-ignore - React-leaflet typing issue
      ref={markerRef}
      eventHandlers={{
        // @ts-ignore - Leaflet event typing issue
        add: (e) => {
          // Open popup when marker is added to the map
          const marker = e.target;
          setTimeout(() => {
            marker.openPopup();
          }, 200);
        }
      }}
    >
      <Popup>
        {/* closeButton prop removed due to typing issues */}
        <div style={{ textAlign: 'center' }}>
          <strong style={{ fontSize: '1.1em', color: '#4f8cff' }}>{label}</strong>
          <br/>
          <span style={{ fontSize: '0.8em', color: '#666' }}>
            Coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        </div>
      </Popup>
    </Marker>
  );
}

/**
 * WorldMap component - displays a map with English-only labels
 * This updated version focuses specifically on reliable country zooming
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
  // Reference to track if we need to force focus on small countries
  const lastCountryRef = useRef<string | undefined>(undefined);
  const mapRef = useRef<L.Map | null>(null);
  
  // Enhanced map with improved country focus handling
  console.log('WorldMap rendering with:', { lat, lng, zoom, highlightedCountry });
  
  // Force zoom function that will be called multiple times to ensure zoom happens
  const forceZoom = (targetLat: number, targetLng: number, targetZoom: number, delay = 0) => {
    setTimeout(() => {
      if (mapRef.current) {
        console.log(`Forcing zoom to [${targetLat}, ${targetLng}] at zoom level ${targetZoom} after ${delay}ms`);
        mapRef.current.setView([targetLat, targetLng], targetZoom, { animate: delay > 0 });
        
        // Add a highlight indicator if this is the first zoom
        if (delay === 0) {
          const circle = L.circle([targetLat, targetLng], {
            color: '#4f8cff',
            fillColor: '#4f8cff',
            fillOpacity: 0.2,
            radius: 75000, // 75km radius for visibility
            weight: 3
          }).addTo(mapRef.current);
          
          // Pulse the circle to draw attention
          let size = 1;
          const pulseInterval = setInterval(() => {
            size = size === 1 ? 1.3 : 1;
            circle.setRadius(75000 * size);
          }, 500);
          
          // Remove circle after animation
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.removeLayer(circle);
              clearInterval(pulseInterval);
            }
          }, 5000);
        }
      }
    }, delay);
  };

  // Special handling for countries to ensure proper zoom and visibility
  useEffect(() => {
    if (highlightedCountry) {
      console.log(`Country ${highlightedCountry} selected - ensuring visibility at coordinates:`, lat, lng);
      lastCountryRef.current = highlightedCountry;
      
      // Special country zoom levels
      const countryZoomLevels: Record<string, number> = {
        'Lebanon': 8,
        'Israel': 8,
        'Cyprus': 8,
        'Kuwait': 8, 
        'Qatar': 8,
        'Bahrain': 9,
        'Jordan': 7,
        'UAE': 7,
        'Palestine': 9
      };
      
      const countryZoom = countryZoomLevels[highlightedCountry] || 
                         (highlightedCountry === 'Russia' ? 3 : 6);
      
      // Force multiple zoom attempts to ensure it happens
      forceZoom(lat, lng, countryZoom, 0);  // Immediate
      forceZoom(lat, lng, countryZoom, 300); // After 300ms
      forceZoom(lat, lng, countryZoom, 800); // After 800ms
    }
  }, [highlightedCountry, lat, lng]);
  
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
        key={`map-${highlightedCountry || 'world'}-${lat}-${lng}-${new Date().getTime()}`} // Force complete re-creation with timestamp
        // @ts-expect-error - React-leaflet typing issues
        center={[lat || 20, lng || 0]} 
        zoom={zoom || 2} 
        minZoom={2} 
        maxZoom={18}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        zoomControl={true}
        // @ts-expect-error - React-leaflet typing issues
        whenCreated={(mapInstance: L.Map) => {
          console.log('New map instance created');
          mapRef.current = mapInstance;
          
          // Force focus with delay sequence to ensure it takes effect
          if (lat && lng) {
            // Immediate focus
            mapInstance.setView([lat, lng], zoom, { animate: false });
            
            // Create a sequence of delayed focus attempts
            [100, 500, 1000, 2000].forEach(delay => {
              setTimeout(() => {
                console.log(`Delayed focus at ${delay}ms`);
                mapInstance.setView([lat, lng], zoom, { animate: false });
              }, delay);
            });
          }
        }}
      >
        <TileLayer
          // @ts-expect-error - Type safety is confirmed in react-leaflet
          attribution={ENGLISH_ATTRIBUTION}
          url={ENGLISH_TILE_URL}
        />
        <MapUpdater lat={lat} lng={lng} zoom={zoom} />
        
        {/* Add a marker with forced visibility for the current location */}
        {lat && lng && (
          <>
            <LocationMarker 
              lat={lat} 
              lng={lng} 
              label={searchedCity || highlightedCountry || 'Selected Location'} 
            />
            {/* Add a fixed indicator to highlight the center of the map */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '10px',
              height: '10px',
              marginTop: '-5px',
              marginLeft: '-5px',
              backgroundColor: 'rgba(79, 140, 255, 0.8)',
              border: '2px solid white',
              borderRadius: '50%',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
              zIndex: 1000,
              pointerEvents: 'none'
            }} />
            
            {/* Show country name overlay */}
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
