import axios, { AxiosInstance } from 'axios';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface Certificate {
  id: number;
  certificate_number: string;
  participant_name: string;
  event: {
    id: number;
    title: string;
    date: string;
    location: string;
  };
  generated_at: string;
  download_count: number;
  is_ready: boolean;
}

export interface CertificateTextSettings {
  participant_name: {
    x: number;
    y: number;
    font_size: number;
    color: string;
    align: 'left' | 'center' | 'right';
  };
  event_date?: {
    x: number;
    y: number;
    font_size: number;
    color: string;
    align: 'left' | 'center' | 'right';
  };
  certificate_number?: {
    x: number;
    y: number;
    font_size: number;
    color: string;
    align: 'left' | 'center' | 'right';
  };
}

class CertificateService {
  // ========================================
  // PARTICIPANT ROUTES
  // ========================================
  
  /**
   * Get my certificates (for participants)
   */
  async getMyCertificates(): Promise<Certificate[]> {
    const response = await apiClient.get('/certificates/my');
    return response.data.data;
  }

  /**
   * Download certificate PDF
   */
  async downloadCertificate(certificateId: number): Promise<Blob> {
    const response = await apiClient.get(`/certificates/${certificateId}/download-pdf`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Download certificate and trigger browser download
   */
  async downloadCertificateFile(certificateId: number, filename: string): Promise<void> {
    const blob = await this.downloadCertificate(certificateId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `certificate_${certificateId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // ========================================
  // EVENT ORGANIZER ROUTES
  // ========================================

  /**
   * Upload certificate template (background image)
   */
  async uploadTemplate(eventId: number, file: File, hasCertificate: boolean = true): Promise<any> {
    const formData = new FormData();
    formData.append('template', file);
    formData.append('has_certificate', hasCertificate.toString());

    const response = await apiClient.post(`/organizer/events/${eventId}/certificate/upload-template`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Update certificate text settings (positions, font, etc)
   */
  async updateTextSettings(
    eventId: number,
    textSettings: CertificateTextSettings,
    autoGenerate: boolean = true
  ): Promise<any> {
    const response = await apiClient.put(`/organizer/events/${eventId}/certificate/text-settings`, {
      text_settings: textSettings,
      auto_generate: autoGenerate,
    });
    return response.data;
  }

  /**
   * Preview certificate template
   */
  async previewTemplate(eventId: number): Promise<any> {
    const response = await apiClient.get(`/organizer/events/${eventId}/certificate/preview`);
    return response.data.data;
  }

  /**
   * Generate certificates for all participants who attended the event
   */
  async generateCertificatesForEvent(eventId: number): Promise<any> {
    const response = await apiClient.post(`/organizer/events/${eventId}/certificate/generate`);
    return response.data;
  }
}

const certificateService = new CertificateService();
export default certificateService;
