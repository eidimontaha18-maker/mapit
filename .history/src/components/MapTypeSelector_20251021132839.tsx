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
      preview: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cdefs%3E%3Cpattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 20 0 L 0 0 0 20' fill='none' stroke='%23f0f0f0' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100' height='100' fill='%232d5016'/%3E%3Crect width='100' height='100' fill='url(%23grid)'/%3E%3Ctext x='10' y='50' fill='white' font-size='8' font-family='Arial'%3ERoad%3C/text%3E%3C/svg%3E"), linear-gradient(135deg, #1a472a 0%, #2d5016 50%, #4a7c59 100%)`
    },
    {
      id: 'road' as const,
      name: 'ROAD',
      icon: '🛣️',
      description: 'Street map view',
      preview: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f5f5f5'/%3E%3Cpath d='M 0 50 Q 25 40 50 50 T 100 50' stroke='%23ffa500' stroke-width='8' fill='none'/%3E%3Cpath d='M 0 50 Q 25 40 50 50 T 100 50' stroke='%23ffcc00' stroke-width='4' stroke-dasharray='10,5' fill='none'/%3E%3Crect x='10' y='20' width='20' height='15' fill='%23ccc' stroke='%23888' stroke-width='1'/%3E%3Crect x='70' y='65' width='15' height='20' fill='%23ccc' stroke='%23888' stroke-width='1'/%3E%3C/svg%3E"), linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 50%, #d0d0d0 100%)`
    },
    {
      id: 'satellite' as const,
      name: 'SATELLITE',
      icon: '🛰️',
      description: 'Aerial imagery',
      preview: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%231a3a2a'/%3E%3Ccircle cx='30' cy='30' r='15' fill='%232d5520' opacity='0.6'/%3E%3Ccircle cx='70' cy='60' r='20' fill='%23456535' opacity='0.5'/%3E%3Cpath d='M 0 80 Q 30 70 60 80 T 100 75' fill='%23567845' opacity='0.4'/%3E%3Crect x='45' y='20' width='8' height='12' fill='%23666' opacity='0.7'/%3E%3C/svg%3E"), linear-gradient(135deg, #1a3a2a 0%, #2d4a3d 50%, #4a6b5a 100%)`
    },
    {
      id: 'terrain' as const,
      name: 'TERRAIN',
      icon: '⛰️',
      description: 'Topographic map',
      preview: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23e8d4b8'/%3E%3Cpath d='M 0 60 L 20 50 L 40 65 L 60 45 L 80 60 L 100 50 L 100 100 L 0 100 Z' fill='%23c4a574' opacity='0.6'/%3E%3Cpath d='M 0 70 L 25 60 L 50 75 L 75 55 L 100 65 L 100 100 L 0 100 Z' fill='%23a88d5e' opacity='0.5'/%3E%3Cpath d='M 20 50 L 40 35 L 60 45' stroke='%23886633' stroke-width='1.5' fill='none'/%3E%3C/svg%3E"), linear-gradient(135deg, #d4a574 0%, #b8956a 50%, #9c7a5e 100%)`
    },
    {
      id: 'traffic' as const,
      name: 'TRAFFIC',
      icon: '🚦',
      description: 'Traffic conditions',
      preview: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Cpath d='M 20 0 L 20 100' stroke='%23333' stroke-width='6' fill='none'/%3E%3Cpath d='M 50 0 L 50 100' stroke='%23ff0000' stroke-width='6' fill='none' opacity='0.8'/%3E%3Cpath d='M 80 0 L 80 100' stroke='%2300ff00' stroke-width='6' fill='none' opacity='0.8'/%3E%3Ccircle cx='50' cy='20' r='4' fill='%23ff0000'/%3E%3Ccircle cx='50' cy='50' r='4' fill='%23ffff00'/%3E%3Ccircle cx='50' cy='80' r='4' fill='%2300ff00'/%3E%3C/svg%3E"), linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 50%, #d0d0d0 100%)`
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
