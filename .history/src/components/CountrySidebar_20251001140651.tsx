import React, { useState } from 'react';

const countryCoords: Record<string, [number, number, number]> = {
  lebanon: [33.8547, 35.8623, 8],
  usa: [37.0902, -95.7129, 4],
  france: [46.6034, 1.8883, 6],
  egypt: [26.8206, 30.8025, 6],
  brazil: [-14.2350, -51.9253, 4],
  india: [20.5937, 78.9629, 5],
  china: [35.8617, 104.1954, 4],
  canada: [56.1304, -106.3468, 3],
  germany: [51.1657, 10.4515, 6],
  // Add more countries as needed
};

export default function CountrySidebar({ onSearch }: { onSearch: (lat: number, lng: number, zoom: number) => void }) {
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');

  const handleSearch = () => {
    const key = country.trim().toLowerCase();
    if (countryCoords[key]) {
      setError('');
      const [lat, lng, zoom] = countryCoords[key];
      onSearch(lat, lng, zoom);
    } else {
      setError('Country not found. Try Lebanon, USA, France, Egypt, Brazil, India, China, Canada, Germany.');
    }
  };

  return (
    <div style={{ position: 'fixed', top: 64, right: 0, width: 300, height: 'calc(100vh - 64px)', background: '#f7faff', boxShadow: '-2px 0 8px rgba(45,123,229,0.08)', padding: '2rem 1rem', zIndex: 2 }}>
      <h3 style={{ color: '#2d7be5', marginBottom: '1rem' }}>Country Search</h3>
      <input
        type="text"
        value={country}
        onChange={e => setCountry(e.target.value)}
        placeholder="Type a country..."
        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem', borderRadius: 4, border: '1px solid #bcdffb', marginBottom: '1rem' }}
      />
      <button
        onClick={handleSearch}
        style={{ width: '100%', padding: '0.5rem', background: '#2d7be5', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}
      >
        Search
      </button>
      {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
      <div style={{ marginTop: '2rem', fontSize: '0.95rem', color: '#555' }}>
        Example: Lebanon, USA, France, Egypt, Brazil, India, China, Canada, Germany
      </div>
    </div>
  );
}
