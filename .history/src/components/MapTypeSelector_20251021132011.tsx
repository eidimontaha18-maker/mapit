import React, { useState } from 'react';
import './MapTypeSelector.css';

interface MapTypeSelectorProps {
  currentMapType: 'road' | 'satellite' | 'hybrid' | 'terrain' | 'traffic';
  onMapTypeChange: (mapType: 'road' | 'satellite' | 'hybrid' | 'terrain' | 'traffic') => void;
}

const MapTypeSelector: React.FC<MapTypeSelectorProps> = ({ currentMapType, onMapTypeChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const mapTypes = [
    {
      id: 'hybrid' as const,
      name: 'HYBRID',
      icon: '🗺️',
      description: 'Satellite with labels',
      preview: 'linear-gradient(135deg, #1a472a 0%, #2d5016 50%, #4a7c59 100%)'
    },
    {
      id: 'road' as const,
      name: 'ROAD',
      icon: '🛣️',
      description: 'Street map view',
      preview: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 50%, #d0d0d0 100%)'
    },
    {
      id: 'satellite' as const,
      name: 'SATELLITE',
      icon: '🛰️',
      description: 'Aerial imagery',
      preview: 'linear-gradient(135deg, #1a3a2a 0%, #2d4a3d 50%, #4a6b5a 100%)'
    },
    {
      id: 'terrain' as const,
      name: 'TERRAIN',
      icon: '⛰️',
      description: 'Topographic map',
      preview: 'linear-gradient(135deg, #d4a574 0%, #b8956a 50%, #9c7a5e 100%)'
    },
    {
      id: 'traffic' as const,
      name: 'TRAFFIC',
      icon: '🚦',
      description: 'Traffic conditions',
      preview: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 50%, #d0d0d0 100%)'
    }
  ];

  const handleMapTypeClick = (mapType: 'road' | 'satellite' | 'hybrid' | 'terrain' | 'traffic') => {
    onMapTypeChange(mapType);
    setIsExpanded(false);
  };

  const currentMapTypeInfo = mapTypes.find(mt => mt.id === currentMapType);

  return (
    <div className="map-type-selector-wrapper">
      {!isExpanded ? (
        <button 
          className="map-type-trigger"
          onClick={() => setIsExpanded(true)}
          title="Change map type"
        >
          <div className="map-type-trigger-preview" style={{ background: currentMapTypeInfo?.preview }}>
            <span className="map-type-trigger-icon">{currentMapTypeInfo?.icon}</span>
          </div>
          <div className="map-type-trigger-label">
            <span className="map-type-trigger-name">{currentMapTypeInfo?.name}</span>
          </div>
        </button>
      ) : (
        <div className="map-type-selector-panel">
          <div className="map-type-selector-header">
            <h3>Map Type</h3>
            <button 
              className="map-type-close"
              onClick={() => setIsExpanded(false)}
              title="Close"
            >
              ✕
            </button>
          </div>
          <div className="map-type-grid">
            {mapTypes.map((mapType) => (
              <button
                key={mapType.id}
                className={`map-type-option ${currentMapType === mapType.id ? 'active' : ''}`}
                onClick={() => handleMapTypeClick(mapType.id)}
                title={mapType.description}
              >
                <div className="map-type-preview" style={{ background: mapType.preview }}>
                  <span className="map-type-icon">{mapType.icon}</span>
                  {currentMapType === mapType.id && (
                    <div className="map-type-check">✓</div>
                  )}
                </div>
                <div className="map-type-name">{mapType.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapTypeSelector;
