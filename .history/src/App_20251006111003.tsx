import { useState, useEffect } from 'react';
import mapitLogo from './assets/mapit-logo.svg';
import './App.css';
import './AppNavBar.css';

import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import AppNavBar from './components/AppNavBar';
import CreateMapPage from './pages/CreateMapPage';
import RegisterPage from './pages/RegisterPage';
import CountrySidebar from './components/CountrySidebar';
import WorldMap from './components/WorldMap';

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Logging in...');
    // Simulate login success (replace with real API call)
    setTimeout(() => {
      setStatus('');
      onLogin();
      navigate('/');
    }, 500);
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
      {status && <div className="status">{status}</div>}
      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  );
};

interface CityMarker {
  name: string;
  lat: number;
  lng: number;
  country: string;
  isCapital?: boolean;
}

const HomePage = ({ onLogout }: { onLogout: () => void }) => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(135deg, #e3eafc 0%, #b6d0f7 100%)', display: 'flex', flexDirection: 'column' }}>
      <AppNavBar onLogout={() => { localStorage.removeItem('mapit_logged_in'); onLogout(); }} />
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <button
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '18px',
            fontSize: '4em',
            background: '#e0e0e0',
            color: '#888',
            border: 'none',
            boxShadow: '0 4px 24px rgba(120,120,120,0.10)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Create a new map"
          onClick={() => navigate('/create-map')}
          onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          +
        </button>
      </div>
      <style>{`
        @media (max-width: 600px) {
          div[style*='flex: 1'] button {
            width: 80px !important;
            height: 80px !important;
            font-size: 2.5em !important;
          }
        }
      `}</style>
    </div>
  );
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
        <Route path="/create-map" element={<CreateMapPage />} />
        <Route path="/" element={isLoggedIn ? <HomePage onLogout={() => setIsLoggedIn(false)} /> : <LoginPage onLogin={() => setIsLoggedIn(true)} />} />
      </Routes>
    </Router>
  );
};

export default App;