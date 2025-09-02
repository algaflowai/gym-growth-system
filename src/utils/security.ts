// Security utilities for input validation and sanitization
import { supabase } from '@/integrations/supabase/client';

// Input sanitization utilities
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>"/&']/g, '') // Remove HTML/script injection chars
    .replace(/[\x00-\x1f\x7f]/g, '') // Remove control characters
    .trim();
};

export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  
  // Basic email sanitization
  return email
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, '')
    .trim();
};

export const sanitizeName = (name: string): string => {
  if (!name) return '';
  
  // Allow letters, spaces, hyphens, apostrophes
  return name
    .replace(/[^a-zA-ZÀ-ÿ\s'-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const sanitizePhone = (phone: string): string => {
  if (!phone) return '';
  
  // Allow numbers, spaces, hyphens, parentheses, plus
  return phone
    .replace(/[^0-9\s\-\(\)\+]/g, '')
    .trim();
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('A senha deve conter pelo menos um caractere especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Security logging function
export const logSecurityEvent = async (
  action: string,
  details: Record<string, any> = {},
  userId?: string
) => {
  try {
    await supabase.rpc('log_security_event', {
      action_type: action,
      event_details: details,
      target_user_id: userId || null
    });
  } catch (error) {
    console.warn('Failed to log security event:', error);
  }
};

// Rate limiting utilities (client-side basic implementation)
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const authRateLimiter = new RateLimiter();

// Input validation utilities
export const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  },
  
  name: (name: string): boolean => {
    return name.length >= 2 && name.length <= 100 && /^[a-zA-ZÀ-ÿ\s'-]+$/.test(name);
  },
  
  phone: (phone: string): boolean => {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone);
  },
  
  cpf: (cpf: string): boolean => {
    const cleanCpf = cpf.replace(/[^\d]/g, '');
    return cleanCpf.length === 11 && /^\d{11}$/.test(cleanCpf);
  }
};