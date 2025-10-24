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
          <h1>My Maps Dashboard</h1>
          <button onClick={() => setShowNewMapForm(true)} className="create-map-btn" style={{
            padding: '10px 20px',
            background: '#4f8cff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            margin: '20px 0'
          }}>Create New Map</button>
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
