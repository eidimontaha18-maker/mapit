import React, { useState } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import AppNavBar from '../components/AppNavBar';
import WorldMap from '../components/WorldMap';
import CountrySidebar from '../components/CountrySidebar';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

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
  // Add state for map position
  const [mapPosition, setMapPosition] = useState({
    lat: 20,
    lng: 0,
    zoom: 2
  });
  const [highlightedCountry, setHighlightedCountry] = useState<string | undefined>(undefined);

  const handleSave = async () => {
    if (!mapTitle.trim()) {
      setError('Title is required');
      return;
    }
    setError('');
    try {
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
        map_codes: [generatedMapCode],
        customer_id: user?.customer_id
      };

      console.log('Saving map data:', mapData);
      
      // Try multiple API endpoints to ensure connection works
      const API_URLS = ['http://127.0.0.1:3101/api/map', 'http://localhost:3101/api/map'];
      
      let success = false;
      let responseData = null;
      
      for (const url of API_URLS) {
        if (success) break; // Skip if we already had a successful request
        
        try {
          console.log(`Trying to save map via ${url}`);
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mapData),
            signal: AbortSignal.timeout(3500) // Short timeout to try next URL if needed
          });
          
          console.log('Save response status:', res.status);
          const data = await res.json();
          
          if (data.success) {
            // Mark as successful so we don't try other URLs
            success = true;
            responseData = data;
          }
        } catch (err) {
          console.log(`Error trying ${url}:`, err);
          // Continue to the next URL
        }
      }
      
      // After trying all URLs, handle the result
      if (success && responseData) {
        // Clear session storage since we've successfully saved
        sessionStorage.removeItem('new_map_title');
        sessionStorage.removeItem('new_map_description');
        
        setMapId(responseData.record?.map_id);
        setError(`Map saved with code: ${generatedMapCode}`);
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError('Failed to create map. Please try again.');
      }
    } catch (error) {
      setError('Error creating map');
      console.error(error);
    }
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
      <AppNavBar />
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
        />
        <CountrySidebar onSearch={handleSearch} showMaps={false} />
      </div>
      <style>{`
        @media (max-width: 900px) {
          div[style*='maxWidth: 700'] {
            padding: 24px 16px !important;
            margin-top: 60px !important;
            width: 94% !important;
            border-radius: 12px !important;
          }
          h2 {
            font-size: 22px !important;
          }
          button[style*='padding: 16px'] {
            padding: 14px !important;
          }
        }
        
        @media (max-width: 480px) {
          div[style*='maxWidth: 700'] {
            padding: 20px 12px !important;
          }
          div[style*='padding: 14px 16px'] {
            padding: 12px !important;
          }
          .save-button-text {
            font-size: 15px !important;
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
