import React, { useState, useEffect } from 'react';
import './App.css';
import './AppNavBar.css';

import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import MapPageWithSidebar from './pages/MapPageWithSidebar';
import DashboardPage from './pages/DashboardPage';
import CreateMapPageWithBoundary from './pages/CreateMapPage';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './AuthContext';
import { useAuth } from './hooks/useAuth';

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Logging in...');
    setError('');
    
    try {
      console.log(`Trying to login via /api/login`);
      // Use AbortController for a fetch timeout (more widely supported than AbortSignal.timeout)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      // First try customer login
      let response = await fetch('/api/login', {
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

      // clear the timeout once the response arrives
      clearTimeout(timeout);
      
      // Check if response has content before parsing JSON
      let text = await response.text();
      console.log('Login response text:', text);
      
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }
    
      // If customer login fails, try admin login
      if (!response.ok || !data.success) {
        console.log('Customer login failed, trying admin login...');
        
        const adminController = new AbortController();
        const adminTimeout = setTimeout(() => adminController.abort(), 5000);

        response = await fetch('/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password
          }),
          signal: adminController.signal
        });

        clearTimeout(adminTimeout);
        
        text = await response.text();
        console.log('Admin login response text:', text);
        
        try {
          data = text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error('Failed to parse admin response:', parseError);
          throw new Error('Invalid response from server');
        }
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Invalid email or password');
        }
        
        // Admin login successful
        console.log('Admin login successful');
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        localStorage.setItem('isAdmin', 'true');
        
        setStatus('');
        onLogin();
        navigate('/admin/dashboard');
        return;
      }
      
      // Customer login was successful
      console.log('Customer login successful');
      
      // Use the login function from AuthContext
      login(data.user);
      
      setStatus('');
      onLogin();
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      setStatus('');
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit" disabled={status !== ''}>Login</button>
      </form>
      {status && <div className="status">{status}</div>}
      {error && <div className="error">{error}</div>}
      <p>Do not have an account? <Link to="/register">Register</Link></p>
    </div>
  );
};

const HomePage = () => {
  // This component renders the DashboardPage for both / and /dashboard routes
  return <DashboardPage />;
};

// Routes component that uses AuthContext
const AppRoutes = () => {
  const { isLoggedIn } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin on mount and when localStorage changes
  useEffect(() => {
    const checkAdmin = () => {
      const adminStatus = localStorage.getItem('isAdmin');
      setIsAdmin(adminStatus === 'true');
    };
    
    checkAdmin();
    
    // Listen for storage changes (in case admin logs in/out in another tab)
    window.addEventListener('storage', checkAdmin);
    return () => window.removeEventListener('storage', checkAdmin);
  }, []);

  const isAuthorized = isLoggedIn || isAdmin;

  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage onLogin={() => {}} />} />
      <Route path="login" element={<LoginPage onLogin={() => {}} />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/dashboard" element={isLoggedIn ? <HomePage /> : <LoginPage onLogin={() => {}} />} />
      <Route path="/create-map" element={isLoggedIn ? <CreateMapPageWithBoundary /> : <LoginPage onLogin={() => {}} />} />
      <Route path="/view-map/:id" element={isAuthorized ? <MapPageWithSidebar /> : <LoginPage onLogin={() => {}} />} />
      <Route path="/edit-map/:id" element={isLoggedIn ? <MapPageWithSidebar /> : <LoginPage onLogin={() => {}} />} />
      <Route path="/" element={isLoggedIn ? <HomePage /> : <LoginPage onLogin={() => {}} />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
