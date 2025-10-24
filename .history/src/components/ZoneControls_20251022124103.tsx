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
  const [isOpen, setIsOpen] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zoneName.trim()) {
      onCreateZone(zoneName, zoneColor);
    } else {
      alert("Please enter a zone name");
    }
  };

  // Map types configuration
  const mapTypes = [
    { id: 'road', label: 'Road', icon: '🛣️' },
    { id: 'satellite', label: 'Satellite', icon: '🛰️' },
    { id: 'hybrid', label: 'Hybrid', icon: '🌍' },
    { id: 'terrain', label: 'Terrain', icon: '🏔️' }
  ];

  return (
    <>
      {/* Toggle Button - Modern Design */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'absolute',
          top: '50%',
          left: isOpen ? '360px' : '0px',
          transform: 'translateY(-50%)',
          padding: '0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '0 10px 10px 0',
          cursor: 'pointer',
          boxShadow: '4px 0 16px rgba(102, 126, 234, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '80px',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          overflow: 'hidden'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)';
          e.currentTarget.style.boxShadow = '6px 0 20px rgba(118, 75, 162, 0.45)';
          e.currentTarget.style.width = '40px';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          e.currentTarget.style.boxShadow = '4px 0 16px rgba(102, 126, 234, 0.3)';
          e.currentTarget.style.width = '36px';
        }}
        title={isOpen ? 'Hide Controls' : 'Show Controls'}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px'
        }}>
          {/* Animated chevron lines */}
          <div style={{
            width: '14px',
            height: '2px',
            background: 'white',
            borderRadius: '1.5px',
            transform: isOpen ? 'rotate(-45deg) translateY(5px)' : 'rotate(45deg) translateY(5px)',
            transition: 'all 0.3s ease'
          }}></div>
          <div style={{
            width: '14px',
            height: '2px',
            background: 'white',
            borderRadius: '1.5px',
            transform: isOpen ? 'rotate(45deg) translateY(-5px)' : 'rotate(-45deg) translateY(-5px)',
            transition: 'all 0.3s ease'
          }}></div>
        </div>
      </button>

      {/* Main Sidebar Panel */}
      <div 
        className="zone-controls"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease'
        }}
      >
        {/* Map Type Selector */}
        {onMapTypeChange && (
        <div className="controls-section" style={{ paddingBottom: '12px', borderBottom: '1px solid #e8eaed' }}>
          <div className="section-header">
            <span className="section-icon">🗺️</span>
            <h3>Map Type</h3>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '8px',
            marginTop: '12px'
          }}>
            {mapTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onMapTypeChange(type.id as 'road' | 'satellite' | 'hybrid' | 'terrain')}
                style={{
                  padding: '10px',
                  background: currentMapType === type.id ? '#4f8cff' : '#f8f9fa',
                  color: currentMapType === type.id ? 'white' : '#333',
                  border: currentMapType === type.id ? '2px solid #4f8cff' : '2px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: currentMapType === type.id ? '600' : '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseOver={(e) => {
                  if (currentMapType !== type.id) {
                    e.currentTarget.style.background = '#e8f0fe';
                    e.currentTarget.style.borderColor = '#4f8cff';
                  }
                }}
                onMouseOut={(e) => {
                  if (currentMapType !== type.id) {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#e0e0e0';
                  }
                }}
              >
                <span style={{ fontSize: '20px' }}>{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
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
      {/* End of main sidebar panel */}
    </div>
    {/* End of outer wrapper */}
    </>
  );
};

export default ZoneControls;