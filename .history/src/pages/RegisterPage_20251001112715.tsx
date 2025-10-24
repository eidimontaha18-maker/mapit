import React, { useState } from 'react';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  const [status, setStatus] = useState<string>('');

  // Save customer to backend API
  const saveCustomer = async () => {
    setStatus('Saving...');
    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (data.success) {
        setStatus('Registration successful!');
      } else {
        setStatus('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (err: unknown) {
      setStatus('Error: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Handle form change and auto-save
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      // Save automatically when all fields are filled
      if (
        updated.first_name &&
        updated.last_name &&
        updated.email &&
        updated.password
      ) {
        saveCustomer();
      }
      return updated;
    });
  };

  return (
    <div className="register-page">
      <h2>Customer Registration</h2>
      <form>
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
      </form>
      <div className="status">{status}</div>
    </div>
  );
};

export default RegisterPage;
