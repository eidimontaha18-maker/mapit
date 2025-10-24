import React from 'react';

interface SaveMapButtonProps {
  onClick: () => void;
  isVisible: boolean;
  isSaving: boolean;
}

const SaveMapButton: React.FC<SaveMapButtonProps> = ({ onClick, isVisible, isSaving }) => {
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '25px',
        right: '25px',
        zIndex: 1000,
      }}
    >
      <button
        onClick={onClick}
        disabled={isSaving}
        style={{
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          opacity: isSaving ? 0.7 : 1,
          transition: 'all 0.3s ease',
        }}
        onMouseOver={(e) => {
          if (!isSaving) e.currentTarget.style.backgroundColor = '#45a049';
        }}
        onMouseOut={(e) => {
          if (!isSaving) e.currentTarget.style.backgroundColor = '#4CAF50';
        }}
      >
        {isSaving ? (
          <>
            <span 
              style={{ 
                display: 'inline-block', 
                width: '16px', 
                height: '16px', 
                borderRadius: '50%', 
                border: '3px solid rgba(255,255,255,0.3)', 
                borderTopColor: '#fff',
                animation: 'spin 1s linear infinite',
                marginRight: '10px',
              }}
            ></span>
            Saving...
          </>
        ) : (
          <>
            <span style={{ marginRight: '8px' }}>💾</span>
            Save Map to Database
          </>
        )}
      </button>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        `
      }}></style>
    </div>
  );
};

export default SaveMapButton;