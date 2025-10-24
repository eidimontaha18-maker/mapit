import { useContext } from 'react';
import { DbContext } from './PostgresContext';

export const useDb = () => useContext(DbContext);
