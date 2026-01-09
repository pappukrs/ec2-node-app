'use client';

import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { AuthContextType, AuthState, LoginCredentials, RegisterData } from './types';
import { BackendUser } from '../api/auth';
import { AuthUtils } from './utils';
import { config } from '../config';
import { authApi } from '../api/auth';

// Auth reducer
import { User, AuthTokens } from './types';

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; tokens: AuthTokens | null } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' };

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      const user = AuthUtils.getUser();
      const token = AuthUtils.getAccessToken();

      if (user && token && AuthUtils.isAuthenticated()) {
        dispatch({
          type: 'SET_USER',
          payload: { user, tokens: null }, // We'll set proper tokens when we refresh
        });
      } else {
        AuthUtils.clearTokens();
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const response = await fetch(`${config.api.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Important for httpOnly cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const { user, accessToken } = data;

      // Store access token in localStorage
      localStorage.setItem('accessToken', accessToken);
      AuthUtils.setUser(user);

      dispatch({
        type: 'SET_USER',
        payload: { user: user as any, tokens: { accessToken } },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const { authApi } = await import('../api/auth');
      const responseData = await authApi.register(data);

      const { user, accessToken } = responseData;

      // Store access token in localStorage
      localStorage.setItem('accessToken', accessToken);
      AuthUtils.setUser(user);

      dispatch({
        type: 'SET_USER',
        payload: { user: user as any, tokens: null },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage and user data
      localStorage.removeItem('accessToken');
      AuthUtils.clearTokens();
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Refresh tokens function
  const refreshTokens = async (): Promise<void> => {
    try {
      const data = await authApi.refreshToken();

      const { accessToken } = data;

      // Update localStorage with new access token
      localStorage.setItem('accessToken', accessToken);

      // Update state with new token
      if (state.user) {
        dispatch({
          type: 'SET_USER',
          payload: {
            user: state.user,
            tokens: { accessToken },
          },
        });
      }
    } catch (error) {
      // If refresh fails, logout user
      await logout();
      throw error;
    }
  };

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshTokens,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
