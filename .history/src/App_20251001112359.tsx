
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import { DatabaseStatusComponent } from './components/DatabaseStatus';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
// Placeholder for Login page
const LoginPage = () => <div style={{padding: '2rem'}}><h2>Login Page</h2><p>Login form goes here.</p></div>;


function App() {
  return (
    <Router>
      <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#f0f0f0', marginBottom: '2rem' }}>
        <Link to="/register"><button>Register</button></Link>
        <Link to="/login"><button>Login</button></Link>
      </nav>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <div>
            <div>
              <a href="https://vite.dev" target="_blank">
                <img src={viteLogo} className="logo" alt="Vite logo" />
              </a>
              <a href="https://react.dev" target="_blank">
                <img src={reactLogo} className="logo react" alt="React logo" />
              </a>
            </div>
            <h1>Vite + React</h1>
            {/* PostgreSQL Connection Status */}
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
        } />
      </Routes>
    </Router>
  );
}

export default App