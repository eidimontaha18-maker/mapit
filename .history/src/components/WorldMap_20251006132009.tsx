import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './WorldMap.css';
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { COUNTRY_COORDINATES } from '../utils/countryCoordinates';

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
  const initialized = useRef(false);
  const positionRef = useRef({ lat, lng, zoom, updateCount: 0 });
  
  // Super aggressive approach to force map updates
  useEffect(() => {
    console.log('MapUpdater received new position:', { lat, lng, zoom });
    
    // Validate coordinates
    if (lat !== null && lng !== null && zoom !== null && !isNaN(lat) && !isNaN(lng) && !isNaN(zoom)) {
      // Update the position ref
      positionRef.current = { 
        lat, 
        lng, 
        zoom, 
        updateCount: positionRef.current.updateCount + 1 
      };
      console.log(`FORCING map view update #${positionRef.current.updateCount} to:`, [lat, lng], zoom);
      
      // HARD RESET THE MAP
      const forceMapReset = (attempt = 0) => {
        // Clear any existing custom layers first (markers, circles)
        map.eachLayer((layer: L.Layer) => {
          if (!(layer instanceof L.TileLayer)) {
            map.removeLayer(layer);
          }
        });
        
        // Reset map size (handling possible container size issues)
        map.invalidateSize({ animate: false, pan: false, debounceMoveend: true });
        
        // First stop any animations
        map.stop();
        
        // Set center with no animation and options to force update
        map.setView([lat, lng], zoom, { 
          animate: false, 
          duration: 0, 
          noMoveStart: true, 
          reset: true 
        });
        
        console.log(`Map reset attempt ${attempt+1} complete`);
        
        // Add a highly visible marker
        const marker = L.marker([lat, lng], {
          icon: new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          }),
          // Make sure marker is above other layers
          zIndexOffset: 1000
        }).addTo(map);
        
        // Open popup
        marker.bindPopup(`<b>${lat.toFixed(4)}, ${lng.toFixed(4)}</b>`).openPopup();
        
        // Add a highlight circle (no need to store reference)
        L.circle([lat, lng], {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.2,
          radius: 50000
        }).addTo(map);
      };
      
      // Initial reset
      forceMapReset(0);
      
      // Multi-stage reset with exponential backoff to ensure it takes effect
      // This will try at different intervals in case the first attempts fail
      [150, 500, 1500, 3000].forEach((delay, index) => {
        setTimeout(() => forceMapReset(index + 1), delay);
      });
    }
  }, [lat, lng, zoom, map]);
  
  // Separate effect to run on mount and continuously check the view is correct
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      console.log('MapUpdater initialized with continuous monitoring');
      
      // Set up continuous monitoring to ensure view stays correct
      const monitorInterval = setInterval(() => {
        const { lat, lng, zoom } = positionRef.current;
        
        // Get current center and zoom
        const currentCenter = map.getCenter();
        const currentZoom = map.getZoom();
        
        // Check if map has significantly drifted from where it should be
        const latDiff = Math.abs(currentCenter.lat - lat);
        const map = useMap();
        useEffect(() => {
          if (lat !== null && lng !== null && zoom !== null && !isNaN(lat) && !isNaN(lng) && !isNaN(zoom)) {
            map.setView([lat, lng], zoom, { animate: false });
          }
        }, [lat, lng, zoom, map]);
        return null;
            [100, 300, 700, 1500].forEach((delay, index) => {
              setTimeout(() => {
                if (mapRef.current) {
                  console.log(`Crucial country update ${index+1} for ${highlightedCountry}`);
                  mapRef.current.setView([countryLat, countryLng], countryZoom, { animate: false });
                  mapRef.current.invalidateSize(true);
                }
              }, delay);
            });
          } else {
            // Standard handling for other countries
            mapRef.current.setView([countryLat, countryLng], countryZoom, { animate: false });
            
            // Force a second update to ensure it takes
            setTimeout(() => {
              if (mapRef.current) {
                mapRef.current.setView([countryLat, countryLng], countryZoom, { animate: false });
              }
            }, 300);
          }
        }
      }
    }
  }, [highlightedCountry, CRUCIAL_COUNTRIES]);
  
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
            const map = useMap();
            useEffect(() => {
              if (lat !== null && lng !== null && zoom !== null && !isNaN(lat) && !isNaN(lng) && !isNaN(zoom)) {
                map.setView([lat, lng], zoom, { animate: false });
              }
            }, [lat, lng, zoom, map]);
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
