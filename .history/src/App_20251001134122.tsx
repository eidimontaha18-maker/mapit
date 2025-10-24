import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import mapitLogo from './assets/mapit-logo.svg';
import './AppNavBar.css';
import './App.css';
import { DatabaseStatusComponent } from './components/DatabaseStatus';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';

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
          <Route path="/" element={isLoggedIn ? <HomePage onLogout={() => setIsLoggedIn(false)} /> : <LoginPage onLogin={() => setIsLoggedIn(true)} />} />
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <button type="submit">Login</button>
    const HomePage = ({ onLogout }: { onLogout: () => void }) => (
      <div>
        <nav className="app-navbar">
          <div className="app-navbar-logo">
            <img src={mapitLogo} alt="MapIt Logo" />
            <span className="app-navbar-title">MapIt</span>
          </div>
          <div className="app-navbar-actions">
            <button className="app-navbar-logout" onClick={onLogout}>Logout</button>
          </div>
        </nav>
        <div>
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
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </div>
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
}

export default App