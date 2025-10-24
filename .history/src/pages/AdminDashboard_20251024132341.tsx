import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from '../utils/notification';
import '../styles/AdminDashboard.css';

interface Map {
  map_id: number;
  title: string;
  description: string;
  map_code: string;
  created_at: string;
  active: boolean;
  country: string;
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  registration_date: string;
  zone_count: number;
}

interface Stats {
  totalMaps: number;
  totalCustomers: number;
  totalZones: number;
  activeMaps: number;
}

const AdminDashboard = () => {
  const [maps, setMaps] = useState<Map[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Map>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const navigate = useNavigate();
  const itemsPerPage = 10;

  useEffect(() => {
    // Check if user is admin
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin || isAdmin !== 'true') {
      navigate('/login');
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Fetch maps and stats in parallel
      const [mapsResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/maps'),
        fetch('/api/admin/stats')
      ]);

      if (!mapsResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const mapsData = await mapsResponse.json();
      const statsData = await statsResponse.json();

      if (mapsData.success) {
        setMaps(mapsData.maps);
      }

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: keyof Map) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleViewMap = (mapId: number) => {
    window.open(`/view-map/${mapId}`, '_blank');
  };

  // Filter and sort maps
  const filteredMaps = maps
    .filter(map => {
      // Apply active filter
      if (filterActive === 'active' && !map.active) return false;
      if (filterActive === 'inactive' && map.active) return false;

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          map.title.toLowerCase().includes(term) ||
          map.email.toLowerCase().includes(term) ||
          map.first_name.toLowerCase().includes(term) ||
          map.last_name.toLowerCase().includes(term) ||
          (map.country && map.country.toLowerCase().includes(term))
        );
      }

      return true;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Pagination
  const totalPages = Math.ceil(filteredMaps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMaps = filteredMaps.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Stats Cards */}
      {stats && (
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon stat-icon-maps">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Total Maps</h3>
              <p className="stat-value">{stats.totalMaps}</p>
              <span className="stat-label">{stats.activeMaps} active</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-customers">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Total Customers</h3>
              <p className="stat-value">{stats.totalCustomers}</p>
              <span className="stat-label">registered users</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-zones">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div className="stat-content">
              <h3>Total Zones</h3>
              <p className="stat-value">{stats.totalZones}</p>
              <span className="stat-label">drawn on maps</span>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="dashboard-controls">
        <div className="search-bar">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
          <input
            type="text"
            placeholder="Search by title, customer, email, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterActive === 'all' ? 'active' : ''}`}
            onClick={() => setFilterActive('all')}
          >
            All Maps
          </button>
          <button
            className={`filter-btn ${filterActive === 'active' ? 'active' : ''}`}
            onClick={() => setFilterActive('active')}
          >
            Active
          </button>
          <button
            className={`filter-btn ${filterActive === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilterActive('inactive')}
          >
            Inactive
          </button>
        </div>

        <button className="btn-refresh" onClick={fetchData}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </div>
      )}

      {/* Maps Table */}
      <div className="table-container">
        <div className="table-header">
          <h2>All Maps ({filteredMaps.length})</h2>
        </div>

        <div className="table-responsive">
          <table className="maps-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('map_id')}>
                  ID {sortField === 'map_id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('title')}>
                  Map Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('email')}>
                  Customer {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('country')}>
                  Country {sortField === 'country' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('zone_count')}>
                  Zones {sortField === 'zone_count' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th onClick={() => handleSort('created_at')}>
                  Created {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMaps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="no-data">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    <p>No maps found</p>
                  </td>
                </tr>
              ) : (
                paginatedMaps.map((map) => (
                  <tr key={map.map_id}>
                    <td className="cell-id">{map.map_id}</td>
                    <td className="cell-title">
                      <div className="title-wrapper">
                        <strong>{map.title}</strong>
                        {map.description && (
                          <span className="description">{map.description}</span>
                        )}
                      </div>
                    </td>
                    <td className="cell-customer">
                      <div className="customer-info">
                        <span className="customer-name">{map.first_name} {map.last_name}</span>
                        <span className="customer-email">{map.email}</span>
                      </div>
                    </td>
                    <td>{map.country || '-'}</td>
                    <td className="cell-zones">
                      <span className="badge badge-zones">{map.zone_count}</span>
                    </td>
                    <td className="cell-date">{formatDate(map.created_at)}</td>
                    <td>
                      <span className={`badge ${map.active ? 'badge-active' : 'badge-inactive'}`}>
                        {map.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="cell-actions">
                      <button
                        className="btn-action btn-copy"
                        onClick={() => {
                          const mapUrl = `${window.location.origin}/view-map/${map.map_id}`;
                          navigator.clipboard.writeText(mapUrl);
                          alert('Map link copied to clipboard!');
                        }}
                        title="Copy Map Link"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                      </button>
                      <button
                        className="btn-action btn-view"
                        onClick={() => handleViewMap(map.map_id)}
                        title="View Map"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            <div className="pagination-info">
              Page {currentPage} of {totalPages}
            </div>
            
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
