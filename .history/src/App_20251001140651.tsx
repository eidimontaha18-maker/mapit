import { useState, useEffect } from 'react';
import mapitLogo from './assets/mapit-logo.svg';
import './App.css';
import './AppNavBar.css';
import { DatabaseStatusComponent } from './components/DatabaseStatus';
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

const HomePage = ({ onLogout }: { onLogout: () => void }) => {
  const [mapState, setMapState] = useState({ lat: 20, lng: 0, zoom: 2 });

  const handleCountrySearch = (lat: number, lng: number, zoom: number) => {
    setMapState({ lat, lng, zoom });
  };

  return (
    <div>
      <nav className="app-navbar">
        <div className="app-navbar-logo">
          <img src={mapitLogo} alt="MapIt Logo" />
        </div>
        <div className="app-navbar-actions">
          <button className="app-navbar-logout" onClick={() => { localStorage.removeItem('mapit_logged_in'); onLogout(); }}>Logout</button>
        </div>
      </nav>
      <WorldMap lat={mapState.lat} lng={mapState.lng} zoom={mapState.zoom} />
      <CountrySidebar onSearch={handleCountrySearch} />
      <div className="main-content">
        <h2 style={{ marginTop: '2rem', color: '#2d7be5' }}>Welcome to MapIt!</h2>
        <DatabaseStatusComponent />
        <div className="card">
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </div>
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
        <Route path="/" element={isLoggedIn ? <HomePage onLogout={() => setIsLoggedIn(false)} /> : <LoginPage onLogin={() => setIsLoggedIn(true)} />} />
      </Routes>
    </Router>
  );
};

export default App;