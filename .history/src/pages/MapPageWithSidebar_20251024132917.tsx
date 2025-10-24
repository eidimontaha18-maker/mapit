import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import WorldMap from '../components/WorldMap';
import CountrySidebar from '../components/CountrySidebar';
import AppNavBar from '../components/AppNavBar';
import { notification } from '../utils/notification';
import { useAuth } from '../hooks/useAuth';

// MapPageWithSidebar component to display a map with sidebar for navigation


const MapPageWithSidebar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
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
  
  // Detect viewing mode
  const isLoggedIn = !!user?.customer_id;
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const isViewMode = location.pathname.startsWith('/view-map/');
  const isEditMode = location.pathname.startsWith('/edit-map/') && isLoggedIn && !isAdmin;
  const isPublicView = isViewMode && !isLoggedIn; // Public sharing mode
  
  // Save function for edit mode (stable identity)
  const handleSaveMap = React.useCallback(async (): Promise<void> => {
    if (!isEditMode || !id || !mapData) {
      console.log('Cannot save: not in edit mode, no ID, or no map data');
      return;
    }

    if (!user?.customer_id) {
      console.error('Cannot save: no customer_id available');
      notification.error('Session error. Please log in again.');
      return;
    }
    
    try {
      console.log('💾 Saving map changes...');
      
      const updateData = {
        title: mapData.title,
        description: mapData.description,
        customer_id: user.customer_id,
        map_id: mapData.map_id,
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
        notification.success('Map saved successfully! Returning to dashboard...', { duration: 2000 });
        
        // Redirect to dashboard after 500ms
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      } else {
        console.error('❌ Failed to save map:', result.error);
        notification.error('Failed to save map: ' + result.error);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      notification.error('Error saving map. Please try again.');
      throw error;
    }
  }, [isEditMode, id, mapData, mapPosition, highlightedCountry, navigate, user?.customer_id]);
  
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

  // Handle zone click - zoom to zone (for admin viewing)
  const handleZoneClick = (zone: {id: string; name: string; color: string; coordinates: [number, number][];}) => {
    if (zone.coordinates && zone.coordinates.length > 0) {
      // Calculate center of the zone
      const lats = zone.coordinates.map(coord => coord[0]);
      const lngs = zone.coordinates.map(coord => coord[1]);
      const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
      const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
      
      // Zoom to zone center
      setMapPosition({ lat: centerLat, lng: centerLng, zoom: 13 });
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

    /* Admin zones panel */
    .admin-zones-panel {
      position: fixed;
      top: 76px;
      right: 20px;
      width: 280px;
      max-height: calc(100vh - 96px);
      background: rgba(255, 255, 255, 0.98);
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 600;
      overflow: hidden;
      backdrop-filter: blur(10px);
    }

    .admin-zones-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px;
      font-weight: 700;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .admin-zones-list {
      max-height: calc(100vh - 180px);
      overflow-y: auto;
      padding: 12px;
    }

    .admin-zone-item {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .admin-zone-item:hover {
      border-color: #667eea;
      transform: translateX(-4px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
    }

    .admin-zone-color {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .admin-zone-info {
      flex: 1;
      min-width: 0;
    }

    .admin-zone-name {
      font-weight: 600;
      font-size: 14px;
      color: #1a202c;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .admin-zone-id {
      font-size: 11px;
      color: #718096;
      font-family: 'Courier New', monospace;
    }

    .admin-zones-empty {
      text-align: center;
      padding: 40px 20px;
      color: #a0aec0;
    }

    .admin-zones-empty svg {
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    /* Scrollbar styling for zones list */
    .admin-zones-list::-webkit-scrollbar {
      width: 6px;
    }

    .admin-zones-list::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }

    .admin-zones-list::-webkit-scrollbar-thumb {
      background: #667eea;
      border-radius: 10px;
    }

    .admin-zones-list::-webkit-scrollbar-thumb:hover {
      background: #5568d3;
    }
  `;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <AppNavBar onSaveMap={isEditMode ? handleAutoSave : undefined} isAdminViewing={isAdmin} />
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
            isViewOnly={isAdmin}
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
      
      {/* Admin Zones Panel - show list of zones for admin to view and zoom to */}
      {isAdmin && zones.length > 0 && (
        <div className="admin-zones-panel">
          <div className="admin-zones-header">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Zones ({zones.length})
          </div>
          <div className="admin-zones-list">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="admin-zone-item"
                onClick={() => handleZoneClick(zone)}
                title="Click to zoom to this zone"
              >
                <div
                  className="admin-zone-color"
                  style={{ backgroundColor: zone.color }}
                ></div>
                <div className="admin-zone-info">
                  <div className="admin-zone-name">{zone.name}</div>
                  <div className="admin-zone-id">ID: {zone.id.substring(0, 8)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin empty zones message */}
      {isAdmin && zones.length === 0 && !loading && (
        <div className="admin-zones-panel">
          <div className="admin-zones-header">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Zones (0)
          </div>
          <div className="admin-zones-empty">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p>No zones in this map</p>
          </div>
        </div>
      )}
      
      {/* Country Sidebar - hide for admin users (view-only mode) */}
      {!isAdmin && <CountrySidebar onSearch={handleSearch} showMaps={false} />}
    </div>
  );
};

export default MapPageWithSidebar;