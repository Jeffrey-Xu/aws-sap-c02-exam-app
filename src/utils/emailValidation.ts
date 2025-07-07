/**
 * Email validation utilities
 * Includes both client-side validation and simulated email verification
 */

// Email regex pattern for basic validation
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Common disposable email domains to block
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  'tempmail.org',
  'guerrillamail.com',
  'mailinator.com',
  'throwaway.email',
  'temp-mail.org',
  'getnada.com',
  'maildrop.cc'
];

export interface EmailValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions?: string[];
}

export function validateEmailFormat(email: string): EmailValidationResult {
  const errors: string[] = [];
  const suggestions: string[] = [];
  
  // Basic format check
  if (!email) {
    errors.push('Email address is required');
    return { isValid: false, errors };
  }
  
  if (!EMAIL_REGEX.test(email)) {
    errors.push('Please enter a valid email address');
    return { isValid: false, errors };
  }
  
  const domain = email.split('@')[1]?.toLowerCase();
  
  // Check for disposable email
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    errors.push('Disposable email addresses are not allowed. Please use a permanent email address.');
    return { isValid: false, errors };
  }
  
  // Suggest common domain corrections
  const commonTypos: Record<string, string> = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'outlok.com': 'outlook.com'
  };
  
  if (commonTypos[domain]) {
    suggestions.push(`Did you mean ${email.replace(domain, commonTypos[domain])}?`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    suggestions: suggestions.length > 0 ? suggestions : undefined
  };
}

export function validatePassword(password: string): EmailValidationResult {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a more secure password.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Simulated email verification service
export interface EmailVerificationService {
  sendVerificationEmail: (email: string, token: string) => Promise<boolean>;
  verifyEmailToken: (email: string, token: string) => Promise<boolean>;
}

export const emailVerificationService: EmailVerificationService = {
  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`📧 Verification email sent to ${email}`);
    console.log(`🔗 Verification link: ${window.location.origin}/verify-email?token=${token}&email=${encodeURIComponent(email)}`);
    
    const verificationData = {
      email,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    localStorage.setItem(`email_verification_${email}`, JSON.stringify(verificationData));
    return true;
  },
  
  async verifyEmailToken(email: string, token: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const storedData = localStorage.getItem(`email_verification_${email}`);
    if (!storedData) return false;
    
    try {
      const verificationData = JSON.parse(storedData);
      const isExpired = new Date() > new Date(verificationData.expiresAt);
      const isValidToken = verificationData.token === token;
      
      if (isValidToken && !isExpired) {
        localStorage.removeItem(`email_verification_${email}`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
};

export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  
  if (password.length >= 10 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[!@#$%^&*]/.test(password)) {
    score += 1;
  }
  
  if (score <= 2) {
    return { score, label: 'Weak', color: 'text-red-600' };
  } else if (score <= 4) {
    return { score, label: 'Fair', color: 'text-yellow-600' };
  } else if (score <= 6) {
    return { score, label: 'Good', color: 'text-blue-600' };
  } else {
    return { score, label: 'Strong', color: 'text-green-600' };
  }
}
