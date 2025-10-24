import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NewMapFormProps {
  onCancel: () => void;
}

// Function to generate unique map code
const generateMapCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `MAP-${part1}-${part2}`;
};

const NewMapForm: React.FC<NewMapFormProps> = ({ onCancel }) => {
  const [mapTitle, setMapTitle] = useState('');
  const [mapDescription, setMapDescription] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapTitle.trim()) {
      setError('Title is required');
      return;
    }
    
    setIsSaving(true);
    setError('');
    
    try {
      // Get customer_id from localStorage
      const userStr = localStorage.getItem('mapit_user');
      if (!userStr) {
        setError('You must be logged in to create maps. Please log in again.');
        setIsSaving(false);
        return;
      }
      
      const user = JSON.parse(userStr);
      console.log('User data from localStorage:', user);
      
      if (!user.customer_id) {
        setError('Session expired. Please log out and log in again to refresh your session.');
        setIsSaving(false);
        return;
      }
      
      // Generate map code
      const mapCode = generateMapCode();
      
      // Create map data
      const mapData = {
        title: mapTitle,
        description: mapDescription,
        map_code: mapCode,
        customer_id: user.customer_id,
        map_data: { lat: 20, lng: 0, zoom: 2 },
        map_bounds: { center: [20, 0], zoom: 2 },
        active: true,
        country: null
      };
      
      console.log('Creating map:', mapData);
      
      // Save map to database
      const response = await fetch('/api/map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mapData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create map');
      }
      
      const result = await response.json();
      console.log('Map created successfully:', result);
      
      // Navigate to edit the new map
      if (result.map && result.map.map_id) {
        navigate(`/edit-map/${result.map.map_id}`);
      } else {
        throw new Error('Map ID not returned from server');
      }
      
    } catch (err) {
      console.error('Error creating map:', err);
      setError(err instanceof Error ? err.message : 'Failed to create map');
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        zIndex: 999,
        animation: 'fadeIn 0.2s ease-out'
      }} onClick={onCancel} />
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .input-focus:focus {
          border-color: #4f8cff !important;
          box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.1) !important;
        }
        .input-error {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
      
      <div className="new-map-form-container" style={{ 
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%', 
        maxWidth: '540px', 
        padding: '0', 
        borderRadius: '20px', 
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        background: 'white',
        color: '#000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        zIndex: 1000,
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header with gradient */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '32px 40px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            filter: 'blur(20px)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            filter: 'blur(15px)'
          }} />
          
          {/* Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          
          <h2 style={{ 
            margin: 0,
            color: 'white', 
            fontSize: '28px',
            fontWeight: '700',
            letterSpacing: '-0.5px',
            position: 'relative',
            zIndex: 1
          }}>Create New Map</h2>
          <p style={{
            margin: '8px 0 0 0',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '15px',
            fontWeight: '400',
            position: 'relative',
            zIndex: 1
          }}>
            Start building your custom map
          </p>
        </div>
        
        {/* Form content */}
        <form onSubmit={handleSubmit} style={{ padding: '32px 40px 40px' }}>
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="mapTitle" style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#1a202c',
              fontSize: '14px',
              letterSpacing: '0.2px'
            }}>
              Map Title <span style={{ color: '#f56565' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="mapTitle"
                type="text"
                placeholder="e.g., Sales Territories 2024"
                value={mapTitle}
                onChange={(e) => {
                  setMapTitle(e.target.value);
                  if (e.target.value.trim()) setError('');
                }}
                className={`input-focus ${error ? 'input-error' : ''}`}
                style={{
                  width: '100%',
                  padding: '13px 16px 13px 44px',
                  borderRadius: '12px',
                  border: error ? '2px solid #f56565' : '2px solid #e2e8f0',
                  fontSize: '15px',
                  color: '#1a202c',
                  background: '#f8fafc',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  fontWeight: '500'
                }}
                required
              />
              <svg 
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#94a3b8" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </div>
          </div>
          
          <div style={{ marginBottom: '28px' }}>
            <label htmlFor="mapDescription" style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#1a202c',
              fontSize: '14px',
              letterSpacing: '0.2px'
            }}>
              Description <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '13px' }}>(optional)</span>
            </label>
            <textarea
              id="mapDescription"
              placeholder="Add context about this map, what it represents, or how you plan to use it..."
              value={mapDescription}
              onChange={(e) => setMapDescription(e.target.value)}
              className="input-focus"
              style={{
                width: '100%',
                padding: '13px 16px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                fontSize: '15px',
                color: '#1a202c',
                background: '#f8fafc',
                minHeight: '120px',
                resize: 'vertical',
                transition: 'all 0.2s ease',
                outline: 'none',
                fontWeight: '400',
                lineHeight: '1.6',
                fontFamily: 'inherit'
              }}
            />
          </div>
          
          {error && (
            <div style={{ 
              color: '#c53030', 
              marginBottom: '24px',
              padding: '12px 16px 12px 44px',
              background: 'linear-gradient(to right, #fff5f5, #fed7d7)',
              borderRadius: '10px',
              border: '1px solid #fc8181',
              fontSize: '14px',
              fontWeight: '500',
              position: 'relative',
              animation: 'shake 0.4s ease-in-out'
            }}>
              <svg 
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#c53030" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}
          
          <div style={{ 
            display: 'flex', 
            gap: '12px',
            marginTop: '8px'
          }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              style={{
                padding: '13px 24px',
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                background: 'white',
                color: '#4a5568',
                fontSize: '15px',
                fontWeight: '600',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                flex: '0 0 auto',
                minWidth: '100px',
                opacity: isSaving ? 0.5 : 1
              }}
              onMouseOver={e => {
                if (!isSaving) {
                  e.currentTarget.style.background = '#f7fafc';
                  e.currentTarget.style.borderColor = '#cbd5e0';
                }
              }}
              onMouseOut={e => {
                if (!isSaving) {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: '13px 28px',
                borderRadius: '12px',
                border: 'none',
                background: isSaving ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '15px',
                fontWeight: '600',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(102, 126, 234, 0.4)',
                flex: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseOver={e => {
                if (!isSaving) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                }
              }}
              onMouseOut={e => {
                if (!isSaving) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(102, 126, 234, 0.4)';
                }
              }}
            >
              {isSaving ? (
                <>
                  <svg style={{ animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Creating Map...
                </>
              ) : (
                <>
                  Create Map & Add Zones
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default NewMapForm;