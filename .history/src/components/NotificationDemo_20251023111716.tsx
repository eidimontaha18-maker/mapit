import React from 'react';
import { notification } from '../utils/notification';

/**
 * NotificationDemo - A demo page showcasing the modern notification system
 * This component demonstrates all notification types and options
 */
const NotificationDemo: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '48px',
        maxWidth: '800px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <h1 style={{
          fontSize: '36px',
          fontWeight: '700',
          marginBottom: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Modern Notification System 🎨
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          Click the buttons below to test different notification types and positions
        </p>

        {/* Basic Notifications */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#333'
          }}>
            Basic Notifications
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            <button
              onClick={() => notification.success('Operation completed successfully!')}
              style={getButtonStyle('#667eea')}
            >
              ✓ Success
            </button>
            <button
              onClick={() => notification.error('Something went wrong!')}
              style={getButtonStyle('#f5576c')}
            >
              ✕ Error
            </button>
            <button
              onClick={() => notification.warning('Please check your input')}
              style={getButtonStyle('#fa709a')}
            >
              ⚠ Warning
            </button>
            <button
              onClick={() => notification.info('This is informational')}
              style={getButtonStyle('#4facfe')}
            >
              ℹ Info
            </button>
          </div>
        </div>

        {/* Position Examples */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#333'
          }}>
            Position Options
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px'
          }}>
            <button
              onClick={() => notification.success('Top Left!', { position: 'top-left' })}
              style={getButtonStyle('#667eea')}
            >
              Top Left
            </button>
            <button
              onClick={() => notification.info('Top Center!', { position: 'top-center' })}
              style={getButtonStyle('#4facfe')}
            >
              Top Center
            </button>
            <button
              onClick={() => notification.success('Top Right!', { position: 'top-right' })}
              style={getButtonStyle('#667eea')}
            >
              Top Right
            </button>
            <button
              onClick={() => notification.warning('Bottom Left!', { position: 'bottom-left' })}
              style={getButtonStyle('#fa709a')}
            >
              Bottom Left
            </button>
            <button
              onClick={() => notification.info('Bottom Center!', { position: 'bottom-center' })}
              style={getButtonStyle('#4facfe')}
            >
              Bottom Center
            </button>
            <button
              onClick={() => notification.warning('Bottom Right!', { position: 'bottom-right' })}
              style={getButtonStyle('#fa709a')}
            >
              Bottom Right
            </button>
          </div>
        </div>

        {/* Duration Examples */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#333'
          }}>
            Duration Options
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            <button
              onClick={() => notification.info('Quick (2s)', { duration: 2000 })}
              style={getButtonStyle('#4facfe')}
            >
              Quick (2s)
            </button>
            <button
              onClick={() => notification.success('Normal (4s)', { duration: 4000 })}
              style={getButtonStyle('#667eea')}
            >
              Normal (4s)
            </button>
            <button
              onClick={() => notification.warning('Long (8s)', { duration: 8000 })}
              style={getButtonStyle('#fa709a')}
            >
              Long (8s)
            </button>
            <button
              onClick={() => notification.info('No Auto-close', { duration: 0 })}
              style={getButtonStyle('#4facfe')}
            >
              No Auto-close
            </button>
          </div>
        </div>

        {/* Real-world Examples */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#333'
          }}>
            Real-world Examples
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            <button
              onClick={() => notification.success('Map saved successfully!', { duration: 3000 })}
              style={getButtonStyle('#667eea')}
            >
              Map Saved
            </button>
            <button
              onClick={() => notification.error('Failed to connect to server', { duration: 5000 })}
              style={getButtonStyle('#f5576c')}
            >
              Connection Error
            </button>
            <button
              onClick={() => notification.warning('Please enter a zone name', { duration: 3000 })}
              style={getButtonStyle('#fa709a')}
            >
              Form Validation
            </button>
            <button
              onClick={() => notification.info('Zone created successfully', { duration: 3000 })}
              style={getButtonStyle('#4facfe')}
            >
              Zone Created
            </button>
            <button
              onClick={() => notification.success('Changes saved', { duration: 2000 })}
              style={getButtonStyle('#667eea')}
            >
              Auto-save
            </button>
            <button
              onClick={() => notification.error('Invalid credentials', { duration: 4000 })}
              style={getButtonStyle('#f5576c')}
            >
              Login Failed
            </button>
          </div>
        </div>

        {/* Special Options */}
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#333'
          }}>
            Special Options
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px'
          }}>
            <button
              onClick={() => notification.success('No progress bar', { showProgress: false })}
              style={getButtonStyle('#667eea')}
            >
              No Progress Bar
            </button>
            <button
              onClick={() => {
                notification.success('First notification');
                setTimeout(() => notification.info('Second notification'), 500);
                setTimeout(() => notification.warning('Third notification'), 1000);
              }}
              style={getButtonStyle('#4facfe')}
            >
              Multiple Stacked
            </button>
            <button
              onClick={() => notification.clearAll()}
              style={getButtonStyle('#f5576c')}
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderRadius: '12px',
          fontSize: '14px',
          color: '#666',
          lineHeight: '1.6'
        }}>
          <strong>💡 Tips:</strong>
          <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
            <li>Click on any notification to dismiss it instantly</li>
            <li>The progress bar shows time remaining</li>
            <li>Notifications stack nicely on top of each other</li>
            <li>Use appropriate notification types for better UX</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Helper function for consistent button styling
const getButtonStyle = (color: string): React.CSSProperties => ({
  padding: '12px 20px',
  background: `linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%)`,
  color: 'white',
  border: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  transition: 'all 0.3s ease',
  boxShadow: `0 4px 15px ${color}40`,
  ':hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 6px 20px ${color}60`
  }
});

// Helper to adjust color brightness
const adjustColor = (color: string, percent: number): string => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
};

export default NotificationDemo;
