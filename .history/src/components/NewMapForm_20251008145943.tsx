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
      padding: '30px', 
      borderRadius: '12px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      background: 'white'
    }}>
      <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>Create New Map</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="mapTitle" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Map Title *
          </label>
          <input
            id="mapTitle"
            type="text"
            value={mapTitle}
            onChange={(e) => {
              setMapTitle(e.target.value);
              if (e.target.value.trim()) setError('');
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #b6d0f7',
              fontSize: '16px'
            }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '28px' }}>
          <label htmlFor="mapDescription" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Description
          </label>
          <textarea
            id="mapDescription"
            value={mapDescription}
            onChange={(e) => setMapDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #b6d0f7',
              fontSize: '16px',
              minHeight: '120px',
              resize: 'vertical'
            }}
          />
        </div>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '16px' }}>
            {error}
          </div>
        )}
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              background: 'white',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              background: '#4f8cff',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
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