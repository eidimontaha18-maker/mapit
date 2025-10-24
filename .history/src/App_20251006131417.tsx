import { useState, useEffect } from 'react';
import './App.css';
import './AppNavBar.css';

import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import AppNavBar from './components/AppNavBar';
import RegisterPage from './pages/RegisterPage';
import MapPageWithSidebar from './pages/MapPageWithSidebar';
import UserMaps from './pages/UserMaps';
import CreateMapPageWithBoundary from './pages/CreateMapPage';

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
      <p>Do not have an account? <Link to="/register">Register</Link></p>
    </div>
  );
};

const HomePage = () => {
  return <UserMaps />;
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
