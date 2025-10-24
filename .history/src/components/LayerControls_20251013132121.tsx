import React, { useState } from 'react';
import './LayerControls.css';

interface LayerControlsProps {
  onLayerChange: (layerType: string, enabled: boolean) => void;
  currentLayers: {
    baseMap: string;
    buildings: boolean;
    streets: boolean;
  };
}

const LayerControls: React.FC<LayerControlsProps> = ({ onLayerChange, currentLayers }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const baseMaps = [
    { id: 'standard', name: 'Standard', description: 'Clean, minimal map' },
    { id: 'satellite', name: 'Satellite', description: 'Aerial imagery' },
    { id: 'terrain', name: 'Terrain', description: 'Topographic features' },
    { id: 'dark', name: 'Dark Mode', description: 'Dark theme map' }
  ];

  const overlayLayers = [
    { id: 'buildings', name: 'Buildings', description: 'Show building outlines' },
    { id: 'streets', name: 'Street Names', description: 'Display street labels' }
  ];

  const handleBaseMapChange = (mapType: string) => {
    onLayerChange('baseMap', mapType as any);
  };

  const handleOverlayToggle = (layerType: string, enabled: boolean) => {
    onLayerChange(layerType, enabled);
  };

  return (
    <div className={`layer-controls ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button 
        className="layer-controls-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Layer Controls"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7v10l10 5 10-5V7L12 2z"/>
          <polyline points="2,17 12,22 22,17"/>
          <polyline points="2,12 12,17 22,12"/>
        </svg>
      </button>
      
      {isExpanded && (
        <div className="layer-controls-panel">
          <div className="layer-section">
            <h4>Base Maps</h4>
            <div className="layer-options">
              {baseMaps.map((map) => (
                <label key={map.id} className="layer-option">
                  <input
                    type="radio"
                    name="baseMap"
                    value={map.id}
                    checked={currentLayers.baseMap === map.id}
                    onChange={() => handleBaseMapChange(map.id)}
                  />
                  <div className="layer-info">
                    <span className="layer-name">{map.name}</span>
                    <span className="layer-description">{map.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div className="layer-section">
            <h4>Overlays</h4>
            <div className="layer-options">
              {overlayLayers.map((layer) => (
                <label key={layer.id} className="layer-option">
                  <input
                    type="checkbox"
                    checked={currentLayers[layer.id as keyof typeof currentLayers] as boolean}
                    onChange={(e) => handleOverlayToggle(layer.id, e.target.checked)}
                  />
                  <div className="layer-info">
                    <span className="layer-name">{layer.name}</span>
                    <span className="layer-description">{layer.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayerControls;