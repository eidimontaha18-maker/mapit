import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const WorldMap = () => {
  return (
    <div style={{ width: '100%', height: '500px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(45,123,229,0.08)' }}>
      <MapContainer center={[20, 0]} zoom={2} minZoom={2} maxZoom={18} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
};

export default WorldMap;
