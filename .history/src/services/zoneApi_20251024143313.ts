/**
 * Zone API Service
 * 
 * This service handles communication with the backend API for map zones
 */

import type { Zone } from '../types/zones';

const API_URL = 'http://127.0.0.1:3101/api';

interface BaseApiResponse {
  success: boolean;
  error?: string;
}

interface ZonesResponse extends BaseApiResponse {
  zones?: Zone[];
}

interface ZoneResponse extends BaseApiResponse {
  zone?: Zone;
}

// Get authentication token from local storage
const getToken = () => localStorage.getItem('auth_token');

// Helper for API requests
const apiRequest = async <T extends BaseApiResponse>(
  endpoint: string, 
  method: string = 'GET', 
  data?: unknown
): Promise<T> => {
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
    const response = await apiRequest<ZonesResponse>('/zones');
    return response.zones || [];
  },
  
  // Get a specific zone
  getZone: async (id: string): Promise<Zone | undefined> => {
    const response = await apiRequest<ZoneResponse>(`/zones/${id}`);
    return response.zone;
  },
  
  // Create a new zone
  createZone: async (zone: Zone): Promise<Zone | undefined> => {
    const response = await apiRequest<ZoneResponse>('/zones', 'POST', zone);
    return response.zone;
  },
  
  // Update an existing zone
  updateZone: async (zone: Zone): Promise<Zone | undefined> => {
    const response = await apiRequest<ZoneResponse>(`/zones/${zone.id}`, 'PUT', zone);
    return response.zone;
  },
  
  // Delete a zone
  deleteZone: async (id: string): Promise<void> => {
    await apiRequest<BaseApiResponse>(`/zones/${id}`, 'DELETE');
  },
  
  // Save all zones at once (replacing existing ones)
  saveZones: async (zones: Zone[]): Promise<void> => {
    await apiRequest<BaseApiResponse>('/zones/bulk', 'POST', { zones });
  }
};

export default zoneApi;