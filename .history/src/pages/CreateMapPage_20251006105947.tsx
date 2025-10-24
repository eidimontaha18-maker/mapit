import React, { useState } from 'react';
import CountrySidebar from '../components/CountrySidebar';
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

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: '320px', background: '#f7f7f7', padding: '32px 24px', boxShadow: '2px 0 8px #eee' }}>
        <h2 style={{ marginBottom: '24px' }}>Create New Map</h2>
        <input
          type="text"
          placeholder="Map Title"
          value={mapTitle}
          onChange={e => setMapTitle(e.target.value)}
          style={{ width: '100%', marginBottom: '16px', fontSize: '1.1em', padding: '8px' }}
        />
        <textarea
          placeholder="Map Description"
          value={mapDescription}
          onChange={e => setMapDescription(e.target.value)}
          style={{ width: '100%', marginBottom: '16px', fontSize: '1em', padding: '8px', minHeight: '80px' }}
        />
        <button
          style={{ width: '100%', padding: '12px', fontSize: '1.1em', background: '#4f8cff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          onClick={handleSave}
        >Save Map</button>
        {error && <div style={{ color: mapId ? 'green' : 'red', marginTop: '16px' }}>{error}</div>}
      </aside>
      <div style={{ flex: 1, position: 'relative' }}>
        <WorldMap lat={20} lng={0} zoom={2} cityMarkers={[]} highlightedCountry={undefined} showAllCities={true} />
      </div>
    </div>
  );
};

export default CreateMapPage;
