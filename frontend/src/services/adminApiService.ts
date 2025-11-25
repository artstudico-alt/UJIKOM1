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
  latitude?: number;
  longitude?: number;
  max_participants?: number;
  registration_deadline: string;
  organizer_name: string;
  organizer_email: string;
  organizer_contact?: string;
  category: string;
  event_type?: string;
  price?: number;
  registration_date: string;
  image?: string;
  image_url?: string;
  has_certificate?: boolean;
  certificate_required?: boolean;
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
  // Payment settings
  payment_methods?: string[] | string;
  bank_account_info?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  } | string;
  payment_instructions?: string;
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
      const payload = response.data;
      const rawData: any = payload.data;
      const events: AdminEvent[] = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
          ? rawData.data
          : [];

      return {
        ...payload,
        data: events,
      };
    } catch (error: any) {
      console.error('Failed to fetch all events:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch events');
    }
  }


  /**
   * Get pending events for approval
   */
  async getPendingEvents(limit?: number): Promise<AdminEvent[]> {
    try {
      const perPage = limit || 100;
      const response = await apiClient.get(`/admin/events/pending?per_page=${perPage}`);
      
      console.log('📡 adminApiService.getPendingEvents: Response received', {
        status: response.data.status,
        dataLength: response.data.data?.length,
        total: response.data.meta?.total_pending
      });
      
      if (response.data.status === 'success') {
        return response.data.data || [];
      }
      
      console.warn('⚠️ adminApiService.getPendingEvents: Unexpected status', response.data);
      return [];
    } catch (error: any) {
      console.error('❌ adminApiService.getPendingEvents: API call failed', {
        message: error.message,
        response: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Get recent events for dashboard
   */
  async getRecentEvents(limit: number = 5): Promise<AdminEvent[]> {
    try {
      const response = await apiClient.get(`/admin/events/recent?limit=${limit}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch recent events:', error);
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
      const response = await apiClient.get('/users', { params });
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
  async rejectEvent(eventId: number, reason: string): Promise<ApiResponse<AdminEvent>> {
    try {
      console.log('📤 AdminApiService: Rejecting event', {
        eventId,
        reason,
        reasonLength: reason?.length,
        payload: { rejection_reason: reason }
      });
      
      // Validate reason before sending
      if (!reason || reason.trim().length === 0) {
        throw new Error('Alasan penolakan tidak boleh kosong');
      }
      
      const response = await apiClient.post(`/admin/events/${eventId}/reject`, {
        rejection_reason: reason
      });
      
      console.log('✅ AdminApiService: Event rejected successfully', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ AdminApiService: Reject event failed', {
        eventId,
        error: error.response?.data,
        message: error.message
      });
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
  async getEventById(eventId: string | number): Promise<ApiResponse<AdminEvent>> {
    try {
      const id = typeof eventId === 'string' ? parseInt(eventId, 10) : eventId;
      const response = await apiClient.get(`/admin/events/${id}`);
      return {
        status: 'success',
        data: response.data.data
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch event');
    }
  }

  /**
   * Create event (Admin)
   */
  async createEvent(eventData: any): Promise<ApiResponse<AdminEvent>> {
    try {
      console.log('📤 AdminApiService: Creating event', eventData);
      
      // Use FormData if there's a file
      let payload: any;
      let headers: any = {};
      
      if (eventData.flyer instanceof File) {
        payload = new FormData();
        Object.keys(eventData).forEach(key => {
          if (eventData[key] !== undefined && eventData[key] !== null) {
            payload.append(key, eventData[key]);
          }
        });
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        payload = eventData;
      }
      
      const response = await apiClient.post('/admin/events', payload, { headers });
      console.log('✅ AdminApiService: Event created successfully', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ AdminApiService: Create event failed', {
        error: error.response?.data,
        message: error.message
      });
      throw new Error(error.response?.data?.message || 'Failed to create event');
    }
  }

  /**
   * Update event
   */
  async updateEvent(eventId: string | number, eventData: Partial<AdminEvent>): Promise<ApiResponse<AdminEvent>> {
    try {
      const id = typeof eventId === 'string' ? parseInt(eventId, 10) : eventId;
      const response = await apiClient.put(`/admin/events/${id}`, eventData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update event');
    }
  }

  /**
   * Get chart data for dashboard
   */
  async getChartData(): Promise<{
    eventsPerMonth: Array<{ month: string; count: number }>;
    participantsPerMonth: Array<{ month: string; count: number }>;
    topEvents: Array<{ name: string; participants: number }>;
  }> {
    try {
      const response = await apiClient.get('/admin/dashboard/charts');
      console.log('📊 Chart API Response:', response.data);
      // Backend returns data directly (no nested .data property)
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch chart data:', error);
      // Return default data if API fails
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return {
        eventsPerMonth: months.map(month => ({ month, count: 0 })),
        participantsPerMonth: months.map(month => ({ month, count: 0 })),
        topEvents: [],
      };
    }
  }
}

export const adminApiService = new AdminApiService();
export default adminApiService;
