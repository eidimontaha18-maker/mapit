
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './formStyles.css';

interface RegisterResponse {
  success?: boolean;
  error?: string | null;
}

interface Package {
  package_id: number;
  name: string;
  price: number;
  allowed_maps: number;
  priority: number;
  active: boolean;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    package_id: ''
  });
  const [status, setStatus] = useState<string>('');
  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Fetch packages on component mount
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        console.log('Fetching packages from API...');
        const response = await fetch('/api/packages');
        console.log('Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('Response text:', text);
        
        const data = JSON.parse(text);
        console.log('Parsed data:', data);
        
        if (data.success) {
          setPackages(data.packages);
          // Auto-select the free package by default
          const freePackage = data.packages.find((pkg: Package) => pkg.name === 'free');
          if (freePackage) {
            setForm(prev => ({ ...prev, package_id: freePackage.package_id.toString() }));
          }
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        setStatus('Unable to load packages. Please refresh the page.');
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  // Save customer to backend API using Vite proxy
  const saveCustomer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatus('Saving...');
    
    // Form validation
    if (!form.first_name || !form.last_name || !form.email || !form.password || !form.package_id) {
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
        body: JSON.stringify({
          ...form,
          package_id: parseInt(form.package_id)
        })
      });
      
      console.log('📨 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data: RegisterResponse = await response.json();
      console.log('📄 Response data:', data);
      
      if (data.success) {
        setStatus('✅ Registration successful! Redirecting to login...');
        setForm({ first_name: '', last_name: '', email: '', password: '', package_id: '' });
        
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
      <Link to="/" className="back-home">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Back to Home
      </Link>
      <h2>Create Account</h2>
      <p style={{ color: 'white', marginBottom: '2rem', textAlign: 'center', fontSize: '1.1rem', opacity: 0.9 }}>
        Start creating custom maps with one free map included!
      </p>
      <form onSubmit={saveCustomer}>
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          required
          disabled={status.includes('Saving') || status.includes('Redirecting')}
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          required
          disabled={status.includes('Saving') || status.includes('Redirecting')}
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
          disabled={status.includes('Saving') || status.includes('Redirecting')}
        />
        <input
          type="password"
          name="password"
          placeholder="Password (min. 6 characters)"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          disabled={status.includes('Saving') || status.includes('Redirecting')}
        />
        
        {/* Package Selection */}
        <div className="package-selection">
          <label className="package-label">Choose Your Package:</label>
          {loadingPackages ? (
            <p style={{ textAlign: 'center', color: '#95a5a6' }}>Loading packages...</p>
          ) : (
            <div className="packages-grid">
              {packages.map((pkg) => (
                <div
                  key={pkg.package_id}
                  className={`package-card ${form.package_id === pkg.package_id.toString() ? 'selected' : ''}`}
                  onClick={() => setForm(prev => ({ ...prev, package_id: pkg.package_id.toString() }))}
                >
                  <div className="package-header">
                    <h4 className="package-name">{pkg.name.toUpperCase()}</h4>
                    <div className="package-price">
                      ${typeof pkg.price === 'number' ? pkg.price.toFixed(2) : parseFloat(pkg.price).toFixed(2)}
                      {pkg.name === 'free' && <span className="price-period">Forever</span>}
                      {pkg.name !== 'free' && <span className="price-period">/month</span>}
                    </div>
                  </div>
                  <div className="package-features">
                    <div className="feature">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>{pkg.allowed_maps} {pkg.allowed_maps === 1 ? 'Map' : 'Maps'}</span>
                    </div>
                    <div className="feature">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      <span>Unlimited Zones</span>
                    </div>
                    {pkg.name === 'premium' && (
                      <div className="feature">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        <span>Priority Support</span>
                      </div>
                    )}
                  </div>
                  {form.package_id === pkg.package_id.toString() && (
                    <div className="selected-badge">✓ Selected</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button type="submit" disabled={status.includes('Saving') || status.includes('Redirecting') || !form.package_id}>
          {status.includes('Saving') ? 'Creating Account...' : status.includes('Redirecting') ? 'Success!' : 'Create Account'}
        </button>
      </form>
      {status && (
        <div 
          className={status.includes('Error') || status.includes('❌') ? 'error' : 'status'}
        >
          {status}
        </div>
      )}
      <p>Already have an account? <Link to="/login">Sign In</Link></p>
    </div>
  );
};

export default RegisterPage;
