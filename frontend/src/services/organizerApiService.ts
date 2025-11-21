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
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface OrganizerEvent {
  id?: number;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  max_participants?: number;
  current_participants?: number;
  registration_deadline: string;
  organizer_name: string;
  organizer_email: string;
  organizer_contact?: string;
  category: string;
  event_type?: string;
  price?: number;
  registration_date: string;
  image_url?: string;
  image?: string; // Processed image URL from backend
  flyer_path?: string; // Path to uploaded flyer
  flyer?: File;
  has_certificate?: boolean;
  certificate_required?: boolean;
  status?: 'draft' | 'pending_approval' | 'approved' | 'published' | 'rejected' | 'cancelled' | 'ongoing' | 'completed';
  organizer_type?: 'organizer' | 'admin';
  created_at?: string;
  updated_at?: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  // Payment settings
  payment_methods?: string[] | string;
  bank_account_info?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  } | string;
  payment_instructions?: string;
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

export interface EventStatistics {
  total_events: number;
  pending_events: number;
  approved_events: number;
  published_events: number;
  rejected_events: number;
  total_participants: number;
}

class OrganizerApiService {
  /**
   * Get all organizer events with optional filters
   */
  async getEvents(params?: {
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<OrganizerEvent>> {
    try {
      const response = await apiClient.get('/organizer/events', { params });
      const payload = response.data;
      const rawData: any = payload.data;
      const events: OrganizerEvent[] = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
          ? rawData.data
          : [];

      return {
        ...payload,
        data: events,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch events');
    }
  }

  /**
   * Get events without authentication (public/guest access)
   * This should be the proper fallback instead of localStorage
   */
  async getEventsWithoutAuth(params?: {
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<OrganizerEvent>> {
    try {
      console.log('📡 getEventsWithoutAuth: Called with params:', params);
      console.log('📡 getEventsWithoutAuth: API_BASE_URL:', API_BASE_URL);
      
      // Create a new axios instance without auth headers
      const publicApiClient = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('📡 getEventsWithoutAuth: Making request to /events with params:', params);
      const response = await publicApiClient.get('/events', { params });
      console.log('📡 getEventsWithoutAuth: Response received:', {
        status: response.status,
        dataLength: response.data?.data?.length,
        totalItems: response.data?.pagination?.total
      });
      const payload = response.data;
      const rawData: any = payload.data;
      const events: OrganizerEvent[] = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
          ? rawData.data
          : [];

      return {
        ...payload,
        data: events,
      };
    } catch (error: any) {
      console.error('❌ Public API failed:', error);
      // NO localStorage fallback - 100% database only
      throw new Error(error.response?.data?.message || 'Failed to fetch public events');
    }
  }

  /**
   * Get single event by ID
   */
  async getEvent(id: number): Promise<ApiResponse<OrganizerEvent>> {
    try {
      const response = await apiClient.get(`/organizer/events/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch event');
    }
  }

  /**
   * Get single event by ID (alias for getEvent)
   */
  async getEventById(id: string): Promise<ApiResponse<OrganizerEvent>> {
    return this.getEvent(parseInt(id, 10));
  }

  /**
   * Create new event
   */
  async createEvent(eventData: OrganizerEvent): Promise<ApiResponse<OrganizerEvent>> {
    try {
      console.log('📤 createEvent: Input data:', eventData);
      console.log('📤 createEvent: Has flyer file:', eventData.flyer instanceof File);
      if (eventData.flyer instanceof File) {
        console.log('📤 createEvent: Flyer file details:', {
          name: eventData.flyer.name,
          size: eventData.flyer.size,
          type: eventData.flyer.type
        });
      }
      
      const formData = new FormData();
      
      // Add all event fields to FormData
      Object.entries(eventData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'flyer' && value instanceof File) {
            console.log('📤 createEvent: Adding flyer file to FormData');
            formData.append('flyer', value);
          } else {
            formData.append(key, String(value));
          }
        }
      });
      
      // Log FormData contents
      console.log('📤 createEvent: FormData entries:');
      const entries = Array.from(formData.entries());
      entries.forEach(([key, value]) => {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
      });

      const response = await apiClient.post('/organizer/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create event');
    }
  }

  /**
   * Create event without authentication (guest/anonymous submission)
   * This allows users to submit events to database even without login
   */
  async createEventWithoutAuth(eventData: OrganizerEvent): Promise<ApiResponse<OrganizerEvent>> {
    try {
      // Create a new axios instance without auth headers
      const publicApiClient = axios.create({
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const formData = new FormData();
      
      // Add all event fields to FormData
      Object.entries(eventData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'flyer' && value instanceof File) {
            formData.append('flyer', value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Set status to pending_approval for guest submissions
      formData.set('status', 'pending_approval');
      formData.set('organizer_type', 'organizer');

      const response = await publicApiClient.post('/public/events', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.warn('Public event creation not available, falling back to localStorage');
      throw new Error(error.response?.data?.message || 'Failed to create event without auth');
    }
  }

  /**
   * Update existing event
   */
  async updateEvent(id: string | number, eventData: Partial<OrganizerEvent>): Promise<ApiResponse<OrganizerEvent>> {
    try {
      const eventId = typeof id === 'string' ? parseInt(id, 10) : id;
      const formData = new FormData();
      
      // Add all event fields to FormData
      Object.entries(eventData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'flyer' && value instanceof File) {
            formData.append('flyer', value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Add method override for PUT request with FormData
      formData.append('_method', 'PUT');

      const response = await apiClient.post(`/organizer/events/${eventId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Update event error:', error);
      throw error;
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: number | string): Promise<ApiResponse<null>> {
    try {
      const id = typeof eventId === 'string' ? parseInt(eventId, 10) : eventId;
      const response = await apiClient.delete(`/organizer/events/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Delete event error:', error);
      throw error;
    }
  }

  /**
   * Get organizer statistics
   */
  async getStatistics(): Promise<ApiResponse<EventStatistics>> {
    try {
      const response = await apiClient.get('/organizer/events/statistics');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch statistics');
    }
  }

  /**
   * Get events by status for public display
   */
  async getPublishedEvents(): Promise<OrganizerEvent[]> {
    try {
      const response = await this.getEvents({ status: 'published', per_page: 100 });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch published events:', error);
      return [];
    }
  }

  /**
   * Submit event for approval (change status from draft to pending)
   */
  async submitForApproval(id: number): Promise<ApiResponse<OrganizerEvent>> {
    try {
      const response = await apiClient.put(`/organizer/events/${id}`, {
        status: 'pending_approval',
        submitted_at: new Date().toISOString(),
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit event for approval');
    }
  }

  /**
   * Save event as draft
   */
  async saveDraft(eventData: OrganizerEvent): Promise<ApiResponse<OrganizerEvent>> {
    const draftData = {
      ...eventData,
      status: 'draft' as const,
    };
    
    if (eventData.id) {
      return this.updateEvent(eventData.id, draftData);
    } else {
      return this.createEvent(draftData);
    }
  }

  /**
   * Get payments for organizer's events
   */
  async getPayments(params?: {
    status?: string;
    event_id?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<any> {
    try {
      const response = await apiClient.get('/organizer/payments', { params });
      return response.data;
    } catch (error: any) {
      console.error('Get payments error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const organizerApiService = new OrganizerApiService();
export default organizerApiService;
