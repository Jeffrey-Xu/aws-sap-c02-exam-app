export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  lastLoginAt: Date;
  isEmailVerified: boolean; // Always true in simplified version
  profilePicture?: string;
  examDate?: string; // ISO date string for scheduled exam
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface SignupData extends UserCredentials {
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  registrationCount: number;
}

export interface StoredUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLoginAt: string;
  isEmailVerified: boolean; // Always true in simplified version
  profilePicture?: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export type AuthAction = 
  | 'login'
  | 'signup'
  | 'logout'
  | 'forgot-password'
  | 'reset-password';

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: AuthError;
}
