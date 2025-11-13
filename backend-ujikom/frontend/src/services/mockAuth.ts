import { User } from '../types';

// Mock users for testing
const mockUsers: { [key: string]: User & { password: string } } = {
  'admin@test.com': {
    id: 1,
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    is_verified: true,
    email_verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'organizer@test.com': {
    id: 2,
    name: 'Event Organizer',
    email: 'organizer@test.com',
    password: 'organizer123',
    role: 'event_organizer',
    status: 'active',
    is_verified: true,
    email_verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'user@test.com': {
    id: 3,
    name: 'Regular User',
    email: 'user@test.com',
    password: 'user123',
    role: 'user',
    status: 'active',
    is_verified: true,
    email_verified_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

// Mock auth service
export const mockAuthService = {
  login: async (credentials: { email: string; password: string; remember?: boolean }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers[credentials.email];
    
    if (!user || user.password !== credentials.password) {
      throw new Error('Email atau password salah');
    }
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    
    // Generate mock token
    const token = `mock_token_${user.id}_${Date.now()}`;
    
    return {
      status: 'success',
      data: {
        user: userWithoutPassword,
        token: token
      }
    };
  },

  getCurrentUser: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const token = localStorage.getItem('auth_token');
    if (!token || !token.startsWith('mock_token_')) {
      throw new Error('Invalid token');
    }
    
    // Extract user ID from token
    const userId = parseInt(token.split('_')[2]);
    const user = Object.values(mockUsers).find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    
    return {
      status: 'success',
      data: userWithoutPassword
    };
  },

  logout: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return { status: 'success' };
  },

  register: async (data: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    if (mockUsers[data.email]) {
      throw new Error('Email sudah terdaftar');
    }
    
    return {
      status: 'success',
      data: { message: 'Registrasi berhasil. Silakan verifikasi email Anda.' }
    };
  },

  verifyOTP: async (data: { email: string; otp: string }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For mock, accept any 6-digit OTP
    if (data.otp.length !== 6) {
      throw new Error('Kode OTP tidak valid');
    }
    
    const user = mockUsers[data.email];
    if (!user) {
      throw new Error('Email tidak ditemukan');
    }
    
    // Remove password from user object
    const { password, ...userWithoutPassword } = user;
    
    // Generate mock token
    const token = `mock_token_${user.id}_${Date.now()}`;
    
    return {
      status: 'success',
      data: {
        user: userWithoutPassword,
        token: token
      }
    };
  },

  resendOTP: async (data: { email: string }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      status: 'success',
      data: { message: 'Kode OTP telah dikirim ulang' }
    };
  },

  forgotPassword: async (email: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      status: 'success',
      data: { message: 'Link reset password telah dikirim ke email Anda' }
    };
  },

  resetPassword: async (data: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      status: 'success',
      data: { message: 'Password berhasil direset' }
    };
  }
};

// Function to check if we should use mock auth
export const shouldUseMockAuth = () => {
  // Use mock auth only if explicitly enabled
  return process.env.REACT_APP_USE_MOCK_AUTH === 'true';
};
