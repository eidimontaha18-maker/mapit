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

  // Enhanced search handler function for the sidebar
  const handleSearch = (lat: number, lng: number, zoom: number, cities?: CityMarker[], countryName?: string) => {
    console.log('Search params:', { lat, lng, zoom, countryName, citiesCount: cities?.length });
    
    // Force higher zoom level to ensure we get a close view
    const adjustedZoom = Math.max(zoom, countryName ? 6 : 10);
    
    // Update the map position with the search results
    setMapPosition({ 
      lat, 
      lng, 
      zoom: adjustedZoom 
    });
    
    if (cities) setCityMarkers(cities);
    setHighlightedCountry(countryName);
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
          z-index: 100;
        }
      `}</style>
    </div>
  );
};

export default CreateMapPage;
