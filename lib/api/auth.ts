import { LoginCredentials, RegisterData } from '../auth/types';
import { config } from '../config';
import { handleApiError, getErrorMessage } from './error-handler';

// Backend API types matching the integration guide
export interface BackendUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  preferences?: Record<string, any>;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: BackendUser;
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  bio?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: Address;
  preferences?: Record<string, any>;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface DeleteAccountData {
  password: string;
}

export interface UserSearchResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserSearchResponse {
  users: UserSearchResult[];
  limit: number;
  offset: number;
}

export interface UserProfileResponse extends BackendUser {
  isOwnProfile: boolean;
}

// Authentication API functions
export const authApi = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const apiUrl = `${config.api.baseUrl}/auth/login`;
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include' // Important for refresh token cookie
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(error.error || `Login failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      const apiError = handleApiError(error, apiUrl);
      throw new Error(getErrorMessage(apiError));
    }
  },

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    const apiUrl = `${config.api.baseUrl}/auth/register`;
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(error.error || `Registration failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      const apiError = handleApiError(error, apiUrl);
      throw new Error(getErrorMessage(apiError));
    }
  },

  // Logout user
  async logout(): Promise<void> {
    await fetch(`${config.api.baseUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  },

  // Refresh access token
  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await fetch(`${config.api.baseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  },

  // Get current user
  async getCurrentUser(): Promise<BackendUser> {
    const token = localStorage.getItem('accessToken');
    const apiUrl = `${config.api.baseUrl}/auth/me`;
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to get user' }));
        throw new Error(error.error || `Failed to get user: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      const apiError = handleApiError(error, apiUrl);
      throw new Error(getErrorMessage(apiError));
    }
  },
};

// User Management API functions
export const userApi = {
  // Update user profile
  async updateProfile(data: UserProfile): Promise<BackendUser> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${config.api.baseUrl}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update profile' }));
      throw new Error(error.error || 'Failed to update profile');
    }

    return response.json();
  },

  // Change password
  async changePassword(data: PasswordChangeData): Promise<{ message: string }> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${config.api.baseUrl}/users/password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to change password' }));
      throw new Error(error.error || 'Failed to change password');
    }

    return response.json();
  },

  // Delete account
  async deleteAccount(data: DeleteAccountData): Promise<{ message: string }> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${config.api.baseUrl}/users/account`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete account' }));
      throw new Error(error.error || 'Failed to delete account');
    }

    return response.json();
  },

  // Get user profile by ID
  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${config.api.baseUrl}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to get user profile' }));
      throw new Error(error.error || 'Failed to get user profile');
    }

    return response.json();
  },

  // Search users
  async searchUsers(query: string, limit = 10, offset = 0): Promise<UserSearchResponse> {
    const token = localStorage.getItem('accessToken');
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      offset: offset.toString()
    });

    const response = await fetch(`${config.api.baseUrl}/users/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to search users' }));
      throw new Error(error.error || 'Failed to search users');
    }

    return response.json();
  },
};
