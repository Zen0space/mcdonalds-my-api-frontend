import { api, apiWithExtendedTimeout } from './api';

// Types for outlet data
export interface Outlet {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postcode: string;
  latitude: number;
  longitude: number;
  phone?: string;
  operating_hours?: OperatingHours;
  services?: string[];
  distance?: number; // Added by nearby endpoint
}

export interface OperatingHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export interface OutletSearchParams {
  q: string;
  limit?: number;
  offset?: number;
}

export interface NearbyOutletsParams {
  lat: number;
  lng: number;
  radius?: number; // in kilometers
  limit?: number;
}

export const outletService = {
  /**
   * Get all outlets
   * Uses extended timeout for initial load (Render cold start)
   */
  async getOutlets() {
    try {
      const response = await apiWithExtendedTimeout.get<Outlet[]>('/outlets');
      return response.data;
    } catch (error) {
      console.error('Error fetching outlets:', error);
      throw error;
    }
  },

  /**
   * Get specific outlet by ID
   */
  async getOutletById(id: string) {
    try {
      const response = await api.get<Outlet>(`/outlets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching outlet ${id}:`, error);
      throw error;
    }
  },

  /**
   * Search outlets by query
   */
  async searchOutlets(params: OutletSearchParams) {
    try {
      const response = await api.get<Outlet[]>('/outlets/search', {
        params: {
          q: params.q,
          limit: params.limit || 20,
          offset: params.offset || 0,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching outlets:', error);
      throw error;
    }
  },

  /**
   * Get nearby outlets based on coordinates
   */
  async getNearbyOutlets(params: NearbyOutletsParams) {
    try {
      const response = await api.get<Outlet[]>('/outlets/nearby', {
        params: {
          lat: params.lat,
          lng: params.lng,
          radius: params.radius || 5, // Default 5km radius
          limit: params.limit || 10,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby outlets:', error);
      throw error;
    }
  },

  /**
   * Get outlets by state
   */
  async getOutletsByState(state: string) {
    try {
      const response = await api.get<Outlet[]>('/outlets/state', {
        params: { state },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching outlets for state ${state}:`, error);
      throw error;
    }
  },

  /**
   * Get outlets by city
   */
  async getOutletsByCity(city: string, state?: string) {
    try {
      const response = await api.get<Outlet[]>('/outlets/city', {
        params: { city, state },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching outlets for city ${city}:`, error);
      throw error;
    }
  },

  /**
   * Batch get multiple outlets by IDs
   */
  async getOutletsByIds(ids: string[]) {
    try {
      const response = await api.post<Outlet[]>('/outlets/batch', { ids });
      return response.data;
    } catch (error) {
      console.error('Error fetching outlets by IDs:', error);
      throw error;
    }
  },

  /**
   * Get outlet statistics (count by state, city, etc.)
   */
  async getOutletStats() {
    try {
      const response = await api.get('/outlets/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching outlet statistics:', error);
      throw error;
    }
  },
};

export default outletService;
