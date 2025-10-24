import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './UserMaps.css';

interface Map {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

const UserMaps: React.FC = () => {
  const [maps, setMaps] = useState<Map[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulated data - in a real app, this would fetch from your API
    const sampleMaps = [
      { id: 1, title: 'My Europe Trip', description: 'Places I want to visit in Europe', createdAt: '2025-09-15' },
      { id: 2, title: 'Favorite Locations', description: 'My favorite places around the world', createdAt: '2025-09-20' },
      { id: 3, title: 'Business Trip', description: 'Locations for the upcoming business trip', createdAt: '2025-10-01' },
    ];
    
    // Simulate API call
    setTimeout(() => {
      setMaps(sampleMaps);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="user-maps-container">
      <div className="maps-header">
        <h1>My Maps</h1>
        <Link to="/create-map" className="create-map-button">Create New Map</Link>
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
              <div key={map.id} className="map-card">
                <h3>{map.title}</h3>
                <p className="map-description">{map.description}</p>
                <div className="map-footer">
                  <span className="map-date">Created: {map.createdAt}</span>
                  <div className="map-actions">
                    <Link to={`/view-map/${map.id}`} className="view-map-button">View</Link>
                    <Link to={`/edit-map/${map.id}`} className="edit-map-button">Edit</Link>
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