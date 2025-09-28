import { api } from '../client';
import { API_CONFIG } from '../config';
import { 
  ApiResponse, 
  LoginRequest, 
  SignupRequest, 
  AuthResponse, 
  User 
} from '../types';

class AuthService {
  private baseUrl = API_CONFIG.ENDPOINTS.AUTH;

  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(
        this.baseUrl.LOGIN,
        credentials
      );

      if (response.data.success && response.data.data) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Login failed. Please try again.'
      );
    }
  }

  // Register user
  async signup(userData: SignupRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(
        this.baseUrl.SIGNUP,
        userData
      );

      if (response.data.success && response.data.data) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Signup failed');
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Signup failed. Please try again.'
      );
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<{ user: User }>>(
        this.baseUrl.ME
      );

      if (response.data.success && response.data.data) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return response.data.data.user;
      } else {
        throw new Error(response.data.message || 'Failed to get user data');
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to get user data'
      );
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    return !!(token && isAuth);
  }

  // Get stored user data
  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();
