/**
 * Zone API Service
 * 
 * This service handles communication with the backend API for map zones
 */

import { Zone } from '../components/WorldMap';

const API_URL = 'http://127.0.0.1:3100/api';

export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  [key: string]: any;
}

// Get authentication token from local storage
const getToken = () => localStorage.getItem('auth_token');

// Helper for API requests
const apiRequest = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: any
): Promise<ApiResponse<T>> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  
  // Add authorization token if available
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options: RequestInit = {
    method,
    headers,
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined
  };
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'API request failed');
    }
    
    return result;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Zone API functions
export const zoneApi = {
  // Get all zones for the current user
  getZones: async (): Promise<Zone[]> => {
    const response = await apiRequest<Zone[]>('/zones');
    return response.zones || [];
  },
  
  // Get a specific zone
  getZone: async (id: string): Promise<Zone> => {
    const response = await apiRequest<Zone>(`/zones/${id}`);
    return response.zone;
  },
  
  // Create a new zone
  createZone: async (zone: Zone): Promise<Zone> => {
    const response = await apiRequest<Zone>('/zones', 'POST', zone);
    return response.zone;
  },
  
  // Update an existing zone
  updateZone: async (zone: Zone): Promise<Zone> => {
    const response = await apiRequest<Zone>(`/zones/${zone.id}`, 'PUT', zone);
    return response.zone;
  },
  
  // Delete a zone
  deleteZone: async (id: string): Promise<void> => {
    await apiRequest<void>(`/zones/${id}`, 'DELETE');
  },
  
  // Save all zones at once (replacing existing ones)
  saveZones: async (zones: Zone[]): Promise<void> => {
    await apiRequest<void>('/zones/bulk', 'POST', { zones });
  }
};

export default zoneApi;