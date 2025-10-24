import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import WorldMap from '../components/WorldMap';
import CountrySidebar from '../components/CountrySidebar';

interface CityMarker {
  name: string;
  lat: number;
  lng: number;
  country: string;
  isCapital?: boolean;
}

const MapPageWithSidebar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [mapPosition, setMapPosition] = useState({
    lat: 20,
    lng: 0,
    zoom: 2
  });
  const [cityMarkers, setCityMarkers] = useState<CityMarker[]>([]);
  const [highlightedCountry, setHighlightedCountry] = useState<string | undefined>(undefined);
  const [mapTitle, setMapTitle] = useState('');
  const [mapDescription, setMapDescription] = useState('');
  const [mapCode, setMapCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load map data if ID is provided
  useEffect(() => {
    if (id) {
      const fetchMapData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/tables/map/${id}`);
          const data = await response.json();
          
          if (data.success && data.record) {
            const mapData = data.record;
            
            // Set map details
            setMapTitle(mapData.title);
            setMapDescription(mapData.description || '');
            
            // Set map position from saved data
            if (mapData.map_data) {
              setMapPosition({
                lat: mapData.map_data.lat || 20,
                lng: mapData.map_data.lng || 0,
                zoom: mapData.map_data.zoom || 2
              });
            }
            
            // Set highlighted country if available
            if (mapData.country) {
              setHighlightedCountry(mapData.country);
            }
            
            // Set map code
            if (mapData.map_codes && mapData.map_codes.length > 0) {
              setMapCode(mapData.map_codes[0]);
            }
          } else {
            setError('Map not found');
          }
        } catch (err) {
          setError('Error loading map data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchMapData();
    } else {
      setLoading(false);
    }
  }, [id]);

  // Handle search results from the sidebar
  const handleSearch = (lat: number, lng: number, zoom: number, cities?: CityMarker[], countryName?: string) => {
    setMapPosition({ lat, lng, zoom });
    if (cities) setCityMarkers(cities);
    setHighlightedCountry(countryName);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <WorldMap 
        lat={mapPosition.lat} 
        lng={mapPosition.lng} 
        zoom={mapPosition.zoom}
        cityMarkers={cityMarkers}
        highlightedCountry={highlightedCountry}
      />
      <CountrySidebar onSearch={handleSearch} />
    </div>
  );
};

export default MapPageWithSidebar;