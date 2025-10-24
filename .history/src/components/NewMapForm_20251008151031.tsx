import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NewMapFormProps {
  onCancel: () => void;
}

const NewMapForm: React.FC<NewMapFormProps> = ({ onCancel }) => {
  const [mapTitle, setMapTitle] = useState('');
  const [mapDescription, setMapDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapTitle.trim()) {
      setError('Title is required');
      return;
    }
    
    // Store the initial map details in session storage
    // to be used on the create-map page
    sessionStorage.setItem('new_map_title', mapTitle);
    sessionStorage.setItem('new_map_description', mapDescription);
    
    // Navigate to the create-map page
    navigate('/create-map');
  };

  return (
    <div className="new-map-form-container" style={{ 
      width: '100%', 
      maxWidth: '600px', 
      margin: '40px auto', 
      padding: '40px', 
      borderRadius: '16px', 
      boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
      background: 'white',
      color: '#000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      <h2 style={{ 
        marginBottom: '32px', 
        textAlign: 'center', 
        color: '#000', 
        fontSize: '28px',
        fontWeight: '700'
      }}>Create New Map</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <label htmlFor="mapTitle" style={{ 
            display: 'block', 
            marginBottom: '10px', 
            fontWeight: '600', 
            color: '#000',
            fontSize: '15px'
          }}>
            Map Title <span style={{ color: '#ff4757' }}>*</span>
          </label>
          <input
            id="mapTitle"
            type="text"
            placeholder="Enter a title for your map"
            value={mapTitle}
            onChange={(e) => {
              setMapTitle(e.target.value);
              if (e.target.value.trim()) setError('');
            }}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid #e1e5eb',
              fontSize: '15px',
              color: '#000',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '32px' }}>
          <label htmlFor="mapDescription" style={{ 
            display: 'block', 
            marginBottom: '10px', 
            fontWeight: '600',
            color: '#000',
            fontSize: '15px'
          }}>
            Description
          </label>
          <textarea
            id="mapDescription"
            placeholder="Add more details about your map (optional)"
            value={mapDescription}
            onChange={(e) => setMapDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '10px',
              border: '1px solid #e1e5eb',
              fontSize: '15px',
              color: '#000',
              minHeight: '140px',
              resize: 'vertical',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
          />
        </div>
        
        {error && (
          <div style={{ 
            color: '#ff4757', 
            marginBottom: '20px',
            padding: '12px 16px',
            background: '#fff8f8',
            borderRadius: '8px',
            borderLeft: '4px solid #ff4757',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          gap: '16px',
          marginTop: '10px'
        }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '14px 24px',
              borderRadius: '10px',
              border: '1px solid #e1e5eb',
              background: 'white',
              color: '#000',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flex: '1',
              maxWidth: '180px'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#f7f9fc'}
            onMouseOut={e => e.currentTarget.style.background = 'white'}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '14px 24px',
              borderRadius: '10px',
              border: 'none',
              background: '#4f8cff',
              color: 'white',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(79,140,255,0.2)',
              flex: '2',
              maxWidth: '400px'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#3a7dff';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(79,140,255,0.3)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#4f8cff';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,140,255,0.2)';
            }}
          >
            Continue to Map Editor
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewMapForm;