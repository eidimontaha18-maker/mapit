import { useContext } from 'react';
import AuthContext from '../auth-context';

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);