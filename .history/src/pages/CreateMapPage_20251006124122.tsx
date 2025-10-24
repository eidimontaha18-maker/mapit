import React, { useState } from 'react';
import AppNavBar from '../components/AppNavBar';
import WorldMap from '../components/WorldMap';
import CountrySidebar from '../components/CountrySidebar';

// Define the CityMarker interface
interface CityMarker {
  name: string;
  lat: number;
  lng: number;
  country: string;
  isCapital?: boolean;
}

const CreateMapPage: React.FC = () => {
  const [mapTitle, setMapTitle] = useState('');
  const [mapDescription, setMapDescription] = useState('');
  const [error, setError] = useState('');
  const [mapId, setMapId] = useState<number | null>(null);
  // Add state for map position
  const [mapPosition, setMapPosition] = useState({
    lat: 20,
    lng: 0,
    zoom: 2
  });
  const [cityMarkers, setCityMarkers] = useState<CityMarker[]>([]);
  const [highlightedCountry, setHighlightedCountry] = useState<string | undefined>(undefined);

  const handleSave = async () => {
    if (!mapTitle.trim()) {
      setError('Title is required');
      return;
    }
    setError('');
    try {
      const res = await fetch('/api/tables/map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: mapTitle, description: mapDescription })
      });
      const data = await res.json();
      if (data.success && data.record) {
        setMapId(data.record.id);
        setError('Map saved!');
      } else {
        setError(data.error || 'Failed to create map');
      }
    } catch (error) {
      setError('Error creating map');
      console.error(error);
    }
  };

  // Enhanced search handler function for the sidebar with direct map controls
  const handleSearch = (lat: number, lng: number, zoom: number, cities?: CityMarker[], countryName?: string) => {
    console.log('Search params received:', { lat, lng, zoom, countryName, citiesCount: cities?.length });
    
    // Ensure we have valid coordinates
    if (isNaN(lat) || isNaN(lng) || isNaN(zoom)) {
      console.error('Invalid coordinates received:', { lat, lng, zoom });
      return;
    }
    
    // Comprehensive country size categorization for appropriate zoom levels
    let adjustedZoom;
    if (countryName) {
      // Countries grouped by size for appropriate zoom levels
      const extraLargeCountries = ['Russia'];
      const largeCountries = ['Canada', 'United States', 'China', 'Brazil', 'Australia'];
      const mediumLargeCountries = ['India', 'Argentina', 'Kazakhstan', 'Algeria'];
      const mediumCountries = ['Mexico', 'Indonesia', 'Saudi Arabia', 'Iran', 'Mongolia', 'Peru'];
      const smallMediumCountries = ['France', 'Ukraine', 'Spain', 'Sweden', 'Germany', 'Egypt'];
      const smallCountries = ['United Kingdom', 'Italy', 'Greece', 'Romania', 'Belarus'];
      
      // Determine zoom level based on country size
      if (extraLargeCountries.includes(countryName)) {
        adjustedZoom = 3; // Extremely large countries
      } else if (largeCountries.includes(countryName)) {
        adjustedZoom = 4; // Large countries
      } else if (mediumLargeCountries.includes(countryName)) {
        adjustedZoom = 5; // Medium-large countries
      } else if (mediumCountries.includes(countryName)) {
        adjustedZoom = 6; // Medium countries
      } else if (smallMediumCountries.includes(countryName)) {
        adjustedZoom = 6; // Small-medium countries
      } else if (smallCountries.includes(countryName)) {
        adjustedZoom = 7; // Small countries
      } else {
        // Very small countries and microstates
        adjustedZoom = 8;
      }
      
      console.log('Country size category detected, zoom set to:', adjustedZoom);
    } else {
      // Cities or default locations - use higher zoom
      adjustedZoom = Math.max(zoom, 11);
    }
    
    // Ensure we're not zooming out from a higher zoom level
    if (zoom > adjustedZoom) {
      adjustedZoom = zoom;
    }
    
    console.log('Final zoom level:', adjustedZoom);
    
    // Update the map position with the search results
    setMapPosition({ 
      lat, 
      lng, 
      zoom: adjustedZoom 
    });
    
    // Update marker and highlighted country information
    if (cities) setCityMarkers(cities);
    setHighlightedCountry(countryName || undefined);
    
    // Use a delayed second update to ensure the map responds correctly
    setTimeout(() => {
      console.log('Sending delayed position update');
      setMapPosition(prev => ({ 
        ...prev,
        lat: lat + 0.0001, // Tiny change to force a re-render
        lng: lng + 0.0001  // Tiny change to force a re-render
      }));
      
      // Then set back to exact position
      setTimeout(() => {
        setMapPosition({ 
          lat, 
          lng, 
          zoom: adjustedZoom 
        });
      }, 100);
    }, 300);
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#f5f5f5', position: 'relative' }}>
      <AppNavBar />
      <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: '18px', boxShadow: '0 4px 24px rgba(120,120,120,0.10)', padding: '40px 32px', marginTop: '32px', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ marginBottom: '32px', color: '#4f8cff', fontWeight: 700, fontSize: '2em', textShadow: '0 2px 8px #4f8cff22' }}>Create New Map</h2>
        <input
          type="text"
          placeholder="Map Title"
          value={mapTitle}
          onChange={e => setMapTitle(e.target.value)}
          style={{ width: '100%', marginBottom: '18px', fontSize: '1.1em', padding: '10px', borderRadius: '6px', border: '1px solid #b6d0f7', boxShadow: '0 2px 8px #4f8cff11' }}
        />
        <textarea
          placeholder="Map Description"
          value={mapDescription}
          onChange={e => setMapDescription(e.target.value)}
          style={{ width: '100%', marginBottom: '18px', fontSize: '1em', padding: '10px', minHeight: '80px', borderRadius: '6px', border: '1px solid #b6d0f7', boxShadow: '0 2px 8px #4f8cff11' }}
        />
        <button
          style={{ width: '100%', padding: '14px', fontSize: '1.1em', background: '#4f8cff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 8px #4f8cff22', marginBottom: '8px' }}
          onClick={handleSave}
        >Save</button>
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
          cityMarkers={cityMarkers} 
          highlightedCountry={highlightedCountry} 
          showAllCities={true} 
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
      `}</style>
    </div>
  );
};

export default CreateMapPage;
