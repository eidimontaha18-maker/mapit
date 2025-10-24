import React, { useState } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import AppNavBar from '../components/AppNavBar';
import WorldMap from '../components/WorldMap';
import CountrySidebar from '../components/CountrySidebar';

// Map page component for creating new maps

const CreateMapPage: React.FC = () => {
  const [mapTitle, setMapTitle] = useState('');
  const [mapDescription, setMapDescription] = useState('');
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
        map_codes: [generatedMapCode]
      };

      console.log('Saving map data:', mapData);
      const res = await fetch('/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mapData)
      });
      console.log('Save response status:', res.status);
      const data = await res.json();
      if (data.success && data.record) {
        setMapId(data.record.map_id);
        setError(`Map saved with code: ${generatedMapCode}`);
      } else {
        setError(data.error || 'Failed to create map');
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
    <div style={{ minHeight: '100vh', width: '100vw', background: '#f5f5f5', position: 'relative', color: '#000' }}>
      <AppNavBar />
      <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: '18px', boxShadow: '0 4px 24px rgba(120,120,120,0.10)', padding: '40px 32px', marginTop: '32px', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ marginBottom: '32px', color: '#000', fontWeight: 700, fontSize: '2em' }}>Create New Map</h2>
        <input
          type="text"
          placeholder="Map Title"
          value={mapTitle}
          onChange={e => setMapTitle(e.target.value)}
          style={{ width: '100%', marginBottom: '18px', fontSize: '1.1em', padding: '10px', borderRadius: '6px', border: '1px solid #b6d0f7', boxShadow: '0 2px 8px #4f8cff11', color: '#000' }}
        />
        <textarea
          placeholder="Map Description"
          value={mapDescription}
          onChange={e => setMapDescription(e.target.value)}
          style={{ width: '100%', marginBottom: '18px', fontSize: '1em', padding: '10px', minHeight: '80px', borderRadius: '6px', border: '1px solid #b6d0f7', boxShadow: '0 2px 8px #4f8cff11', color: '#000' }}
        />
        <div style={{ width: '100%', marginBottom: '18px' }}>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '0.9em', color: '#000', fontWeight: 500 }}>Current Map Center:</span>
            <div style={{ fontSize: '1em', color: '#000' }}>
              Lat: {mapPosition.lat.toFixed(4)}, Lng: {mapPosition.lng.toFixed(4)}
            </div>
          </div>
          {mapCode && (
            <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '6px', border: '1px solid #b6d0f7' }}>
              <span style={{ fontSize: '0.9em', color: '#000', fontWeight: 500 }}>Map Code:</span>
              <div style={{ fontSize: '1.1em', color: '#000', fontWeight: 600 }}>{mapCode}</div>
              <div style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>Use this code to access your map later</div>
            </div>
          )}
        </div>
        <button
          style={{ width: '100%', padding: '14px', fontSize: '1.1em', background: '#4f8cff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 8px #4f8cff22', marginBottom: '8px' }}
          onClick={handleSave}
        >Save Map</button>
        {error && <div style={{ color: mapId ? 'green' : 'red', marginTop: '16px', fontWeight: 500 }}>{error}</div>}
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
        <CountrySidebar onSearch={handleSearch} />
      </div>
      <style>{`
        @media (max-width: 900px) {
          div[style*='maxWidth: 600'] {
            padding: 24px 8px !important;
          }
          h2 {
            font-size: 1.3em !important;
          }
        }
        
        /* Style adjustments for the sidebar in create-map page */
        .country-sidebar {
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          z-index: 1000;
          box-shadow: -2px 0 15px rgba(0,0,0,0.15);
          background-color: white;
          color: #000;
        }
        
        /* Make search button more prominent */
        .search-button {
          background-color: #4f8cff !important;
          color: white !important;
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
          color: #888 !important;
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
