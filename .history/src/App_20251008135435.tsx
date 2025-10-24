import { useState, useEffect } from 'react';
import './App.css';
import './AppNavBar.css';

import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import AppNavBar from './components/AppNavBar';
import RegisterPage from './pages/RegisterPage';
import MapPageWithSidebar from './pages/MapPageWithSidebar';
import DashboardPage from './pages/DashboardPage';
import CreateMapPageWithBoundary from './pages/CreateMapPage';
import { AuthProvider } from './AuthContext';

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Logging in...');
    setError('');
    
    try {
      const response = await fetch('http://localhost:3101/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Save user data in localStorage
      localStorage.setItem('mapit_user', JSON.stringify(data.user));
      
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
  // Use DashboardPage instead of UserMaps to show all maps
  return <DashboardPage />;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('mapit_logged_in') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('mapit_logged_in', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  return (
    <Router>
      <AppNavBar onLogout={() => setIsLoggedIn(false)} />
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="login" element={<LoginPage onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/create-map" element={isLoggedIn ? <CreateMapPageWithBoundary /> : <LoginPage onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/view-map/:id" element={isLoggedIn ? <MapPageWithSidebar /> : <LoginPage onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/edit-map/:id" element={isLoggedIn ? <MapPageWithSidebar /> : <LoginPage onLogin={() => setIsLoggedIn(true)} />} />
        <Route path="/" element={isLoggedIn ? <HomePage /> : <LoginPage onLogin={() => setIsLoggedIn(true)} />} />
      </Routes>
    </Router>
  );
};

export default App;
