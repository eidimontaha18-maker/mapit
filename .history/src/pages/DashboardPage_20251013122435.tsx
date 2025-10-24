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
    
    // Fetch maps using the correct API endpoint
    fetch(`/api/db/tables/map?customer_id=${user.customer_id}`)
      .then((res) => {
        console.log('API response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('API response data:', data);
        // The API returns { records: [...] }
        setMaps(data.records || data || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching maps:', error);
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
            <h1 style={{ 
              fontSize: 'clamp(24px, 5vw, 32px)', 
              color: '#000', 
              fontWeight: '700', 
              margin: '0',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
            }}>
              My Maps Dashboard
            </h1>
            
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
                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3' }}>{map.title}</td>
                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3' }}>
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {map.description || '-'}
                        </div>
                      </td>
                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3' }}>{map.country || '-'}</td>
                      <td style={{ padding: '16px', borderBottom: '1px solid #eaedf3' }}>{map.created_at?.slice(0, 10) || '-'}</td>
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
              padding: '40px', 
              textAlign: 'center', 
              color: '#4a5568',
              background: '#f9fafc',
              borderRadius: '12px',
              border: '1px dashed #d1d8e4',
              margin: '20px 0'
            }}>
              <p style={{ fontSize: '16px', marginBottom: '16px' }}>You don't have any maps yet</p>
              <p style={{ fontSize: '14px', color: '#718096' }}>Click the 'Create New Map' button to get started</p>
            </div>
          )}
        </>
      )}
      </div>
    </>
  );
};

export default DashboardPage;
