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
  const handleSearch = (lat: number, lng: number, zoom: number, countryName?: string) => {
    setMapPosition({ lat, lng, zoom });
    setHighlightedCountry(countryName);
  };

  // Add CSS for loading and info overlay
  const styles = `
    .loading-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: rgba(255, 255, 255, 0.9);
      z-index: 1000;
      color: #333;
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 5px solid #f3f3f3;
      border-top: 5px solid #4285F4;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 15px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-container {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      text-align: center;
      color: #d32f2f;
    }

    .map-info-overlay {
      position: fixed;
      top: 70px;
      left: 10px;
      width: 300px;
      padding: 15px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      z-index: 500;
      color: #000;
    }

    .map-info-overlay h3 {
      margin-top: 0;
      margin-bottom: 8px;
      color: #000;
    }

    .map-info-overlay p {
      margin: 0 0 10px;
      color: #555;
    }
  `;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <style>{styles}</style>
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading map...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <WorldMap 
            lat={mapPosition.lat} 
            lng={mapPosition.lng} 
            zoom={mapPosition.zoom}
            highlightedCountry={highlightedCountry}
          />
          {id && mapCode && (
            <div className="map-info-overlay">
              <h3>{mapTitle}</h3>
              {mapDescription && <p>{mapDescription}</p>}
              <div className="map-code-display">
                <span className="map-code-label">Map Code:</span>
                <span className="map-code-value">{mapCode}</span>
              </div>
            </div>
          )}
        </>
      )}
      <CountrySidebar onSearch={handleSearch} />
    </div>
  );
};

export default MapPageWithSidebar;