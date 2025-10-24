import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import WorldMap from '../components/WorldMap';
import CountrySidebar from '../components/CountrySidebar';
import AppNavBar from '../components/AppNavBar';

// MapPageWithSidebar component to display a map with sidebar for navigation


const MapPageWithSidebar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
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
  const [showMapInfo, setShowMapInfo] = useState(true);
  const [mapType, setMapType] = useState<'road' | 'satellite' | 'hybrid' | 'terrain'>('road');
  
  // Check if user is admin (view-only mode for admin)
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
  // Check if we're in edit mode (and not admin)
  const isEditMode = location.pathname.startsWith('/edit-map/') && !isAdmin;
  
  // Save function for edit mode (stable identity)
  const handleSaveMap = React.useCallback(async (): Promise<void> => {
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
        
        // Show success message and redirect to dashboard
        alert('Map saved successfully! Returning to dashboard...');
        
        // Redirect to dashboard after 500ms
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        console.error('❌ Failed to save map:', result.error);
        alert('Failed to save map: ' + result.error);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      alert('Error saving map. Please try again.');
      throw error;
    }
  }, [isEditMode, id, mapData, mapPosition, highlightedCountry, navigate]);
  
  // Auto-save function for navbar (stable identity)
  const handleAutoSave = React.useCallback(async (): Promise<void> => {
    if (!isEditMode || !hasUnsavedChanges) {
      return;
    }
    await handleSaveMap();
  }, [isEditMode, hasUnsavedChanges, handleSaveMap]);
  
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
      {/* Hide navbar for admin viewers */}
      {!isAdmin && <AppNavBar onSaveMap={isEditMode ? handleAutoSave : undefined} />}
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
            initialMapType={mapType}
            onMapTypeChange={setMapType}
          />
          
          {/* Map Info Overlay showing title, description, and map code */}
          {mapData && showMapInfo && (
            <div className="map-info-overlay">
              <button
                onClick={() => setShowMapInfo(false)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  color: '#666',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f0f0f0';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#666';
                }}
                title="Hide map info"
              >
                ✕
              </button>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', paddingRight: '30px' }}>
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
                <>
                  <button
                    onClick={handleSaveMap}
                    style={{
                      marginTop: '12px',
                      width: '100%',
                      padding: '10px',
                      background: hasUnsavedChanges ? '#4f8cff' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                      boxShadow: hasUnsavedChanges ? '0 2px 8px rgba(79,140,255,0.3)' : '0 2px 8px rgba(40,167,69,0.3)'
                    }}
                    disabled={!hasUnsavedChanges}
                  >
                    {hasUnsavedChanges ? '💾 Save & Return to Dashboard' : '✅ All Changes Saved'}
                  </button>
                  
                  <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                      marginTop: '8px',
                      width: '100%',
                      padding: '8px',
                      background: 'transparent',
                      color: '#4f8cff',
                      border: '1px solid #4f8cff',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '13px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#f0f4f9';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    ← Back to Dashboard
                  </button>
                </>
              )}
              
              {!isEditMode && (
                <button
                  onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/dashboard')}
                  style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: '10px',
                    background: isAdmin ? '#667eea' : '#4f8cff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    boxShadow: isAdmin ? '0 2px 8px rgba(102,126,234,0.3)' : '0 2px 8px rgba(79,140,255,0.3)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = isAdmin ? '#5568d3' : '#3a7dff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = isAdmin ? '#667eea' : '#4f8cff';
                  }}
                >
                  ← Back to {isAdmin ? 'Admin' : ''} Dashboard
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
          
          {/* Show Map Info Button (when hidden) */}
          {mapData && !showMapInfo && (
            <button
              onClick={() => setShowMapInfo(true)}
              style={{
                position: 'fixed',
                bottom: '20px',
                left: '10px',
                padding: '10px 16px',
                background: '#4f8cff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: '0 2px 10px rgba(79,140,255,0.3)',
                zIndex: 500,
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#3a7dff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,140,255,0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#4f8cff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(79,140,255,0.3)';
              }}
              title="Show map info"
            >
              ℹ️ Show Map Info
            </button>
          )}
        </>
      )}
      
      {/* Country Sidebar - has its own toggle button - Hide for admin */}
      {!isAdmin && <CountrySidebar onSearch={handleSearch} showMaps={false} />}
    </div>
  );
};

export default MapPageWithSidebar;