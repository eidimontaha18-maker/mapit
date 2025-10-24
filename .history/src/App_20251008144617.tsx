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
    
    // Use both 127.0.0.1 and localhost with port 3101
    const API_URLS = ['http://127.0.0.1:3101/api/login', 'http://localhost:3101/api/login'];
    
    // Try each URL until one works
    for (const url of API_URLS) {
      try {
        console.log(`Trying to login via ${url}`);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password
          }),
          // Set a short timeout to quickly try the next URL if needed
          signal: AbortSignal.timeout(3500)
        });
        
        const data = await response.json();
      
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Login failed');
        }
        
        // Login was successful
        console.log('Login successful');
        
        // Use the login function from AuthContext
        login(data.user);
        
        setStatus('');
        onLogin();
        navigate('/');
        return; // Exit the function on success
      } catch (err) {
        if (url === API_URLS[API_URLS.length - 1]) {
          // This was our last attempt
          console.error('Login error:', err);
          setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
          setStatus('');
        } else {
          // Try the next URL
          console.log(`Couldn't login via ${url}, trying next URL...`);
          continue;
        }
      }
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
    <AuthProvider>
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
    </AuthProvider>
  );
};

export default App;
