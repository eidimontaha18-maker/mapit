import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { query } from './postgres';

interface DbContextType {
  isConnected: boolean;
  query: typeof query;
}

// Simplified placeholder context (not actively used). Always reports false.
const DbContext = createContext<DbContextType>({ isConnected: false, query });

export const PostgresProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <DbContext.Provider value={{ isConnected: false, query }}>
    {children}
  </DbContext.Provider>
);

// Hook kept in same file; acceptable for small project.
export const useDb = () => useContext(DbContext);