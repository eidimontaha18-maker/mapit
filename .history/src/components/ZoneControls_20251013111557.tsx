import React, { useState } from 'react';

interface Zone {
  id: string;
  name: string;
  color: string;
}

interface ZoneControlsProps {
  onCreateZone: (name: string, color: string) => void;
  onDeleteZone: (id: string) => void;
  onSaveAllZones?: () => void;
  zones: Zone[];
  isDrawing: boolean;
  onCancelDrawing: () => void;
}

const ZoneControls: React.FC<ZoneControlsProps> = ({ 
  onCreateZone,
  onDeleteZone,
  zones,
  isDrawing,
  onCancelDrawing
}) => {
  const [zoneName, setZoneName] = useState('');
  const [zoneColor, setZoneColor] = useState('#3388ff');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zoneName.trim()) {
      onCreateZone(zoneName, zoneColor);
    } else {
      alert("Please enter a zone name");
    }
  };

  return (
    <div className="zone-controls">
      <h3>Zone Controls</h3>
      
      {!isDrawing ? (
        <form className="zone-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Zone name"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
          />
          <div className="color-picker">
            <label>Zone color:</label>
            <input
              type="color"
              value={zoneColor}
              onChange={(e) => setZoneColor(e.target.value)}
            />
          </div>
          <button type="submit">Draw Zone</button>
          
          <div className="draw-instructions">
            Click the "Draw Zone" button, then draw a polygon on the map.
            Click points to create a shape, double-click to complete it.
          </div>
        </form>
      ) : (
        <div className="zone-form">
          <p>Drawing zone: <strong>{zoneName || 'Unnamed Zone'}</strong></p>
          <button onClick={onCancelDrawing} className="cancel">Cancel Drawing</button>
        </div>
      )}
      
      {zones.length > 0 && (
        <div className="zones-list">
          <h3>Created Zones</h3>
          {zones.map(zone => (
            <div key={zone.id} className="zone-item">
              <div className="zone-name-color">
                <div className="zone-color" style={{ backgroundColor: zone.color }}></div>
                <span>{zone.name}</span>
              </div>
              <div className="zone-actions">
                <button onClick={() => onDeleteZone(zone.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ZoneControls;