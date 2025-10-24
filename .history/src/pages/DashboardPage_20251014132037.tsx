import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NewMapForm from '../components/NewMapForm';
import AppNavBar from '../components/AppNavBar';

export interface MapRecord {
  map_id: number;
  title: string;
  description?: string;
  created_at?: string;
  active?: boolean;
  country?: string;
  zone_count?: number;
}

const DashboardPage: React.FC = () => {
  const [maps, setMaps] = useState<MapRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewMapForm, setShowNewMapForm] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Add logging to debug API call
    console.log('Fetching maps from API...');
    
    // Only fetch maps if user is logged in
    if (!user?.customer_id) {
      setMaps([]);
      setLoading(false);
      return;
    }
    
    // Fetch maps using the new customer-specific endpoint with zone counts
    fetch(`/api/customer/${user.customer_id}/maps`)
      .then(async (res) => {
        console.log('API response status:', res.status);
        
        // Get response text first
        const text = await res.text();
        console.log('API response text:', text.substring(0, 200));
        
        if (!res.ok) {
          console.error('Error response:', text);
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        // Try to parse JSON
        try {
          return text ? JSON.parse(text) : { maps: [] };
        } catch (parseError) {
          console.error('Failed to parse response:', parseError);
          throw new Error('Invalid JSON response from server');
        }
      })
      .then((data) => {
        console.log('API response data:', data);
        // The API returns { success: true, maps: [...] }
        setMaps(data.maps || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching maps:', error);
        setMaps([]);
        setLoading(false);
      });
  }, [user?.customer_id]);

  const handleView = (id: number) => {
    navigate(`/view-map/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/edit-map/${id}`);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete the map "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/db/tables/map/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete map: ${response.status}`);
      }

      // Remove the map from the local state
      setMaps(prev => prev.filter(map => map.map_id !== id));
      
      console.log('Map deleted successfully');
    } catch (error) {
      console.error('Error deleting map:', error);
      alert('Failed to delete map. Please try again.');
    }
  };

  return (
    <>
      <AppNavBar />
      <div className="dashboard-page" style={{ 
      padding: '24px', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      color: '#000',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      paddingTop: '80px',
      paddingBottom: '40px'
    }}>
      {showNewMapForm ? (
        <NewMapForm onCancel={() => setShowNewMapForm(false)} />
      ) : (
        <>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div>
              <h1 style={{ 
                fontSize: 'clamp(24px, 5vw, 32px)', 
                color: '#000', 
                fontWeight: '700', 
                margin: '0 0 8px 0',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}>
                My Maps Dashboard
              </h1>
              {user && (
                <p style={{ 
                  fontSize: '14px', 
                  color: '#718096', 
                  margin: '0',
                  fontWeight: '500'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Logged in as: <span style={{ color: '#4f8cff', fontWeight: '600' }}>{user.email}</span>
                </p>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button 
                onClick={() => window.location.reload()} 
                style={{
                  padding: '14px 18px',
                  background: '#f8f9fa',
                  color: '#4a5568',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#e2e8f0';
                  e.currentTarget.style.borderColor = '#cbd5e0';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                Refresh
              </button>
              
              <button 
                onClick={() => setShowNewMapForm(true)} 
                className="create-map-btn" 
                style={{
                  padding: '14px 24px',
                  background: '#4f8cff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(79,140,255,0.2)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#3a7dff';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(79,140,255,0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#4f8cff';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,140,255,0.2)';
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Create New Map
              </button>
            </div>
          </div>
          
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px',
              color: '#000'
            }}>
              <div style={{ display: 'inline-block', position: 'relative', width: '80px', height: '80px' }}>
                <div style={{
                  position: 'absolute',
                  border: '4px solid #4f8cff',
                  opacity: '0.1',
                  borderRadius: '50%',
                  animation: 'ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite',
                  width: '100%',
                  height: '100%'
                }}></div>
                <div style={{
                  position: 'absolute',
                  border: '4px solid #4f8cff',
                  opacity: '1',
                  borderRadius: '50%',
                  animation: 'ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite',
                  width: '100%',
                  height: '100%',
                  animationDelay: '-0.5s'
                }}></div>
              </div>
              <style>{`
                @keyframes ripple {
                  0% {
                    transform: scale(0);
                    opacity: 1;
                  }
                  100% {
                    transform: scale(1);
                    opacity: 0;
                  }
                }
              `}</style>
            </div>
          ) : maps.length > 0 ? (
            <div className="responsive-table-container" style={{ 
              borderRadius: '12px',
              overflow: 'auto',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              border: '1px solid #eaedf3',
              color: '#000',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '14px',
                minWidth: '800px'
              }}>
                <thead>
                  <tr style={{ background: '#f5f8fb' }}>
                    <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568', borderBottom: '1px solid #eaedf3' }}>Map ID</th>
                    <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568', borderBottom: '1px solid #eaedf3' }}>Title</th>
                    <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568', borderBottom: '1px solid #eaedf3' }}>Description</th>
                    <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568', borderBottom: '1px solid #eaedf3', textAlign: 'center' }}>Zones</th>
                    <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568', borderBottom: '1px solid #eaedf3' }}>Created At</th>
                    <th style={{ padding: '16px', fontWeight: '600', color: '#4a5568', borderBottom: '1px solid #eaedf3' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {maps.map((map, index) => (
                    <tr 
                      key={map.map_id} 
                      style={{ 
                        background: index % 2 === 0 ? 'white' : '#fafbfd',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f0f4f9'}
                      onMouseOut={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#fafbfd'}
                    >
                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3', fontWeight: '600', color: '#4f8cff' }}>#{map.map_id}</td>
                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3', fontWeight: '600' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4f8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          {map.title}
                        </div>
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3' }}>
                        <div style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {map.description || '-'}
                        </div>
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: map.zone_count && map.zone_count > 0 ? '#e6f7ff' : '#f5f5f5',
                          color: map.zone_count && map.zone_count > 0 ? '#1890ff' : '#8c8c8c',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                            <polyline points="2 17 12 22 22 17"></polyline>
                            <polyline points="2 12 12 17 22 12"></polyline>
                          </svg>
                          {map.zone_count || 0}
                        </span>
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3' }}>
                        {map.created_at ? new Date(map.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleView(map.map_id)}
                            style={{
                              padding: '8px 16px',
                              background: '#f0f4f9',
                              color: '#4f8cff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '13px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#e5edfa'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#f0f4f9'}
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleEdit(map.map_id)}
                            style={{
                              padding: '8px 16px',
                              background: '#4f8cff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '13px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#3a7dff'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#4f8cff'}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(map.map_id, map.title)}
                            style={{
                              padding: '8px 16px',
                              background: '#ff4757',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '13px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = '#ff3742'}
                            onMouseOut={(e) => e.currentTarget.style.background = '#ff4757'}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ 
              padding: '60px 40px', 
              textAlign: 'center', 
              color: '#4a5568',
              background: 'linear-gradient(135deg, #f9fafc 0%, #f0f4f8 100%)',
              borderRadius: '16px',
              border: '1px dashed #d1d8e4',
              margin: '20px 0'
            }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                background: '#e2e8f0', 
                borderRadius: '50%', 
                margin: '0 auto 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#2d3748' }}>No Maps Yet</h3>
              <p style={{ fontSize: '16px', marginBottom: '8px', color: '#4a5568' }}>You haven't created any maps yet</p>
              <p style={{ fontSize: '14px', color: '#718096', marginBottom: '24px' }}>Create your first map to start building your collection</p>
              <button 
                onClick={() => setShowNewMapForm(true)}
                style={{
                  padding: '12px 24px',
                  background: '#4f8cff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#3a7dff'}
                onMouseOut={(e) => e.currentTarget.style.background = '#4f8cff'}
              >
                Create Your First Map
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </>
  );
};

export default DashboardPage;
