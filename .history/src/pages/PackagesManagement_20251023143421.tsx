import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PackagesManagement.css';

interface Package {
  package_id: number;
  name: string;
  price: string;
  allowed_maps: number;
  priority: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface PackageFormData {
  name: string;
  price: string;
  allowed_maps: number;
  priority: number;
  active: boolean;
}

const PackagesManagement: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    price: '0.00',
    allowed_maps: 1,
    priority: 1,
    active: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin || isAdmin !== 'true') {
      navigate('/login');
      return;
    }

    fetchPackages();
  }, [navigate]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/packages');
      const data = await response.json();
      if (data.success) {
        setPackages(data.packages);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pkg?: Package) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        price: pkg.price,
        allowed_maps: pkg.allowed_maps,
        priority: pkg.priority,
        active: pkg.active
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: '',
        price: '0.00',
        allowed_maps: 1,
        priority: packages.length + 1,
        active: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPackage(null);
    setFormData({
      name: '',
      price: '0.00',
      allowed_maps: 1,
      priority: 1,
      active: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingPackage
        ? `/api/admin/packages/${editingPackage.package_id}`
        : '/api/admin/packages';
      
      const method = editingPackage ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        await fetchPackages();
        handleCloseModal();
        alert(editingPackage ? 'Package updated successfully!' : 'Package created successfully!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Failed to save package');
    }
  };

  const handleDelete = async (pkg: Package) => {
    if (!confirm(`Are you sure you want to delete the "${pkg.name}" package? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/packages/${pkg.package_id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        await fetchPackages();
        alert('Package deleted successfully!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Failed to delete package');
    }
  };

  const handleToggleActive = async (pkg: Package) => {
    try {
      const response = await fetch(`/api/admin/packages/${pkg.package_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...pkg,
          active: !pkg.active
        })
      });

      const data = await response.json();

      if (data.success) {
        await fetchPackages();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error toggling package status:', error);
      alert('Failed to update package status');
    }
  };

  return (
    <div className="packages-management">
      <div className="packages-header">
        <div>
          <h1>Packages Management</h1>
          <p>Manage subscription packages for your customers</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Package
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading packages...</p>
        </div>
      ) : (
        <div className="packages-grid">
          {packages.map((pkg) => (
            <div key={pkg.package_id} className={`package-card ${!pkg.active ? 'inactive' : ''}`}>
              <div className="package-card-header">
                <h3>{pkg.name.toUpperCase()}</h3>
                <div className="package-status">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={pkg.active}
                      onChange={() => handleToggleActive(pkg)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="status-label">{pkg.active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>

              <div className="package-price">
                <span className="price-amount">${parseFloat(pkg.price).toFixed(2)}</span>
                <span className="price-period">{parseFloat(pkg.price) === 0 ? '/forever' : '/month'}</span>
              </div>

              <div className="package-features">
                <div className="feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{pkg.allowed_maps} {pkg.allowed_maps === 1 ? 'map' : 'maps'}</span>
                </div>
                <div className="feature-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Priority: {pkg.priority}</span>
                </div>
              </div>

              <div className="package-meta">
                <small>Created: {new Date(pkg.created_at).toLocaleDateString()}</small>
              </div>

              <div className="package-actions">
                <button className="btn-edit" onClick={() => handleOpenModal(pkg)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit
                </button>
                <button className="btn-delete" onClick={() => handleDelete(pkg)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPackage ? 'Edit Package' : 'Add New Package'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="package-form">
              <div className="form-group">
                <label htmlFor="name">Package Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Basic, Pro, Enterprise"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price (USD) *</label>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="allowed_maps">Allowed Maps *</label>
                  <input
                    type="number"
                    id="allowed_maps"
                    min="1"
                    value={formData.allowed_maps}
                    onChange={(e) => setFormData({ ...formData, allowed_maps: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Priority *</label>
                  <input
                    type="number"
                    id="priority"
                    min="1"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    required
                  />
                  <small>Lower numbers appear first</small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    />
                    <span>Active (visible to customers)</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagesManagement;
