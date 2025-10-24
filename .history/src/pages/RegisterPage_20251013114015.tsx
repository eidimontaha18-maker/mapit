
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './formStyles.css';

interface RegisterResponse {
  success?: boolean;
  error?: string | null;
}

// Use Vite proxy for API calls (much more reliable in development)
console.log('RegisterPage loaded. Using Vite proxy for API calls.');

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  const [status, setStatus] = useState<string>('');

  // Save customer to backend API (tries multiple candidates)
  const saveCustomer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatus('Saving...');
    
    // Form validation
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      setStatus('Error: All fields are required');
      return;
    }
    
    if (form.password.length < 6) {
      setStatus('Error: Password must be at least 6 characters long');
      return;
    }
    
    if (!form.email.includes('@') || !form.email.includes('.')) {
      setStatus('Error: Please enter a valid email address');
      return;
    }
    
    // Try each API base until one works
    for (const base of API_CANDIDATES) {
      const currentUrl = `${base.replace(/\/$/, '')}`;
      console.log(`Trying to connect to API at: ${currentUrl}/api/register`);
      console.log('Form data:', form);
      
      try {
        const response = await fetch(`${currentUrl}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
          mode: 'cors',
          // Short timeout to quickly move to next candidate if this one fails
          signal: AbortSignal.timeout(3500)
        });
        
        console.log(`Response from ${currentUrl} - status:`, response.status);
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
            setStatus('Registration successful! (saved on server)');
            setForm({ first_name: '', last_name: '', email: '', password: '' });
            return; // Success - exit the function
          } else {
            setStatus('Error: ' + (data.error || `HTTP ${response.status}`));
            return; // Got a response but with error - no need to try other ports
          }
        } else {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          setStatus('Error: Non-JSON response (status ' + response.status + ') ' + text.slice(0, 120));
          return; // Got a response but with error - no need to try other ports
        }
      } catch (err: unknown) {
        console.error(`Error connecting to ${currentUrl}:`, err);
        // Continue to next port if connection failed
        // If this was the last candidate
        if (currentUrl === API_CANDIDATES[API_CANDIDATES.length - 1]) {
          setStatus(`Error: Cannot connect to API at any of: ${API_CANDIDATES.join(', ')}. Make sure the server is running.`);
        } else {
          setStatus(`Couldn't connect to ${currentUrl}, trying next address...`);
        }
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
