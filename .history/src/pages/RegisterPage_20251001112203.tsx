import React, { useState } from 'react';
import { query } from '../db/postgres';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  const [status, setStatus] = useState<string>('');

  // Hash password (simple example, use bcrypt in production)
  const hashPassword = (password: string) => {
    return btoa(password); // For demo only
  };

  // Save customer to database
  const saveCustomer = async () => {
    setStatus('Saving...');
    try {
      const password_hash = hashPassword(form.password);
      await query(
        `INSERT INTO customer (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4)`,
        [form.first_name, form.last_name, form.email, password_hash]
      );
      setStatus('Registration successful!');
    } catch (err: any) {
      setStatus('Error: ' + err.message);
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
