import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './UserMaps.css';
import './map-code-styles.css';

interface Map {
  map_id: number;
  title: string;
  description: string;
  created_at: string;
  map_data: {
    lat: number;
    lng: number;
    zoom: number;
  };
  map_bounds: {
    center: [number, number];
    zoom: number;
  };
  active: boolean;
  country: string | null;
  map_code: string;
}

const UserMaps: React.FC = () => {
  const [maps, setMaps] = useState<Map[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
  const response = await fetch('http://localhost:3000/api/db/tables/map?orderBy=created_at DESC');
        const data = await response.json();
        
        if (data.success) {
          setMaps(data.records);
        } else {
          setError('Failed to fetch maps: ' + data.error);
        }
      } catch (err) {
        setError('Error connecting to server');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaps();
  }, []);
  
  // State for map code input
  const [mapCode, setMapCode] = useState('');
  
  // Function to navigate to a map by code
  const handleMapCodeSearch = () => {
    if (!mapCode.trim()) {
      setError('Please enter a map code');
      return;
    }
    
    // Find the map with the given code
    const foundMap = maps.find(map => 
      map.map_codes && map.map_codes.includes(mapCode.trim().toUpperCase())
    );
    
    if (foundMap) {
      window.location.href = `/view-map/${foundMap.map_id}`;
    } else {
      setError('Map not found with the given code');
    }
  };

  return (
    <div className="user-maps-container">
      <div className="maps-header">
        <h1>My Maps</h1>
        <Link to="/create-map" className="create-map-button">Create New Map</Link>
      </div>
      
      <div className="map-code-search">
        <h3>Open Map by Code</h3>
        <div className="search-container">
          <input
            type="text"
            value={mapCode}
            onChange={(e) => setMapCode(e.target.value)}
            placeholder="Enter map code (e.g., MAP-ABCD-1234)"
            className="map-code-input"
          />
          <button onClick={handleMapCodeSearch} className="map-code-button">
            Open Map
          </button>
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>

      {loading ? (
        <div className="loading-indicator">Loading your maps...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="maps-grid">
          {maps.length === 0 ? (
            <div className="no-maps-message">
              <p>You haven't created any maps yet.</p>
              <Link to="/create-map" className="create-first-map">Create your first map</Link>
            </div>
          ) : (
            maps.map(map => (
              <div key={map.map_id} className="map-card">
                <h3>{map.title}</h3>
                <p className="map-description">{map.description || 'No description'}</p>
                {map.map_codes && map.map_codes.length > 0 && (
                  <div className="map-code-display">
                    <span className="map-code-label">Map Code:</span>
                    <span className="map-code-value">{map.map_codes[0]}</span>
                  </div>
                )}
                <div className="map-location">
                  <span className="location-label">Location:</span>
                  <span className="location-value">{map.country || 'Unknown'}</span>
                </div>
                <div className="map-footer">
                  <span className="map-date">Created: {new Date(map.created_at).toLocaleDateString()}</span>
                  <div className="map-actions">
                    <Link to={`/view-map/${map.map_id}`} className="view-map-button">View</Link>
                    <Link to={`/edit-map/${map.map_id}`} className="edit-map-button">Edit</Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserMaps;