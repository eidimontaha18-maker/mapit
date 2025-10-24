// Placeholder removed implementation to avoid build errors from missing dependencies.
// If you later add a PostgREST/Supabase layer, implement it here.
import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface DbContextType { isConnected: boolean; }
const DbContext = createContext<DbContextType>({ isConnected: false });

export const DbProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <DbContext.Provider value={{ isConnected: false }}>
    {children}
  </DbContext.Provider>
);

export const useDb = () => useContext(DbContext);