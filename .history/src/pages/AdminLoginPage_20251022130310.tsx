import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminLogin.css';

const AdminLoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Logging in...');
    setError('');
    setIsLoading(true);
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('Admin login successful:', data.admin);
        
        // Store admin info in localStorage
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        localStorage.setItem('isAdmin', 'true');
        
        setStatus('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 500);
      } else {
        setError(data.error || 'Invalid admin credentials');
        setStatus('');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timeout. Please check your connection.');
      } else {
        setError('Failed to connect to server. Please try again.');
      }
      setStatus('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
          </div>
          <h1>Admin Portal</h1>
          <p>Sign in to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@mapit.com"
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {error}
            </div>
          )}

          {status && !error && (
            <div className="alert alert-success">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {status}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-admin-login"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>Protected area - Admin access only</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
