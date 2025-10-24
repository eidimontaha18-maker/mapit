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
  mapCode?: string;
  mapTitle?: string;
  isSavingZone?: boolean;
  onSaveMap?: () => void;
}

const ZoneControls: React.FC<ZoneControlsProps> = ({
  onCreateZone,
  onDeleteZone,
  onSaveAllZones,
  zones,
  isDrawing,
  onCancelDrawing,
  mapCode,
  mapTitle,
  isSavingZone,
  onSaveMap
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
      {/* Map Information Section */}
      {mapCode && (
        <div className="map-info-section">
          <h3>{mapTitle || 'Map 1'}</h3>
          <p>shows {mapTitle || 'montana'}</p>
          
          <div className="map-code-display">
            <label>MAP CODE</label>
            <code>{mapCode}</code>
          </div>
          
          {/* Save Map Button */}
          {onSaveMap && (
            <button
              onClick={onSaveMap}
              className="save-all-zones-button"
              style={{ marginTop: '16px' }}
            >
              💾 Save Map Changes
            </button>
          )}
        </div>
      )}

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
          <div className="draw-instructions">
            <strong>✏️ Drawing: {zoneName || 'Unnamed Zone'}</strong>
            <br />
            Click on the map to add points. Double-click to finish.
          </div>
          <button onClick={onCancelDrawing} className="cancel">❌ Cancel Drawing</button>
        </div>
      )}
      
      <div className="zones-list">
        <h3>Created Zones ({zones.length})</h3>
        
        {isSavingZone && (
          <div className="draw-instructions" style={{ marginBottom: '12px' }}>
            💾 Saving zone to database...
          </div>
        )}
        
        {zones.length === 0 ? (
          <div className="empty-state">
            <p>
              📍 No zones created yet.<br />
              Use the "Draw Zone" button above to start creating zones on the map.
            </p>
          </div>
        ) : (
          <>
            
            {zones.map((zone) => (
              <div key={zone.id} className="zone-item">
                <div className="zone-name-color">
                  <div 
                    className="zone-color" 
                    style={{ backgroundColor: zone.color }}
                    title={`Zone Color: ${zone.color}`}
                  ></div>
                  <span title={zone.name}>{zone.name}</span>
                </div>
                <div className="zone-actions">
                  <button 
                    onClick={() => onDeleteZone(zone.id)}
                    title="Delete this zone"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            
            {/* Save all zones button - if needed */}
            {onSaveAllZones && (
              <div className="save-zones-container">
                <button
                  onClick={onSaveAllZones}
                  className="save-all-zones-button"
                  disabled={isSavingZone}
                >
                  {isSavingZone ? '💾 Saving...' : '💾 Save All Zones'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ZoneControls;