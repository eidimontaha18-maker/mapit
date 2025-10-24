
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './formStyles.css';

interface RegisterResponse {
  success?: boolean;
  error?: string | null;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  const [status, setStatus] = useState<string>('');

  // Save customer to backend API using Vite proxy
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
    
    console.log('📤 Registering user via API proxy...');
    console.log('📝 Form data:', form);
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      console.log('📨 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data: RegisterResponse = await response.json();
      console.log('📄 Response data:', data);
      
      if (data.success) {
        setStatus('✅ Registration successful! Redirecting to login...');
        setForm({ first_name: '', last_name: '', email: '', password: '' });
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setStatus('❌ Error: ' + (data.error || 'Registration failed'));
      }
        
    } catch (err) {
      console.error('💥 Registration error:', err);
      setStatus('❌ Error: Cannot connect to server. Make sure it\'s running on port 3101.');
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
        <div 
          className="status" 
          style={{
            padding: '10px', 
            margin: '10px 0',
            backgroundColor: status.includes('Error') || status.includes('❌') ? '#ffdddd' : '#ddffdd',
            borderRadius: '4px',
            border: status.includes('Error') || status.includes('❌') ? '1px solid #ff6b6b' : '1px solid #51cf66'
          }}
        >
          {status}
        </div>
      )}
      <p>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};

export default RegisterPage;
