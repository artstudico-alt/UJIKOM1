// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'event_organizer' | 'user';
  phone?: string;
  address?: string;
  education?: string;
  profile_image?: string;
  status: 'active' | 'inactive' | 'suspended';
  is_verified: boolean;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

// Event Types
export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  max_participants: number;
  current_participants_count: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  image?: string;
  flyer_path?: string;
  certificate_template_path?: string;
  registration_deadline: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Computed attributes
  is_registration_open?: boolean;
  is_past_event?: boolean;
  full_date_time?: string;
  can_admin_create?: boolean;
  is_event_day?: boolean;
  is_attendance_open?: boolean;
  // User registration status
  is_user_registered?: boolean;
  user_registration?: {
    id: number;
    registration_number: string;
    attendance_status: string;
    is_attendance_verified: boolean;
    attendance_verified_at?: string;
    attendance_token?: string;
    can_attend: boolean;
    registered_at: string;
  };
}

// Participant Types
export interface Participant {
  id: number;
  event_id: number;
  user_id: number;
  user: User;
  event: Event;
  status: 'registered' | 'attended' | 'absent';
  registered_at: string;
  attended_at?: string;
  registration_number?: string;
  attendance_token?: string;
  is_attendance_verified?: boolean;
  can_receive_certificate?: boolean;
}

// Certificate Types
export interface Certificate {
  id: number;
  participant_id: number;
  participant: Participant;
  certificate_number: string;
  issued_at: string;
  status: 'generated' | 'downloaded';
}

// Attendance Types
export interface Attendance {
  id: number;
  participant_id: number;
  participant: Participant;
  marked_at: string;
  marked_by: number;
  notes?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone: string;
  address: string;
  education: string;
}

export interface PasswordResetData {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Form Types
export interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_participants: number;
  organizer_name?: string;
  image?: File;
  flyer?: File;
  certificate_template?: File;
}

// Search Types
export interface SearchParams {
  query?: string;
  search?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

// Dashboard Types
export interface DashboardStats {
  total_events: number;
  total_participants: number;
  total_certificates: number;
  upcoming_events: number;
  recent_activities: ActivityLog[];
}

export interface ActivityLog {
  id: number;
  user_id: number;
  user: User;
  action: string;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

// Chart Data Types
export interface ChartData {
  monthly_events: {
    month: string;
    count: number;
  }[];
  monthly_participants: {
    month: string;
    count: number;
  }[];
  top_events: {
    event_title: string;
    participant_count: number;
  }[];
}
