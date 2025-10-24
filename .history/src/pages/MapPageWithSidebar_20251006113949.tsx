import React, { useState } from 'react';
import WorldMap from '../components/WorldMap';
import CountrySidebar from '../components/CountrySidebar';

interface CityMarker {
  name: string;
  lat: number;
  lng: number;
  country: string;
  isCapital?: boolean;
}

const MapPageWithSidebar: React.FC = () => {
  const [mapPosition, setMapPosition] = useState({
    lat: 20,
    lng: 0,
    zoom: 2
  });
  const [cityMarkers, setCityMarkers] = useState<CityMarker[]>([]);
  const [highlightedCountry, setHighlightedCountry] = useState<string | undefined>(undefined);

  // Handle search results from the sidebar
  const handleSearch = (lat: number, lng: number, zoom: number, cities?: CityMarker[], countryName?: string) => {
    setMapPosition({ lat, lng, zoom });
    if (cities) setCityMarkers(cities);
    setHighlightedCountry(countryName);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <WorldMap 
        lat={mapPosition.lat} 
        lng={mapPosition.lng} 
        zoom={mapPosition.zoom}
        cityMarkers={cityMarkers}
        highlightedCountry={highlightedCountry}
      />
      <CountrySidebar onSearch={handleSearch} />
    </div>
  );
};

export default MapPageWithSidebar;