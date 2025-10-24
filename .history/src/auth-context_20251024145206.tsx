import React, { createContext, useState, useContext, useEffect } from 'react';
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
  login: (emailOrUser: string | User, password?: string) => Promise<boolean>;
  logout: () => void;
}

// Create a context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoggedIn: false,
  userId: null,
  userEmail: null,
  login: async () => false,
  logout: () => {}
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Provider component that wraps your app and makes auth object available to any child component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('mapit_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUserId(user.id);
        setUserEmail(user.email);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('mapit_user');
      }
    }
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        setUserId(data.user.customer_id);
        setUserEmail(data.user.email);
        
        // Save user data to localStorage
        localStorage.setItem('mapit_user', JSON.stringify({
          id: data.user.customer_id,
          email: data.user.email
        }));
        
        localStorage.setItem('mapit_logged_in', 'true');
        return true;
      } else {
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
    userId,
    userEmail,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;