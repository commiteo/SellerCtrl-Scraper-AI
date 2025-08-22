/**
 * Comprehensive Validation Library for SellerCtrl Application
 * Provides validation schemas and utilities for all forms and data inputs
 */

import { ValidationError } from '@/types';

// Base validation utilities
export class ValidationUtils {
  /**
   * Validates email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Validates Amazon ASIN format
   */
  static isValidASIN(asin: string): boolean {
    const asinRegex = /^[A-Z0-9]{10}$/i;
    return asinRegex.test(asin.trim());
  }

  /**
   * Validates URL format
   */
  static isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates phone number (international format)
   */
  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s-()]/g, ''));
  }

  /**
   * Validates password strength
   */
  static isValidPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
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
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates price value
   */
  static isValidPrice(price: number | string): boolean {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return !isNaN(numPrice) && numPrice >= 0 && numPrice <= 999999;
  }

  /**
   * Validates Telegram Bot Token
   */
  static isValidTelegramBotToken(token: string): boolean {
    const tokenRegex = /^\d{8,10}:[a-zA-Z0-9_-]{35}$/;
    return tokenRegex.test(token.trim());
  }

  /**
   * Validates Telegram Chat ID
   */
  static isValidTelegramChatId(chatId: string): boolean {
    const chatIdRegex = /^-?\d+$/;
    return chatIdRegex.test(chatId.trim());
  }
}

// Validation schema interface
export interface ValidationSchema {
  [key: string]: {
    required?: boolean;
    type?: 'string' | 'number' | 'email' | 'url' | 'asin' | 'password' | 'phone' | 'telegram_token' | 'telegram_chat_id';
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
    message?: string;
  };
}

// Validation schemas for different forms
export const ValidationSchemas = {
  // User Registration Schema
  userRegistration: {
    name: {
      required: true,
      type: 'string' as const,
      minLength: 2,
      maxLength: 50,
      message: 'Name must be between 2 and 50 characters'
    },
    email: {
      required: true,
      type: 'email' as const,
      message: 'Please enter a valid email address'
    },
    password: {
      required: true,
      type: 'password' as const,
      message: 'Password must meet security requirements'
    },
    confirmPassword: {
      required: true,
      type: 'string' as const,
      custom: (value: string, data: any) => {
        return value === data.password || 'Passwords do not match';
      }
    }
  },

  // User Login Schema
  userLogin: {
    email: {
      required: true,
      type: 'email' as const,
      message: 'Please enter a valid email address'
    },
    password: {
      required: true,
      type: 'string' as const,
      minLength: 1,
      message: 'Password is required'
    }
  },

  // Product Addition Schema
  productAddition: {
    asin: {
      required: true,
      type: 'asin' as const,
      message: 'Please enter a valid Amazon ASIN (10 characters)'
    },
    region: {
      required: true,
      type: 'string' as const,
      pattern: /^(com|ca|uk|de|fr|it|es|jp|in|com\.mx|com\.br|com\.au|sa|ae|eg)$/,
      message: 'Please select a valid Amazon region'
    },
    scrapeInterval: {
      required: true,
      type: 'number' as const,
      min: 5,
      max: 1440,
      message: 'Scrape interval must be between 5 and 1440 minutes'
    },
    alertThreshold: {
      required: false,
      type: 'number' as const,
      min: 0,
      max: 100,
      message: 'Alert threshold must be between 0 and 100 percent'
    }
  },

  // Telegram Configuration Schema
  telegramConfig: {
    botToken: {
      required: true,
      type: 'telegram_token' as const,
      message: 'Please enter a valid Telegram Bot Token'
    },
    chatId: {
      required: true,
      type: 'telegram_chat_id' as const,
      message: 'Please enter a valid Telegram Chat ID'
    }
  },

  // Multi-Domain Scraping Schema
  multiDomainScraping: {
    asins: {
      required: true,
      type: 'string' as const,
      custom: (value: string) => {
        const asins = value.split(/[\n,]/).map(a => a.trim()).filter(Boolean);
        if (asins.length === 0) return 'At least one ASIN is required';
        if (asins.length > 100) return 'Maximum 100 ASINs allowed';
        
        const invalidAsins = asins.filter(asin => !ValidationUtils.isValidASIN(asin));
        if (invalidAsins.length > 0) {
          return `Invalid ASINs: ${invalidAsins.slice(0, 5).join(', ')}${invalidAsins.length > 5 ? '...' : ''}`;
        }
        
        return true;
      }
    },
    domains: {
      required: true,
      custom: (value: string[]) => {
        if (!Array.isArray(value) || value.length === 0) {
          return 'At least one domain must be selected';
        }
        return true;
      },
      message: 'Please select at least one Amazon domain'
    },
    batchName: {
      required: false,
      type: 'string' as const,
      maxLength: 100,
      message: 'Batch name must be less than 100 characters'
    }
  },

  // Price Monitor Schema
  priceMonitor: {
    asin: {
      required: true,
      type: 'asin' as const,
      message: 'Please enter a valid Amazon ASIN'
    },
    region: {
      required: true,
      type: 'string' as const,
      pattern: /^(com|ca|uk|de|fr|it|es|jp|in|com\.mx|com\.br|com\.au|sa|ae|eg)$/,
      message: 'Please select a valid Amazon region'
    },
    scrapeInterval: {
      required: true,
      type: 'number' as const,
      min: 5,
      max: 1440,
      message: 'Scrape interval must be between 5 and 1440 minutes'
    },
    alertThreshold: {
      required: false,
      type: 'number' as const,
      min: 0,
      max: 100,
      message: 'Alert threshold must be between 0 and 100 percent'
    }
  },

  // Contact Form Schema
  contactForm: {
    name: {
      required: true,
      type: 'string' as const,
      minLength: 2,
      maxLength: 50,
      message: 'Name must be between 2 and 50 characters'
    },
    email: {
      required: true,
      type: 'email' as const,
      message: 'Please enter a valid email address'
    },
    subject: {
      required: true,
      type: 'string' as const,
      minLength: 5,
      maxLength: 100,
      message: 'Subject must be between 5 and 100 characters'
    },
    message: {
      required: true,
      type: 'string' as const,
      minLength: 10,
      maxLength: 1000,
      message: 'Message must be between 10 and 1000 characters'
    }
  }
};

