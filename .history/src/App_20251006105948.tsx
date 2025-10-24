import { useState, useEffect } from 'react';
import mapitLogo from './assets/mapit-logo.svg';
import './App.css';
import './AppNavBar.css';

import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
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
  // Only show a creative plus button when logged in
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'linear-gradient(135deg, #4f8cff 0%, #a1e3ff 100%)' }}>
      <button
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          fontSize: '4em',
          background: '#fff',
          color: '#4f8cff',
          border: 'none',
          boxShadow: '0 4px 24px rgba(79,140,255,0.15)',
          cursor: 'pointer',
          transition: 'transform 0.2s',
        }}
        title="Create a new map"
        onClick={() => navigate('/create-map')}
        onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        +
      </button>
      <button
        style={{ marginTop: '32px', background: 'none', border: 'none', color: '#fff', fontSize: '1.2em', textDecoration: 'underline', cursor: 'pointer' }}
        onClick={() => { localStorage.removeItem('mapit_logged_in'); onLogout(); }}
      >Logout</button>
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