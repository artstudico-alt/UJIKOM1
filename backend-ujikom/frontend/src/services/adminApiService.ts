import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface AdminEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  max_participants?: number;
  registration_deadline: string;
  organizer_name: string;
  organizer_email: string;
  organizer_contact?: string;
  category: string;
  price?: number;
  registration_date: string;
  image_url?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'rejected' | 'cancelled';
  organizer_type?: 'admin' | 'organizer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  participants_count?: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  role: 'admin' | 'organizer' | 'user';
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_events: number;
  total_organizer_events: number;
  total_admin_events: number;
  pending_approvals: number;
  published_events: number;
  active_events: number;
  completed_events: number;
  total_participants: number;
  new_users_this_month: number;
  new_events_this_month: number;
  revenue_this_month: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  status: 'success' | 'error';
  data: T[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

class AdminApiService {
  /**
   * Get all events (admin + organizer events)
   */
  async getAllEvents(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    organizer_type?: string;
  }): Promise<PaginatedResponse<AdminEvent>> {
    try {
      const response = await apiClient.get('/admin/events', { params });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch all events:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch events');
    }
  }

  /**
   * Get recent events (published events, newest first)
   */
  async getRecentEvents(limit: number = 5): Promise<AdminEvent[]> {
    try {
      const response = await this.getAllEvents({
        status: 'published',
        per_page: limit
      });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch recent events:', error);
      return [];
    }
  }

  /**
   * Get pending events for approval
   */
  async getPendingEvents(): Promise<AdminEvent[]> {
    try {
      const response = await this.getAllEvents({
        status: 'pending_approval',
        per_page: 100
      });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch pending events:', error);
      return [];
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(params?: {
    page?: number;
    per_page?: number;
    role?: string;
  }): Promise<PaginatedResponse<AdminUser>> {
    try {
      const response = await apiClient.get('/admin/users', { params });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get('/admin/dashboard/stats');
      return response.data.data;
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error);
      // Return default stats if API fails
      return {
        total_users: 0,
        total_events: 0,
        total_organizer_events: 0,
        total_admin_events: 0,
        pending_approvals: 0,
        published_events: 0,
        active_events: 0,
        completed_events: 0,
        total_participants: 0,
        new_users_this_month: 0,
        new_events_this_month: 0,
        revenue_this_month: 0,
      };
    }
  }

  /**
   * Approve event
   */
  async approveEvent(eventId: number): Promise<ApiResponse<AdminEvent>> {
    try {
      const response = await apiClient.post(`/admin/events/${eventId}/approve`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to approve event');
    }
  }

  /**
   * Reject event
   */
  async rejectEvent(eventId: number, reason?: string): Promise<ApiResponse<AdminEvent>> {
    try {
      const response = await apiClient.post(`/admin/events/${eventId}/reject`, {
        rejection_reason: reason
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reject event');
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: number): Promise<ApiResponse<null>> {
    try {
      const response = await apiClient.delete(`/admin/events/${eventId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete event');
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: number): Promise<AdminEvent> {
    try {
      const response = await apiClient.get(`/admin/events/${eventId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch event');
    }
  }

  /**
   * Update event
   */
  async updateEvent(eventId: number, eventData: Partial<AdminEvent>): Promise<ApiResponse<AdminEvent>> {
    try {
      const response = await apiClient.put(`/admin/events/${eventId}`, eventData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update event');
    }
  }
}

export const adminApiService = new AdminApiService();
export default adminApiService;
