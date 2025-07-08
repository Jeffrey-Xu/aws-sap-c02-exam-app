// API service for server-side communication
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://aws-sap-c02-exam-app.vercel.app/api'
  : '/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private getAdminHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'username': 'admin',
      'password': 'nimda'
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'An error occurred',
          code: data.code
        };
      }

      return {
        success: true,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Network error or invalid response',
        code: 'NETWORK_ERROR'
      };
    }
  }

  // Authentication endpoints
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse<{ user: any; token: string }>> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });

    const result = await this.handleResponse<{ user: any; token: string }>(response);
    
    // Store token if registration successful
    if (result.success && result.data?.token) {
      localStorage.setItem('auth_token', result.data.token);
    }

    return result;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: any; token: string }>> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(credentials)
    });

    const result = await this.handleResponse<{ user: any; token: string }>(response);
    
    // Store token if login successful
    if (result.success && result.data?.token) {
      localStorage.setItem('auth_token', result.data.token);
    }

    return result;
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: any }>> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ user: any }>(response);
  }

  async updateProfile(updates: any): Promise<ApiResponse<{ user: any }>> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates)
    });

    return this.handleResponse<{ user: any }>(response);
  }

  logout(): void {
    // Remove all authentication-related data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_authenticated');
    
    // Clear any user-specific progress data (optional - you might want to keep this)
    // Object.keys(localStorage).forEach(key => {
    //   if (key.startsWith('progress-store-')) {
    //     localStorage.removeItem(key);
    //   }
    // });
    
    // Clear session storage as well
    sessionStorage.clear();
  }

  // Progress endpoints
  async saveProgress(progressData: any): Promise<ApiResponse<{ progress: any }>> {
    const response = await fetch(`${API_BASE_URL}/progress/save`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(progressData)
    });

    return this.handleResponse<{ progress: any }>(response);
  }

  async loadProgress(): Promise<ApiResponse<{ progress: any }>> {
    const response = await fetch(`${API_BASE_URL}/progress/load`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    return this.handleResponse<{ progress: any }>(response);
  }

  // Admin endpoints
  async getAdminUsers(): Promise<ApiResponse<{ 
    users: any[]; 
    statistics: {
      totalUsers: number;
      activeUsers: number;
      totalStudyTime: number;
      totalExamAttempts: number;
      avgReadinessScore: number;
    }
  }>> {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: this.getAdminHeaders()
    });

    return this.handleResponse(response);
  }

  // Utility methods
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    try {
      // Basic JWT token validation (check if not expired)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getStoredToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export const apiService = new ApiService();
export default apiService;
