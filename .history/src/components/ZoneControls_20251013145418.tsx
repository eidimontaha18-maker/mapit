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
  isSavingZone
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
          <h3>map1</h3>
          <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>
            shows {mapTitle || 'map1'}
          </p>
          <div className="map-code-display">
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
              MAP CODE
            </label>
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: '8px 12px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#333',
              marginTop: '4px',
              letterSpacing: '1px'
            }}>
              {mapCode}
            </div>
          </div>
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
          <p>Drawing zone: <strong>{zoneName || 'Unnamed Zone'}</strong></p>
          <button onClick={onCancelDrawing} className="cancel">Cancel Drawing</button>
        </div>
      )}
      
      <div className="zones-list">
        <h3>Created Zones</h3>
        
        {isSavingZone && (
          <div style={{
            fontSize: '12px',
            color: '#4f8cff',
            marginBottom: '8px',
            padding: '5px 8px',
            backgroundColor: '#e8f2ff',
            borderRadius: '3px',
            border: '1px solid #b3d9ff'
          }}>
            💾 Saving zone...
          </div>
        )}
        
        {zones.length === 0 ? (
          <p style={{ 
            color: '#666', 
            fontSize: '14px', 
            fontStyle: 'italic',
            margin: '10px 0'
          }}>
            No zones created yet. Use "Draw Zone" to create zones on the map.
          </p>
        ) : (
          <>
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '10px',
              padding: '5px 8px',
              backgroundColor: '#f8f9fa',
              borderRadius: '3px'
            }}>
              {zones.length} zone{zones.length !== 1 ? 's' : ''} created
            </div>
            
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
                >
                  Save All Zones
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