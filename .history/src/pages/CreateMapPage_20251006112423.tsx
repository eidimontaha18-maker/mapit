import React, { useState } from 'react';
import AppNavBar from '../components/AppNavBar';
import WorldMap from '../components/WorldMap';

const CreateMapPage: React.FC = () => {
  const [mapTitle, setMapTitle] = useState('');
  const [mapDescription, setMapDescription] = useState('');
  const [error, setError] = useState('');
  const [mapId, setMapId] = useState<number | null>(null);

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
    } catch (err) {
      setError('Error creating map');
    }
  };

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#f5f5f5' }}>
      <AppNavBar />
      <div style={{ display: 'flex', height: 'calc(100vh - 56px)' }}>
        <div style={{ flex: 1, position: 'relative', minHeight: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 900, minHeight: 400, borderRadius: '18px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(120,120,120,0.10)', background: '#fff', margin: '32px' }}>
            <WorldMap lat={20} lng={0} zoom={2} cityMarkers={[]} highlightedCountry={undefined} showAllCities={true} />
          </div>
        </div>
        {/* Sidebar to the right */}
        <aside style={{
          width: sidebarOpen ? 340 : 40,
          minWidth: sidebarOpen ? 220 : 40,
          maxWidth: sidebarOpen ? 340 : 40,
          background: '#fff',
          padding: sidebarOpen ? '48px 24px 24px 24px' : '0',
          boxShadow: '-2px 0 16px #2222',
          display: 'flex',
          flexDirection: 'column',
          alignItems: sidebarOpen ? 'flex-start' : 'center',
          position: 'relative',
          zIndex: 2,
          height: '100%',
          transition: 'width 0.3s, min-width 0.3s, max-width 0.3s, padding 0.3s',
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              position: 'absolute',
              left: '-20px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: 40,
              height: 40,
              borderRadius: '20px',
              background: '#4f8cff',
              color: '#fff',
              border: 'none',
              boxShadow: '0 2px 8px #4f8cff22',
              cursor: 'pointer',
              fontSize: '1.5em',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <span>&#8594;</span> : <span>&#8592;</span>}
          </button>
          {sidebarOpen && (
            <>
              <h2 style={{ marginBottom: '32px', color: '#222', fontWeight: 700, fontSize: '2em' }}>Create New Map</h2>
              <label style={{ fontWeight: 500, marginBottom: 8 }}>Title</label>
              <input
                type="text"
                placeholder="Map Title"
                value={mapTitle}
                onChange={e => setMapTitle(e.target.value)}
                style={{ width: '100%', marginBottom: '18px', fontSize: '1.1em', padding: '10px', borderRadius: '6px', border: '1px solid #ccc', boxShadow: '0 2px 8px #eee' }}
              />
              <label style={{ fontWeight: 500, marginBottom: 8 }}>Description</label>
              <textarea
                placeholder="Map Description"
                value={mapDescription}
                onChange={e => setMapDescription(e.target.value)}
                style={{ width: '100%', marginBottom: '18px', fontSize: '1em', padding: '10px', minHeight: '80px', borderRadius: '6px', border: '1px solid #ccc', boxShadow: '0 2px 8px #eee' }}
              />
              <button
                style={{ width: '100%', padding: '14px', fontSize: '1.1em', background: '#4f8cff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 2px 8px #4f8cff22', marginBottom: '8px' }}
                onClick={handleSave}
              >Save</button>
              {error && <div style={{ color: mapId ? 'green' : 'red', marginTop: '16px', fontWeight: 500 }}>{error}</div>}
            </>
          )}
        </aside>
      </div>
      <style>{`
        @media (max-width: 900px) {
          aside {
            max-width: 100vw !important;
            min-width: 0 !important;
            width: ${sidebarOpen ? '100vw' : '40px'} !important;
            position: static !important;
            box-shadow: none !important;
            padding: ${sidebarOpen ? '32px 8vw 24px 8vw' : '0'} !important;
            height: auto !important;
          }
          div[style*='maxWidth: 900'] {
            min-height: 220px !important;
            margin: 16px !important;
          }
        }
        @media (max-width: 600px) {
          aside {
            padding: ${sidebarOpen ? '24px 4vw 16px 4vw' : '0'} !important;
          }
          h2 {
            font-size: 1.3em !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateMapPage;
