import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NewMapForm from '../components/NewMapForm';

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
    
    // Update to use PostgREST format with filter by customer_id
    fetch(`/map?customer_id=eq.${user.customer_id}`)
      .then((res) => {
        console.log('API response status:', res.status);
        return res.json();
      })
      .then((data) => {
        console.log('API response data:', data);
        setMaps(data.records || []);
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

  return (
    <div className="dashboard-page">
      {showNewMapForm ? (
        <NewMapForm onCancel={() => setShowNewMapForm(false)} />
      ) : (
        <>
          <h1 style={{ 
            fontSize: '32px', 
            color: '#000', 
            fontWeight: '700', 
            marginBottom: '24px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
          }}>
            My Maps Dashboard
          </h1>
          
          <button 
            onClick={() => setShowNewMapForm(true)} 
            className="create-map-btn" 
            style={{
              padding: '14px 28px',
              background: '#4f8cff',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              margin: '20px 0 30px',
              boxShadow: '0 4px 12px rgba(79,140,255,0.2)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create New Map
          </button>
          {loading ? (
            <p>Loading maps...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Country</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {maps.map((map) => (
                  <tr key={map.map_id}>
                    <td>{map.title}</td>
                    <td>{map.description}</td>
                    <td>{map.country}</td>
                    <td>{map.created_at?.slice(0, 10)}</td>
                    <td>
                      <button onClick={() => handleView(map.map_id)}>View</button>
                      <button onClick={() => handleEdit(map.map_id)}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;
