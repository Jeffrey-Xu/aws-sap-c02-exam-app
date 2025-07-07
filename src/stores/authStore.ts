import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState, UserCredentials, SignupData, StoredUser, AuthResult } from '../types/auth';
import { generateSalt, hashPassword, verifyPassword, generateUserId } from '../utils/crypto';
import { validateEmailFormat, validatePassword } from '../utils/emailValidation';

const MAX_USERS = 20;
const USERS_STORAGE_KEY = 'aws_exam_app_users';
const SESSION_STORAGE_KEY = 'aws_exam_app_session';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: UserCredentials) => Promise<AuthResult>;
  signup: (data: SignupData) => Promise<AuthResult>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, 'firstName' | 'lastName' | 'profilePicture'>>) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  checkSession: () => void;
  clearError: () => void;
  
  // Admin functions
  getUserCount: () => number;
  canRegisterNewUser: () => boolean;
}

// Helper functions for user storage
const getStoredUsers = (): StoredUser[] => {
  try {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};

const saveStoredUsers = (users: StoredUser[]): void => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const findUserByEmail = (email: string): StoredUser | null => {
  const users = getStoredUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
};

const findUserById = (id: string): StoredUser | null => {
  const users = getStoredUsers();
  return users.find(user => user.id === id) || null;
};

const convertStoredUserToUser = (storedUser: StoredUser): User => ({
  id: storedUser.id,
  email: storedUser.email,
  firstName: storedUser.firstName,
  lastName: storedUser.lastName,
  createdAt: new Date(storedUser.createdAt),
  lastLoginAt: new Date(storedUser.lastLoginAt),
  isEmailVerified: true, // Always true since we removed verification
  profilePicture: storedUser.profilePicture
});

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      registrationCount: 0,

      login: async (credentials: UserCredentials): Promise<AuthResult> => {
        set({ isLoading: true, error: null });

        try {
          // Validate input
          const emailValidation = validateEmailFormat(credentials.email);
          if (!emailValidation.isValid) {
            const error = { code: 'INVALID_EMAIL', message: emailValidation.errors[0] };
            set({ error: error.message, isLoading: false });
            return { success: false, error };
          }

          // Find user
          const storedUser = findUserByEmail(credentials.email);
          if (!storedUser) {
            const error = { code: 'USER_NOT_FOUND', message: 'No account found with this email address' };
            set({ error: error.message, isLoading: false });
            return { success: false, error };
          }

          // Verify password
          const isValidPassword = await verifyPassword(credentials.password, storedUser.salt, storedUser.passwordHash);
          if (!isValidPassword) {
            const error = { code: 'INVALID_PASSWORD', message: 'Incorrect password' };
            set({ error: error.message, isLoading: false });
            return { success: false, error };
          }

          // Update last login
          const users = getStoredUsers();
          const userIndex = users.findIndex(u => u.id === storedUser.id);
          if (userIndex !== -1) {
            users[userIndex].lastLoginAt = new Date().toISOString();
            saveStoredUsers(users);
          }

          // Create user session
          const user = convertStoredUserToUser({ ...storedUser, lastLoginAt: new Date().toISOString() });
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          return { success: true, user };
        } catch (error) {
          const authError = { code: 'LOGIN_ERROR', message: 'An error occurred during login' };
          set({ error: authError.message, isLoading: false });
          return { success: false, error: authError };
        }
      },

      signup: async (data: SignupData): Promise<AuthResult> => {
        set({ isLoading: true, error: null });

        try {
          // Check user limit
          const currentUsers = getStoredUsers();
          if (currentUsers.length >= MAX_USERS) {
            const error = { code: 'USER_LIMIT_REACHED', message: `Maximum number of users (${MAX_USERS}) has been reached` };
            set({ error: error.message, isLoading: false });
            return { success: false, error };
          }

          // Validate email
          const emailValidation = validateEmailFormat(data.email);
          if (!emailValidation.isValid) {
            const error = { code: 'INVALID_EMAIL', message: emailValidation.errors[0] };
            set({ error: error.message, isLoading: false });
            return { success: false, error };
          }

          // Validate password
          const passwordValidation = validatePassword(data.password);
          if (!passwordValidation.isValid) {
            const error = { code: 'INVALID_PASSWORD', message: passwordValidation.errors[0] };
            set({ error: error.message, isLoading: false });
            return { success: false, error };
          }

          // Check password confirmation
          if (data.password !== data.confirmPassword) {
            const error = { code: 'PASSWORD_MISMATCH', message: 'Passwords do not match' };
            set({ error: error.message, isLoading: false });
            return { success: false, error };
          }

          // Check if user already exists
          if (findUserByEmail(data.email)) {
            const error = { code: 'USER_EXISTS', message: 'An account with this email address already exists' };
            set({ error: error.message, isLoading: false });
            return { success: false, error };
          }

          // Validate names
          if (!data.firstName.trim() || !data.lastName.trim()) {
            const error = { code: 'INVALID_NAME', message: 'First name and last name are required' };
            set({ error: error.message, isLoading: false });
            return { success: false, error };
          }

          // Create user
          const salt = await generateSalt();
          const passwordHash = await hashPassword(data.password, salt);
          const userId = generateUserId();
          const now = new Date().toISOString();

          const newStoredUser: StoredUser = {
            id: userId,
            email: data.email.toLowerCase(),
            firstName: data.firstName.trim(),
            lastName: data.lastName.trim(),
            passwordHash,
            salt,
            createdAt: now,
            lastLoginAt: now,
            isEmailVerified: true // Always true since we removed verification
          };

          // Save user
          const updatedUsers = [...currentUsers, newStoredUser];
          saveStoredUsers(updatedUsers);

          // Create user session immediately (no email verification needed)
          const user = convertStoredUserToUser(newStoredUser);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            registrationCount: updatedUsers.length
          });

          return { 
            success: true, 
            user
          };
        } catch (error) {
          const authError = { code: 'SIGNUP_ERROR', message: 'An error occurred during registration' };
          set({ error: authError.message, isLoading: false });
          return { success: false, error: authError };
        }
      },

      updateProfile: async (updates: Partial<Pick<User, 'firstName' | 'lastName' | 'profilePicture'>>): Promise<boolean> => {
        const { user } = get();
        if (!user) return false;

        try {
          const users = getStoredUsers();
          const userIndex = users.findIndex(u => u.id === user.id);
          
          if (userIndex === -1) return false;

          // Update stored user
          if (updates.firstName) users[userIndex].firstName = updates.firstName.trim();
          if (updates.lastName) users[userIndex].lastName = updates.lastName.trim();
          if (updates.profilePicture !== undefined) users[userIndex].profilePicture = updates.profilePicture;

          saveStoredUsers(users);

          // Update current user state
          const updatedUser = { ...user, ...updates };
          set({ user: updatedUser });

          return true;
        } catch {
          return false;
        }
      },

      deleteAccount: async (): Promise<boolean> => {
        const { user } = get();
        if (!user) return false;

        try {
          // Remove user from storage
          const users = getStoredUsers();
          const filteredUsers = users.filter(u => u.id !== user.id);
          saveStoredUsers(filteredUsers);

          // Clear user-specific data
          localStorage.removeItem(`user_progress_${user.id}`);
          localStorage.removeItem(`user_settings_${user.id}`);

          // Logout
          set({
            user: null,
            isAuthenticated: false,
            registrationCount: filteredUsers.length
          });

          return true;
        } catch {
          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null
        });
      },

      checkSession: () => {
        const { user } = get();
        if (user) {
          // Verify user still exists
          const storedUser = findUserById(user.id);
          if (!storedUser) {
            set({
              user: null,
              isAuthenticated: false,
              error: 'Session expired'
            });
          }
        }
      },

      clearError: () => {
        set({ error: null });
      },

      getUserCount: () => {
        return getStoredUsers().length;
      },

      canRegisterNewUser: () => {
        return getStoredUsers().length < MAX_USERS;
      }
    }),
    {
      name: SESSION_STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
