import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define the User type
interface User {
  customer_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

// Define the context shape
interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

// Define props for provider component
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component to wrap the app
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Load user data from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('mapit_user');
    const isLoggedIn = localStorage.getItem('mapit_logged_in') === 'true';

    if (storedUser && isLoggedIn) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('mapit_user');
        localStorage.setItem('mapit_logged_in', 'false');
      }
    }
  }, []);

  // Login function
  const login = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('mapit_user', JSON.stringify(userData));
    localStorage.setItem('mapit_logged_in', 'true');
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('mapit_user');
    localStorage.setItem('mapit_logged_in', 'false');
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook moved to src/hooks/useAuth.ts

export default AuthContext;