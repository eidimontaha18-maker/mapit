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
  isSavingZone?: boolean;
  currentMapType?: 'road' | 'satellite' | 'hybrid' | 'terrain';
  onMapTypeChange?: (type: 'road' | 'satellite' | 'hybrid' | 'terrain') => void;
}

// Updated component - removed map info card to avoid duplication with MapPageWithSidebar overlay
const ZoneControls: React.FC<ZoneControlsProps> = ({
  onCreateZone,
  onDeleteZone,
  onSaveAllZones,
  zones,
  isDrawing,
  onCancelDrawing,
  isSavingZone,
  currentMapType = 'road',
  onMapTypeChange
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
      <div className="controls-section">
        <div className="section-header">
          <span className="section-icon">🎨</span>
          <h3>Zone Controls</h3>
        </div>
      
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
      </div>
      
      <div className="zones-list">
        <div className="zones-list-header">
          <h3>Zones</h3>
          <span className="zone-count">{zones.length} zone{zones.length !== 1 ? 's' : ''}</span>
        </div>
        
        {isSavingZone && (
          <div className="draw-instructions" style={{ marginBottom: '16px', marginTop: '16px' }}>
            💾 Saving zone to database...
          </div>
        )}
        
        {zones.length === 0 ? (
          <div className="empty-state">
            <p>
              📍 No zones created yet.<br />
              Click "Draw Zone" above to create your first zone on the map.
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