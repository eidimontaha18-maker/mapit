import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import WorldMap from '../components/WorldMap';
import CountrySidebar from '../components/CountrySidebar';
import AppNavBar from '../components/AppNavBar';

// MapPageWithSidebar component to display a map with sidebar for navigation


const MapPageWithSidebar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [mapPosition, setMapPosition] = useState({
    lat: 20,
    lng: 0,
    zoom: 2
  });
  // We no longer need cityMarkers as WorldMap component was updated
  const [highlightedCountry, setHighlightedCountry] = useState<string | undefined>(undefined);
  const [zones, setZones] = useState<Array<{id: string; name: string; color: string; coordinates: [number, number][];}>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [mapData, setMapData] = useState<{title: string; description: string; map_code: string; map_id: number} | null>(null);
  
  // Check if we're in edit mode
  const isEditMode = location.pathname.startsWith('/edit-map/');
  
  // Save function for edit mode
  const handleSaveMap = async (): Promise<void> => {
    if (!isEditMode || !id || !mapData) {
      console.log('Cannot save: not in edit mode, no ID, or no map data');
      return;
    }
    
    try {
      console.log('💾 Saving map changes...');
      
      const updateData = {
        title: mapData.title,
        description: mapData.description,
        map_data: {
          lat: mapPosition.lat,
          lng: mapPosition.lng,
          zoom: mapPosition.zoom
        },
        country: highlightedCountry || null,
        active: true
      };
      
      const response = await fetch(`/api/map/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Map saved successfully');
        setHasUnsavedChanges(false);
        alert('Map saved successfully!');
      } else {
        console.error('❌ Failed to save map:', result.error);
        alert('Failed to save map: ' + result.error);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      alert('Error saving map. Please try again.');
      throw error;
    }
  };
  
  // Auto-save function for navbar
  const handleAutoSave = async (): Promise<void> => {
    if (!isEditMode || !hasUnsavedChanges) {
      return;
    }
    await handleSaveMap();
  };
  
  // Load map data if ID is provided
  useEffect(() => {
    if (id) {
      const fetchMapData = async () => {
        try {
          setLoading(true);
          console.log(`Loading map data for ID: ${id}`);
          
          // Use the correct API endpoint
          const response = await fetch(`/api/map/${id}`);
          const data = await response.json();
          
          console.log('Map data response:', data);
          
          if (data.success && data.map) {
            const fetchedMap = data.map;
            
            // Store the full map data (including title, description, map_code)
            setMapData({
              title: fetchedMap.title || '',
              description: fetchedMap.description || '',
              map_code: fetchedMap.map_code || '',
              map_id: fetchedMap.map_id
            });
            
            // Set map position from saved data
            if (fetchedMap.map_data) {
              setMapPosition({
                lat: fetchedMap.map_data.lat || 20,
                lng: fetchedMap.map_data.lng || 0,
                zoom: fetchedMap.map_data.zoom || 2
              });
            }
            
            // Set highlighted country if available
            if (fetchedMap.country) {
              setHighlightedCountry(fetchedMap.country);
            }
            
            // Load zones for this map
            try {
              const zonesResponse = await fetch(`/api/map/${id}/zones`);
              const zonesData = await zonesResponse.json();
              
              if (zonesData.success && Array.isArray(zonesData.zones)) {
                console.log('Loaded zones:', zonesData.zones);
                setZones(zonesData.zones);
              } else {
                console.log('No zones found for this map');
                setZones([]);
              }
            } catch (zoneError) {
              console.error('Error loading zones:', zoneError);
              setZones([]);
            }
          } else {
            setError(data.error || 'Map not found');
          }
        } catch (err) {
          console.error('Error loading map data:', err);
          setError('Error loading map data');
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
    if (isEditMode) {
      setHasUnsavedChanges(true);
    }
  };
  
  // Track zone changes
  const handleZoneChange = () => {
    if (isEditMode) {
      setHasUnsavedChanges(true);
      console.log('⚠️  Map has unsaved changes');
    }
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
      bottom: 20px;
      left: 10px;
      width: 280px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      z-index: 500;
      color: #000;
      backdrop-filter: blur(5px);
    }

    .map-info-overlay h3 {
      margin-top: 0;
      margin-bottom: 8px;
      color: #000;
    }

    .map-info-overlay p {
      margin: 0 0 10px;
      color: #555;
      font-size: 14px;
    }

    .map-code-display {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .map-code-label {
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
    }

    .map-code-value {
      font-family: 'Courier New', monospace;
      font-size: 13px;
      padding: 4px 8px;
      background: #f5f5f5;
      border-radius: 4px;
      color: #333;
      border: 1px solid #ddd;
    }
  `;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <AppNavBar onSaveMap={isEditMode ? handleAutoSave : undefined} />
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
            initialZones={zones}
            mapId={id ? parseInt(id) : undefined}
            onZoneCreated={handleZoneChange}
            onZoneDeleted={handleZoneChange}
            onZoneUpdated={handleZoneChange}
          />
          
          {/* Map Info Overlay showing title, description, and map code */}
          {mapData && (
            <div className="map-info-overlay">
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                {mapData.title}
              </h3>
              {mapData.description && (
                <p style={{ fontSize: '13px', marginBottom: '10px', color: '#666' }}>
                  {mapData.description}
                </p>
              )}
              <div className="map-code-display">
                <span className="map-code-label">Map Code</span>
                <span className="map-code-value">{mapData.map_code}</span>
              </div>
              
              {isEditMode && (
                <button
                  onClick={handleSaveMap}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: '10px',
                    background: hasUnsavedChanges ? '#4f8cff' : '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  disabled={!hasUnsavedChanges}
                >
                  {hasUnsavedChanges ? '💾 Save Changes' : '✅ No Changes to Save'}
                </button>
              )}
              
              <div style={{ 
                marginTop: '10px', 
                fontSize: '12px', 
                color: '#888',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ 
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: zones.length > 0 ? '#4caf50' : '#e0e0e0'
                }}></span>
                {zones.length} zone{zones.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </>
      )}
      <CountrySidebar onSearch={handleSearch} showMaps={false} />
    </div>
  );
};

export default MapPageWithSidebar;