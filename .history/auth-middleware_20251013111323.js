/**
 * Authentication Middleware
 * 
 * This middleware verifies JWT tokens for protected routes
 */

import jwt from 'jsonwebtoken';

// Secret key for JWT signing and verification
const JWT_SECRET = process.env.JWT_SECRET || 'mapit-development-secret-key';

// Middleware to authenticate JWT token
export function authenticateToken(req, res, next) {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    
    // Store the user data in the request object
    req.user = user;
    next();
  });
}

// Generate JWT token for a user
export function generateToken(user) {
  // Remove sensitive data
  const userData = {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name
  };
  
  // Sign the token with 24-hour expiry
  return jwt.sign(userData, JWT_SECRET, { expiresIn: '24h' });
}