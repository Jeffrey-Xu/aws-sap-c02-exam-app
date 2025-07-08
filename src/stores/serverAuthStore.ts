import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiService } from '../services/api';
import type { User, AuthState, UserCredentials, SignupData, AuthResult } from '../types/auth';

interface ServerAuthStore extends AuthState {
  // Actions
  login: (credentials: UserCredentials) => Promise<AuthResult>;
  signup: (data: SignupData) => Promise<AuthResult>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
  
  // Server-side specific
  isServerMode: boolean;
}

export const useServerAuthStore = create<ServerAuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      registrationCount: 0,
      isServerMode: true,

      // Login action
      login: async (credentials: UserCredentials): Promise<AuthResult> => {
        set({ isLoading: true, error: null });

        try {
          const result = await apiService.login(credentials);

          if (result.success && result.data) {
            const user: User = {
              id: result.data.user.id,
              email: result.data.user.email,
              firstName: result.data.user.firstName,
              lastName: result.data.user.lastName,
              createdAt: result.data.user.createdAt,
              isEmailVerified: true
            };

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            return { success: true, user };
          } else {
            const errorMessage = result.error || 'Login failed';
            set({ error: errorMessage, isLoading: false });
            return { 
              success: false, 
              error: { code: result.code || 'LOGIN_ERROR', message: errorMessage }
            };
          }
        } catch (error) {
          const errorMessage = 'Network error during login';
          set({ error: errorMessage, isLoading: false });
          return { 
            success: false, 
            error: { code: 'NETWORK_ERROR', message: errorMessage }
          };
        }
      },

      // Signup action
      signup: async (data: SignupData): Promise<AuthResult> => {
        set({ isLoading: true, error: null });

        try {
          const result = await apiService.register(data);

          if (result.success && result.data) {
            const user: User = {
              id: result.data.user.id,
              email: result.data.user.email,
              firstName: result.data.user.firstName,
              lastName: result.data.user.lastName,
              createdAt: result.data.user.createdAt,
              isEmailVerified: true
            };

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });

            return { success: true, user };
          } else {
            const errorMessage = result.error || 'Registration failed';
            set({ error: errorMessage, isLoading: false });
            return { 
              success: false, 
              error: { code: result.code || 'SIGNUP_ERROR', message: errorMessage }
            };
          }
        } catch (error) {
          const errorMessage = 'Network error during registration';
          set({ error: errorMessage, isLoading: false });
          return { 
            success: false, 
            error: { code: 'NETWORK_ERROR', message: errorMessage }
          };
        }
      },

      // Get current user (for session restoration)
      getCurrentUser: async () => {
        if (!apiService.isAuthenticated()) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        set({ isLoading: true });

        try {
          const result = await apiService.getCurrentUser();

          if (result.success && result.data) {
            const user: User = {
              id: result.data.user.id,
              email: result.data.user.email,
              firstName: result.data.user.firstName,
              lastName: result.data.user.lastName,
              createdAt: result.data.user.createdAt,
              isEmailVerified: true
            };

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            // Token invalid or expired
            apiService.logout();
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: null 
            });
          }
        } catch (error) {
          // Network error - keep current state but stop loading
          set({ isLoading: false });
        }
      },

      // Logout action
      logout: () => {
        apiService.logout();
        set({
          user: null,
          isAuthenticated: false,
          error: null
        });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'server-auth-storage',
      partialize: (state) => ({
        // Only persist user and authentication status
        // Token is stored separately in localStorage by apiService
        user: state.user,
        isAuthenticated: state.isAuthenticated && (typeof window !== 'undefined' && apiService.isAuthenticated())
      })
    }
  )
);

// Session check function - only run in browser
export const checkServerSession = async () => {
  if (typeof window === 'undefined') return; // Skip on server-side rendering
  
  const store = useServerAuthStore.getState();
  
  if (apiService.isAuthenticated() && !store.user) {
    await store.getCurrentUser();
  } else if (!apiService.isAuthenticated() && store.isAuthenticated) {
    store.logout();
  }
};
