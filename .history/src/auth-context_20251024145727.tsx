import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: number;
  customer_id?: number;
  email: string;
  name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoggedIn: boolean;
  userId: number | null;
  userEmail: string | null;
  user: User | null;
  login: (emailOrUser: string | User, password?: string) => Promise<boolean>;
  logout: () => void;
}

// Create a context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoggedIn: false,
  userId: null,
  userEmail: null,
  user: null,
  login: async () => false,
  logout: () => {}
});

interface AuthProviderProps {
  children: ReactNode;
}

// Provider component that wraps your app and makes auth object available to any child component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mapit_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUserId(userData.id);
        setUserEmail(userData.email);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('mapit_user');
      }
    }
  }, []);

  // Login function - accepts either email/password or user object
  const login = async (emailOrUser: string | User, password?: string): Promise<boolean> => {
    try {
      // If first parameter is a user object, use it directly
      if (typeof emailOrUser === 'object') {
        const userData = emailOrUser;
        setIsAuthenticated(true);
        setUserId(userData.customer_id || userData.id);
        setUserEmail(userData.email);
        setUser(userData);
        
        // Save user data to localStorage
        localStorage.setItem('mapit_user', JSON.stringify({
          id: userData.customer_id || userData.id,
          customer_id: userData.customer_id || userData.id,
          email: userData.email,
          name: userData.name
        }));
        
        localStorage.setItem('mapit_logged_in', 'true');
        return true;
      }
      
      // Otherwise, treat it as email and make API call
      const email = emailOrUser;
      if (!password) {
        console.error('Password is required when logging in with email');
        return false;
      }
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        console.error('Login failed with status:', response.status);
        return false;
      }

      const data = await response.json();
      
      if (data.success && data.user) {
        setIsAuthenticated(true);
        setUserId(data.user.customer_id || data.user.id);
        setUserEmail(data.user.email);
        
        // Save user data to localStorage
        localStorage.setItem('mapit_user', JSON.stringify({
          id: data.user.customer_id || data.user.id,
          email: data.user.email,
          name: data.user.name
        }));
        
        localStorage.setItem('mapit_logged_in', 'true');
        return true;
      } else {
        console.error('Login failed:', data.error || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setIsAuthenticated(false);
    setUserId(null);
    setUserEmail(null);
    localStorage.removeItem('mapit_user');
    localStorage.setItem('mapit_logged_in', 'false');
  };

  // The value that will be given to the context
  const value = {
    isAuthenticated,
    isLoggedIn: isAuthenticated,
    userId,
    userEmail,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;