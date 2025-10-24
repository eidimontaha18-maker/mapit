import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const NAVBAR_HEIGHT = 64; // px

const WorldMap = () => {
  return (
    <div style={{ position: 'fixed', top: NAVBAR_HEIGHT, left: 0, width: '100vw', height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, zIndex: 1 }}>
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
