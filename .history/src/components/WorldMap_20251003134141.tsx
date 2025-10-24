import { MapContainer, TileLayer, useMap, Marker, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './WorldMap.css';
import { useEffect } from 'react';
import L from 'leaflet';

// Fix for Leaflet marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom location marker icon
const locationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [35, 50], // Larger for better visibility
  iconAnchor: [17, 50],
  popupAnchor: [1, -50],
  shadowSize: [41, 41]
});

const NAVBAR_HEIGHT = 64; // px

// This component updates the map view when props change with a smooth animation
function MapUpdater({ lat, lng, zoom }: { lat: number, lng: number, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lng !== null && zoom !== null) {
      // Use flyTo for a smooth animation to the new location
      map.flyTo([lat, lng], zoom, {
        animate: true,
        duration: 1.5 // seconds
      });
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
 * MapLegend component to display marker information
 */
// Map legend component has been removed since there are no markers to show

// City markers have been removed

/**
 * WorldMap component - displays a map with English-only labels
 */
const WorldMap: React.FC<WorldMapProps> = ({ 
  lat, 
  lng, 
  zoom, 
  highlightedCountry
}) => {
  // Enhanced map with location marker

  return (
    <div style={{ 
      position: 'fixed', 
      top: NAVBAR_HEIGHT, 
      left: 0, 
      width: 'calc(100vw - 300px)', 
      height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, 
      zIndex: 1
    }}>
      <MapContainer 
        // @ts-expect-error - Ignoring type issues with react-leaflet
        center={[lat, lng]} 
        zoom={zoom} 
        minZoom={2} 
        maxZoom={18}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          // @ts-expect-error - Ignoring type issues with react-leaflet
          attribution={ENGLISH_ATTRIBUTION}
          url={ENGLISH_TILE_URL}
        />
        <MapUpdater lat={lat} lng={lng} zoom={zoom} />
        
        {/* Location marker at selected coordinates */}
        <Marker 
          position={[lat, lng]} 
          // @ts-expect-error - Ignoring type issues with react-leaflet
          icon={locationIcon}
        >
          <Tooltip 
            // @ts-expect-error - Ignoring type issues with react-leaflet
            permanent={true}
            direction="top"
            offset={[0, -45]}
            opacity={1}
            className="location-tooltip"
          >
            {highlightedCountry || 'Selected Location'}
          </Tooltip>
        </Marker>
        
        {/* Map Legend */}
        <div className="map-legend">
          <h4>Map Legend</h4>
          <div className="legend-note">
            Map location marker shows selected area
          </div>
          {highlightedCountry && (
            <div className="highlighted-country">
              {highlightedCountry ? `Selected country: ${highlightedCountry}` : 'Showing world map'}
            </div>
          )}
        </div>
      </MapContainer>
    </div>
  );
};

export default WorldMap;