// Main validation function
export function validateData(data: any, schema: ValidationSchema): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Check required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        message: rules.message || `${field} is required`
      });
      continue;
    }

    // Skip validation if field is not required and empty
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Type validation
    if (rules.type) {
      let isValidType = true;
      let typeError = '';

      switch (rules.type) {
        case 'string':
          isValidType = typeof value === 'string';
          typeError = 'Must be a string';
          break;
        case 'number':
          isValidType = typeof value === 'number' && !isNaN(value);
          typeError = 'Must be a valid number';
          break;
        case 'email':
          isValidType = ValidationUtils.isValidEmail(value);
          typeError = 'Must be a valid email address';
          break;
        case 'url':
          isValidType = ValidationUtils.isValidURL(value);
          typeError = 'Must be a valid URL';
          break;
        case 'asin':
          isValidType = ValidationUtils.isValidASIN(value);
          typeError = 'Must be a valid Amazon ASIN (10 characters)';
          break;
        case 'password':
          const passwordValidation = ValidationUtils.isValidPassword(value);
          isValidType = passwordValidation.isValid;
          typeError = passwordValidation.errors.join(', ');
          break;
        case 'phone':
          isValidType = ValidationUtils.isValidPhoneNumber(value);
          typeError = 'Must be a valid phone number';
          break;
        case 'telegram_token':
          isValidType = ValidationUtils.isValidTelegramBotToken(value);
          typeError = 'Must be a valid Telegram Bot Token';
          break;
        case 'telegram_chat_id':
          isValidType = ValidationUtils.isValidTelegramChatId(value);
          typeError = 'Must be a valid Telegram Chat ID';
          break;
      }

      if (!isValidType) {
        errors.push({
          field,
          message: rules.message || typeError
        });
        continue;
      }
    }

    // Length validation for strings
    if (typeof value === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push({
          field,
          message: rules.message || `${field} must be at least ${rules.minLength} characters`
        });
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push({
          field,
          message: rules.message || `${field} must be no more than ${rules.maxLength} characters`
        });
      }
    }

    // Range validation for numbers
    if (typeof value === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        errors.push({
          field,
          message: rules.message || `${field} must be at least ${rules.min}`
        });
      }
      if (rules.max !== undefined && value > rules.max) {
        errors.push({
          field,
          message: rules.message || `${field} must be no more than ${rules.max}`
        });
      }
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      errors.push({
        field,
        message: rules.message || `${field} format is invalid`
      });
    }

    // Custom validation
    if (rules.custom) {
      const customResult = rules.custom(value, data);
      if (customResult !== true) {
        errors.push({
          field,
          message: typeof customResult === 'string' ? customResult : (rules.message || `${field} is invalid`)
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Utility function to validate single field
export function validateField(value: any, fieldName: string, schema: ValidationSchema): ValidationError | null {
  const fieldRules = schema[fieldName];
  if (!fieldRules) return null;

  const result = validateData({ [fieldName]: value }, { [fieldName]: fieldRules });
  return result.errors.length > 0 ? result.errors[0] : null;
}

// Utility function to sanitize input data
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>"'&]/g, (char) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    });
}

// Utility function to validate multiple ASINs
export function validateASINs(asinsText: string): { valid: string[]; invalid: string[]; errors: string[] } {
  const asins = asinsText
    .split(/[\n,;\s]+/)
    .map(asin => asin.trim())
    .filter(Boolean);

  const valid: string[] = [];
  const invalid: string[] = [];
  const errors: string[] = [];

  if (asins.length === 0) {
    errors.push('No ASINs provided');
    return { valid, invalid, errors };
  }

  if (asins.length > 100) {
    errors.push('Maximum 100 ASINs allowed');
  }

  asins.forEach(asin => {
    if (ValidationUtils.isValidASIN(asin)) {
      valid.push(asin.toUpperCase());
    } else {
      invalid.push(asin);
    }
  });

  // Remove duplicates
  const uniqueValid = [...new Set(valid)];
  
  if (invalid.length > 0) {
    errors.push(`Invalid ASINs found: ${invalid.slice(0, 5).join(', ')}${invalid.length > 5 ? '...' : ''}`);
  }

  return {
    valid: uniqueValid,
    invalid,
    errors
  };
}

// Export validation utilities for backward compatibility
export { ValidationUtils as Validator };