
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './formStyles.css';

interface RegisterResponse {
  success?: boolean;
  error?: string | null;
}

// Use absolute URL in development - we'll try multiple ports if needed
const API_PORTS = [3101, 3000, 3002, 8080];
const API_BASE = 'http://localhost:';
const API_URL = `${API_BASE}${API_PORTS[0]}`; // Start with first port

// Debug info for troubleshooting
console.log('RegisterPage loaded. Will try these API URLs:', API_PORTS.map(port => `${API_BASE}${port}`));

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  const [status, setStatus] = useState<string>('');

  // Save customer to backend API
  const saveCustomer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatus('Saving...');
    console.log('Submitting form data to API:', `${API_URL}/api/register`);
    console.log('Form data:', form);
    
    try {
      // Use direct URL to bypass proxy issues in development
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        mode: 'cors' // Explicitly set CORS mode
      });
      
      console.log('Response status:', response.status);
      const contentType = response.headers.get('content-type') || '';
      console.log('Response content-type:', contentType);
      
      if (contentType.includes('application/json')) {
        let data: RegisterResponse = {};
        try {
          data = await response.json();
          console.log('Response data:', data);
        } catch (err) {
          console.error('JSON parse error:', err);
          return setStatus('Error: Invalid JSON response');
        }
        
        if (data.success) {
          setStatus('Registration successful!');
          setForm({ first_name: '', last_name: '', email: '', password: '' });
        } else {
          setStatus('Error: ' + (data.error || `HTTP ${response.status}`));
        }
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        setStatus('Error: Non-JSON response (status ' + response.status + ') ' + text.slice(0, 120));
      }
    } catch (err: unknown) {
      console.error('Registration error:', err);
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        setStatus(`Error: Cannot connect to server at ${API_URL}. Make sure the server is running.`);
      } else {
        setStatus('Error: ' + (err instanceof Error ? err.message : String(err)));
      }
    }
  };

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="form-container">
      <h2>Customer Registration</h2>
      <form onSubmit={saveCustomer}>
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
      </form>
      {status && (
        <div className="status" style={{
          padding: '10px', 
          margin: '10px 0',
          backgroundColor: status.includes('Error') ? '#ffdddd' : '#ddffdd',
          borderRadius: '4px'
        }}>
          {status}
        </div>
      )}
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};

export default RegisterPage;
