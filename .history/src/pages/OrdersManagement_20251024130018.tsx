import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/OrdersManagement.css';

interface Order {
  order_id: number;
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  package_id: number;
  package_name: string;
  price: string;
  allowed_maps: number;
  order_date: string;
  total: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const OrdersManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin || isAdmin !== 'true') {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.package_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-badge status-completed';
      case 'pending':
        return 'status-badge status-pending';
      case 'cancelled':
        return 'status-badge status-cancelled';
      default:
        return 'status-badge';
    }
  };

  if (loading) {
    return (
      <div className="orders-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-management">
      <div className="orders-header">
        <div>
          <h1>Orders Management</h1>
          <p>View and manage all customer orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="orders-filters">
        <div className="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Search by customer name, email, or package..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="status-filter">
          <button
            className={statusFilter === 'all' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setStatusFilter('all')}
          >
            All Orders
          </button>
          <button
            className={statusFilter === 'completed' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
          <button
            className={statusFilter === 'pending' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </button>
          <button
            className={statusFilter === 'cancelled' ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setStatusFilter('cancelled')}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Package</th>
              <th>Price</th>
              <th>Maps Allowed</th>
              <th>Order Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="no-data">
                  No orders found
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.order_id}>
                  <td>#{order.order_id}</td>
                  <td>{order.first_name} {order.last_name}</td>
                  <td>{order.email}</td>
                  <td>
                    <span className="package-name">{order.package_name.toUpperCase()}</span>
                  </td>
                  <td>${parseFloat(order.price).toFixed(2)}</td>
                  <td>{order.allowed_maps}</td>
                  <td>{new Date(order.order_date).toLocaleDateString()}</td>
                  <td>
                    <span className={getStatusBadgeClass(order.status)}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="orders-summary">
        <div className="summary-card">
          <h3>Total Orders</h3>
          <p className="summary-value">{orders.length}</p>
        </div>
        <div className="summary-card">
          <h3>Completed</h3>
          <p className="summary-value">{orders.filter(o => o.status === 'completed').length}</p>
        </div>
        <div className="summary-card">
          <h3>Pending</h3>
          <p className="summary-value">{orders.filter(o => o.status === 'pending').length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Revenue</h3>
          <p className="summary-value">
            ${orders.reduce((sum, order) => sum + parseFloat(order.price), 0).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrdersManagement;
