import React, { useState } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import AppNavBar from '../components/AppNavBar';
import WorldMap from '../components/WorldMap';
import CountrySidebar from '../components/CountrySidebar';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import type { Zone } from '../types/zones';

// Map page component for creating new maps

const CreateMapPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Get map title and description from session storage
  const [mapTitle, setMapTitle] = useState(() => 
    sessionStorage.getItem('new_map_title') || ''
  );
  const [mapDescription, setMapDescription] = useState(() => 
    sessionStorage.getItem('new_map_description') || ''
  );
  const [error, setError] = useState('');
  const [mapId, setMapId] = useState<number | null>(null);
  const [mapCode, setMapCode] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingZones, setPendingZones] = useState<Zone[]>([]);
  // Add state for map position
  const [mapPosition, setMapPosition] = useState({
    lat: 20,
    lng: 0,
    zoom: 2
  });
  const [highlightedCountry, setHighlightedCountry] = useState<string | undefined>(undefined);

  // Auto-save function that can be called from navigation
  const handleAutoSave = async (): Promise<void> => {
    if (!hasUnsavedChanges || !mapTitle.trim()) {
      return; // Nothing to save or no title
    }
    
    try {
      await handleSave();
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
      throw error; // Re-throw so navigation can handle it
    }
  };

  const handleSave = async () => {
    if (!mapTitle.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!user || !user.customer_id) {
      console.error('User or customer_id is missing:', user);
      setError('You must be logged in with a valid account to save maps');
      return;
    }
    
    console.log('Current user data:', user);
    // Get existing mapId from session storage if available - for map editing
    const existingMapId = sessionStorage.getItem('editing_map_id');
    const isEditing = Boolean(existingMapId);
    console.log(`Map operation: ${isEditing ? 'UPDATING' : 'CREATING'} map ${isEditing ? existingMapId : ''}`);
    setError('');
    
    try {
      // First, check if the database is available
      try {
        console.log('🔍 Checking database connection...');
        
        const API_ENDPOINT = '/api/db/status';
        
        try {
          console.log(`Checking database connection at: ${API_ENDPOINT}`);
          const dbCheckResponse = await fetch(API_ENDPOINT, {
            method: 'GET'
          });
          
          const responseData = await dbCheckResponse.json();
          console.log('Database status response:', responseData);
          
          if (dbCheckResponse.ok) {
            console.log('✅ Database connection confirmed');
          } else {
            console.warn('⚠️ Database connection check returned error, but will try to save anyway');
          }
        } catch (endpointError) {
          console.warn(`⚠️ Could not connect to ${API_ENDPOINT}:`, endpointError);
          console.warn('⚠️ Will try to save map anyway');
        }
      } catch (dbCheckError) {
        console.warn('⚠️ Could not verify database connection:', dbCheckError);
      }
      
      // Generate a unique map code
      const generatedMapCode = generateMapCode();
      setMapCode(generatedMapCode);

      // Prepare map data for saving
      const mapData = {
        title: mapTitle,
        description: mapDescription,
        map_data: { 
          lat: mapPosition.lat, 
          lng: mapPosition.lng, 
          zoom: mapPosition.zoom 
        },
        map_bounds: { 
          center: [mapPosition.lat, mapPosition.lng], 
          zoom: mapPosition.zoom 
        },
        active: true,
        country: highlightedCountry || null,
        map_code: generatedMapCode,
        customer_id: user.customer_id
      };

      console.log('Saving map data:', mapData);
      
      // Try to save directly to the database using the DB API
      try {
        console.log('🔍 Attempting to save map directly to database...');
        
        // Debug info before starting API calls
        console.log('User data at save time:', user);
        console.log('Map data being saved:', mapData);
        
        // Choose endpoint based on whether we're editing an existing map
        const existingMapId = sessionStorage.getItem('editing_map_id');
        const isEditing = Boolean(existingMapId);
        
        const DB_API_ENDPOINT = isEditing 
          ? `/api/db/tables/map/${existingMapId}`
          : '/api/db/tables/map';
        
        try {
          console.log(`${isEditing ? 'Updating' : 'Creating'} map at endpoint: ${DB_API_ENDPOINT}`);
          const res = await fetch(DB_API_ENDPOINT, {
            method: isEditing ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mapData)
          });
          
          console.log(`Save response status: ${res.status}`);
          const data = await res.json();
          console.log('Save response data:', data);
          
          if (data.success) {
            // Clear session storage since we've successfully saved
            // Clear all related session storage items
            sessionStorage.removeItem('new_map_title');
            sessionStorage.removeItem('new_map_description');
            sessionStorage.removeItem('editing_map_id');
            
            const createdMapId = data.record?.map_id;
            setMapId(createdMapId);
            
            // Save pending zones if any
            if (createdMapId && user.customer_id) {
              await savePendingZones(createdMapId, user.customer_id);
            }
            
            setError(`Map ${isEditing ? 'updated' : 'saved'} successfully with code: ${generatedMapCode}`);
            setHasUnsavedChanges(false);
            
            // Redirect to dashboard immediately without showing alert
            navigate('/dashboard');
            return;
          } else {
            console.error('❌ Direct database save failed:', data.error || 'Unknown error');
            setError('Could not save map directly to database. Trying alternate method...');
          }
        } catch (endpointError) {
          console.error(`❌ Error saving to ${DB_API_ENDPOINT}:`, endpointError);
          setError('Could not save map directly to database. Trying alternate method...');
        }
      } catch (directSaveError) {
        console.error('❌ Error in direct database save process:', directSaveError);
        // Continue with fallback method if direct save fails
      }
      
      // Save map to the configured endpoint using Vite proxy
      const existingMapId = sessionStorage.getItem('editing_map_id');
      const isEditing = Boolean(existingMapId);
      
      const API_URL = isEditing 
        ? `/api/map/${existingMapId}`
        : '/api/map';
      
      let success = false;
      let responseData = null;
      
      try {
        console.log(`${isEditing ? 'Updating' : 'Creating'} map via: ${API_URL}`);
        const res = await fetch(API_URL, {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mapData)
        });
        
        console.log('Save response status:', res.status);
        const data = await res.json();
        
        if (data.success) {
          success = true;
          responseData = data;
          console.log('✅ Map saved successfully to database');
        } else {
          console.error('❌ Error saving map:', data.error || 'Unknown error');
        }
      } catch (err) {
        console.error(`❌ Error saving map to ${API_URL}:`, err);
      }
      
      // After trying all fallback URLs, handle the result
      if (success && responseData) {
        // Clear session storage since we've successfully saved
        sessionStorage.removeItem('new_map_title');
        sessionStorage.removeItem('new_map_description');
        
        // Clear all related session storage items
        sessionStorage.removeItem('new_map_title');
        sessionStorage.removeItem('new_map_description');
        sessionStorage.removeItem('editing_map_id');
        
        const createdMapId = responseData.record?.map_id;
        setMapId(createdMapId);
        
        // Save pending zones if any
        if (createdMapId && user.customer_id) {
          await savePendingZones(createdMapId, user.customer_id);
        }
        
        setError(`Map ${isEditing ? 'updated' : 'saved'} with code: ${generatedMapCode}`);
        setHasUnsavedChanges(false);
        
        // Redirect to dashboard immediately
        navigate('/dashboard');
      } else {
        setError('Failed to create map. Please try again.');
      }
    } catch (error) {
      setError('Error creating map');
      console.error(error);
    }
  };

  // Handle zones created when no mapId exists yet
  const handleZoneCreated = useCallback((zone: Zone) => {
    console.log('🎯 Zone created, storing temporarily until map is saved:', zone);
    setPendingZones(prev => [...prev, zone]);
    setHasUnsavedChanges(true);
  }, []);

  // Function to save all pending zones to database after map is created
  const savePendingZones = async (createdMapId: number, customerId: number) => {
    if (pendingZones.length === 0) return;
    
    console.log(`💾 Saving ${pendingZones.length} pending zones to map ${createdMapId}...`);
    
    for (const zone of pendingZones) {
      try {
        const response = await fetch('/api/db/tables/zones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: zone.id,
            map_id: createdMapId,
            customer_id: customerId,
            name: zone.name,
            color: zone.color,
            coordinates: JSON.stringify(zone.coordinates)
          })
        });
        
        const result = await response.json();
        if (result.success) {
          console.log(`✅ Zone "${zone.name}" saved successfully`);
        } else {
          console.error(`❌ Failed to save zone "${zone.name}":`, result.error);
        }
      } catch (err) {
        console.error(`❌ Error saving zone "${zone.name}":`, err);
      }
    }
    
    // Clear pending zones after saving
    setPendingZones([]);
  };

  // Generate a unique map code
  const generateMapCode = (): string => {
    // Create a code with pattern: MAP-XXXX-XXXX where X is alphanumeric
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'MAP-';
    
    // Generate first part
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    result += '-';
    
    // Generate second part
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  };

  // Enhanced search handler function for the sidebar with direct map controls
  const handleSearch = (lat: number, lng: number, zoom: number, countryName?: string) => {
    console.log('Search params received:', { lat, lng, zoom, countryName });
    
    // Ensure we have valid coordinates
    if (isNaN(lat) || isNaN(lng) || isNaN(zoom)) {
      console.error('Invalid coordinates received:', { lat, lng, zoom });
      return;
    }
    
    // Comprehensive country size categorization for appropriate zoom levels
    let adjustedZoom;
    if (countryName) {
      const countryZoomLevels: Record<string, number> = {
        'Lebanon': 8,
        'Israel': 8,
        'Palestine': 9,
        'Cyprus': 8,
        'Kuwait': 8,
        'Qatar': 8,
        'Bahrain': 9,
        'Singapore': 11,
        'Luxembourg': 9,
        'Montenegro': 8,
        'United Kingdom': 6,
        'Italy': 6,
        'Greece': 6,
        'Romania': 6,
        'Syria': 7,
        'Jordan': 7,
        'United Arab Emirates': 7,
        'Mexico': 5,
        'Indonesia': 5,
        'Saudi Arabia': 5,
        'Iran': 5,
        'Mongolia': 5,
        'Peru': 5,
        'Egypt': 6,
        'Turkey': 5,
        'India': 4,
        'Argentina': 4,
        'Kazakhstan': 4,
        'Algeria': 4,
        'Canada': 3,
        'United States': 3,
        'China': 3,
        'Brazil': 3,
        'Australia': 3,
        'Russia': 2
      };
      adjustedZoom = countryZoomLevels[countryName] || 6;
    } else {
      adjustedZoom = Math.max(zoom, 11);
    }
    if (zoom > adjustedZoom) {
      adjustedZoom = zoom;
    }
    setMapPosition({ lat, lng, zoom: adjustedZoom });
    // No longer setting city markers
    setHighlightedCountry(countryName || undefined);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw', 
      background: '#f7f9fc', 
      position: 'relative', 
      color: '#000', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' 
    }}>
      <AppNavBar onSaveMap={handleAutoSave} />
      <div style={{ 
        width: '100%', 
        maxWidth: 700, 
        margin: '0 auto', 
        background: '#fff', 
        borderRadius: '16px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', 
        padding: '40px', 
        marginTop: '80px', 
        marginBottom: '32px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center' 
      }}>
        <h2 style={{ 
          marginBottom: '36px', 
          color: '#000', 
          fontWeight: 700, 
          fontSize: '28px',
          textAlign: 'center'
        }}>
          Map Details
        </h2>
        
        <div style={{ width: '100%', marginBottom: '24px' }}>
          <label style={{ 
            fontWeight: '600', 
            marginBottom: '10px', 
            display: 'block', 
            fontSize: '15px', 
            color: '#2d3748'
          }}>
            Map Title
          </label>
          <div style={{ 
            fontSize: '16px', 
            padding: '14px 16px', 
            borderRadius: '10px', 
            border: '1px solid #e2e8f0', 
            background: '#f8fafc',
            color: '#000',
            marginBottom: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}>
            {mapTitle}
          </div>
          <button 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#4f8cff', 
              cursor: 'pointer',
              padding: '8px 0',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onClick={() => {
              const newTitle = prompt('Edit map title:', mapTitle);
              if (newTitle !== null) {
                setMapTitle(newTitle);
                setHasUnsavedChanges(true);
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit Title
          </button>
        </div>
        
        <div style={{ width: '100%', marginBottom: '28px' }}>
          <label style={{ 
            fontWeight: '600', 
            marginBottom: '10px', 
            display: 'block', 
            fontSize: '15px', 
            color: '#2d3748'
          }}>
            Map Description
          </label>
          <div style={{ 
            fontSize: '16px', 
            padding: '14px 16px', 
            borderRadius: '10px', 
            border: '1px solid #e2e8f0', 
            background: '#f8fafc',
            color: '#000',
            marginBottom: '10px',
            minHeight: '90px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            lineHeight: '1.5'
          }}>
            {mapDescription || <em style={{ color: '#94a3b8' }}>No description provided</em>}
          </div>
          <button 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#4f8cff', 
              cursor: 'pointer',
              padding: '8px 0',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onClick={() => {
              const newDescription = prompt('Edit map description:', mapDescription);
              if (newDescription !== null) {
                setMapDescription(newDescription);
                setHasUnsavedChanges(true);
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit Description
          </button>
        </div>
        <div style={{ width: '100%', marginBottom: '28px' }}>
          <div style={{ 
            marginBottom: '16px',
            background: '#f8fafc', 
            padding: '14px 16px', 
            borderRadius: '10px', 
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <span style={{ 
              fontSize: '15px', 
              color: '#2d3748', 
              fontWeight: 600,
              display: 'block',
              marginBottom: '8px'
            }}>
              Current Map Center:
            </span>
            <div style={{ 
              fontSize: '16px', 
              color: '#000',
              fontFamily: 'monospace',
              background: '#edf2f7',
              display: 'inline-block',
              padding: '6px 10px',
              borderRadius: '6px'
            }}>
              Lat: {mapPosition.lat.toFixed(4)}, Lng: {mapPosition.lng.toFixed(4)}
            </div>
          </div>
          
          {mapCode && (
            <div style={{ 
              marginBottom: '16px', 
              padding: '16px', 
              backgroundColor: '#ebf5ff', 
              borderRadius: '10px', 
              border: '1px solid #bcdaff',
              boxShadow: '0 2px 4px rgba(79,140,255,0.06)'
            }}>
              <span style={{ 
                fontSize: '15px', 
                color: '#2d3748', 
                fontWeight: 600,
                display: 'block',
                marginBottom: '8px'
              }}>
                Map Code:
              </span>
              <div style={{ 
                fontSize: '18px', 
                color: '#000', 
                fontWeight: 600,
                fontFamily: 'monospace',
                letterSpacing: '0.5px'
              }}>
                {mapCode}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#4a5568', 
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px' 
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 8v4"></path>
                  <path d="M12 16h.01"></path>
                </svg>
                Use this code to access your map later
              </div>
            </div>
          )}
        </div>
        <button
          style={{ 
            width: '100%', 
            padding: '16px', 
            fontSize: '16px', 
            background: '#4f8cff', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '12px', 
            cursor: 'pointer', 
            fontWeight: 600, 
            boxShadow: '0 4px 12px rgba(79,140,255,0.25)', 
            marginBottom: '12px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onClick={handleSave}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          Save Map
        </button>
        
        {error && 
          <div style={{ 
            color: mapId ? '#047857' : '#e53e3e', 
            marginTop: '16px', 
            fontWeight: 500,
            padding: '12px 16px',
            background: mapId ? '#ecfdf5' : '#fef2f2',
            borderRadius: '8px',
            border: `1px solid ${mapId ? '#a7f3d0' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {mapId ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            )}
            {error}
          </div>
        }
      </div>
      {/* Use a full-screen map container */}
      <div style={{ 
        position: 'fixed',
        top: '56px', /* Match NAVBAR_HEIGHT */
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        zIndex: 10
      }}>
        <WorldMap 
          lat={mapPosition.lat} 
          lng={mapPosition.lng} 
          zoom={mapPosition.zoom} 
          highlightedCountry={highlightedCountry}
          onZoneCreated={handleZoneCreated}
        />
        <CountrySidebar 
          onSearch={handleSearch} 
          showMaps={false} 
          onSaveMap={handleSave}
          currentMapData={{
            title: mapTitle,
            description: mapDescription,
            position: mapPosition
          }}
        />
      </div>
      <style>{`
        /* General responsive styles for the map details section */
        @media (max-width: 900px) {
          div[style*='maxWidth: 700'] {
            padding: 24px 16px !important;
            margin-top: 60px !important;
            width: 94% !important;
            border-radius: 12px !important;
            max-width: 90% !important;
          }
          h2 {
            font-size: 22px !important;
          }
          button[style*='padding: 16px'] {
            padding: 14px !important;
          }
          
          /* Ensure the map window is properly sized */
          div[style*='position: fixed'] {
            top: 50px !important;
          }
        }
        
        @media (max-width: 768px) {
          div[style*='maxWidth: 700'] {
            padding: 20px 16px !important;
            margin-top: 40px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
          }
          
          /* Map position adjustments */
          .leaflet-container {
            height: calc(100vh - 50px) !important;
          }
          
          /* Adjust sidebar for better mobile experience */
          .country-sidebar {
            width: 280px !important;
          }
          
          .country-sidebar.closed {
            transform: translateX(calc(100% - 36px)) !important;
          }
        }
        
        @media (max-width: 480px) {
          div[style*='maxWidth: 700'] {
            padding: 16px 12px !important;
            width: calc(100% - 24px) !important;
            margin-top: 30px !important;
          }
          
          div[style*='padding: 14px 16px'] {
            padding: 12px 10px !important;
          }
          
          .save-button-text {
            font-size: 15px !important;
          }
          
          /* Make sidebar take up more space on small screens */
          .country-sidebar {
            width: 85% !important;
          }
          
          /* Improve form spacing */
          div[style*='marginBottom: 28px'],
          div[style*='marginBottom: 24px'] {
            margin-bottom: 16px !important;
          }
        }
        
        /* Style adjustments for the sidebar in create-map page */
        .country-sidebar {
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          z-index: 1000;
          box-shadow: -2px 0 15px rgba(0,0,0,0.08);
          background-color: white;
          color: #000;
        }
        
        /* Make search button more prominent */
        .search-button {
          background-color: #4f8cff !important;
          color: white !important;
          font-weight: 600 !important;
          border-radius: 8px !important;
        }
        
        /* Button hover effects */
        button:hover {
          opacity: 0.95;
          transform: translateY(-1px);
        }
        
        button:active {
          transform: translateY(0);
        }
        
        /* Ensure map container is visible */
        .leaflet-container {
          z-index: 1;
          height: 100% !important;
          width: 100% !important;
        }
        
        /* Ensure all text in forms is black */
        input, textarea, label, div, p, span, h1, h2, h3, h4, h5, h6 {
          color: #000;
        }
        
        /* Current map center section */
        .coordinates-display, .coordinates-label, .coordinates-value {
          color: #000 !important;
        }
        
        /* Placeholders */
        ::placeholder {
          color: #94a3b8 !important;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

export default function CreateMapPageWithBoundary() {
  return (
    <ErrorBoundary>
      <CreateMapPage />
    </ErrorBoundary>
  );
}
