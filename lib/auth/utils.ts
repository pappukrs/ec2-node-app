import Cookies from 'js-cookie';
import { config } from '../config';
import { AuthTokens, User } from './types';

export class AuthUtils {
  // Token management
  static setTokens(tokens: AuthTokens): void {
    Cookies.set(config.cookies.accessToken, tokens.accessToken, {
      expires: new Date(Date.now() + (tokens.expiresIn || 900) * 1000), // Default 15 minutes
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    // Refresh token is handled via httpOnly cookies by the API
  }

  static getAccessToken(): string | undefined {
    return Cookies.get(config.cookies.accessToken);
  }

  static getRefreshToken(): string | undefined {
    // Refresh token is httpOnly, can't access from client
    return undefined;
  }

  static clearTokens(): void {
    Cookies.remove(config.cookies.accessToken);
    Cookies.remove(config.cookies.user);
    // Refresh token cookie is cleared by the API
  }

  // User management
  static setUser(user: User): void {
    Cookies.set(config.cookies.user, JSON.stringify(user), {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  static getUser(): User | null {
    const userStr = Cookies.get(config.cookies.user);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      this.clearTokens();
      return null;
    }
  }

  // Token validation
  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  static shouldRefreshToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresAt = payload.exp * 1000;
      const now = Date.now();
      const threshold = config.auth.tokenRefreshThreshold;

      return (expiresAt - now) < threshold;
    } catch {
      return true;
    }
  }

  // Authentication checks
  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getUser();

    return !!(token && user && !this.isTokenExpired(token));
  }
}
