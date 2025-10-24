import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  useEffect(() => {
    // Add logging to debug API call
    console.log('Fetching maps from API...');
    // Update to use PostgREST format
    fetch('/map')
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
  }, []);

  const handleView = (id: number) => {
    navigate(`/view-map/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/edit-map/${id}`);
  };

  return (
    <div className="dashboard-page">
      <h1>My Maps Dashboard</h1>
      <button onClick={() => navigate('/create-map')}>Create New Map</button>
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
    </div>
  );
};

export default DashboardPage;
