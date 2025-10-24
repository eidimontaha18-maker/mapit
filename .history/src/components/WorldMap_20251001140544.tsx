import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useRef, useEffect } from 'react';

const NAVBAR_HEIGHT = 64; // px

function MapUpdater({ lat, lng, zoom }: { lat: number, lng: number, zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lng !== null && zoom !== null) {
      map.setView([lat, lng], zoom);
    }
  }, [lat, lng, zoom, map]);
  return null;
}

const WorldMap = ({ lat, lng, zoom }: { lat: number, lng: number, zoom: number }) => {
  return (
    <div style={{ position: 'fixed', top: NAVBAR_HEIGHT, left: 0, width: 'calc(100vw - 300px)', height: `calc(100vh - ${NAVBAR_HEIGHT}px)`, zIndex: 1 }}>
      <MapContainer center={[lat, lng]} zoom={zoom} minZoom={2} maxZoom={18} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater lat={lat} lng={lng} zoom={zoom} />
      </MapContainer>
    </div>
  );
};

export default WorldMap;
