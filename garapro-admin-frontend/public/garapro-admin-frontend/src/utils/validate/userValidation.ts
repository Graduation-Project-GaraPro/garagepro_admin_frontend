// User validation functions for the emergency rescue project
import { isNotEmpty, isValidEmail, isValidPhone } from './index';

// Define validation result interface
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Define login data interface
interface LoginData {
  email?: string;
  phone?: string;
  password: string;
}

/**
 * Validates if a user login request is valid
 * @param loginData - The login data object
 * @returns Object with isValid flag and errors array
 */
export const validateLoginRequest = (loginData: LoginData): ValidationResult => {
  const errors: string[] = [];
  
  if (!isNotEmpty(loginData.email) && !isNotEmpty(loginData.phone)) {
    errors.push('Email or phone number is required');
  }
  
  if (isNotEmpty(loginData.email) && !isValidEmail(loginData.email!)) {
    errors.push('Valid email is required');
  }
  
  if (isNotEmpty(loginData.phone) && !isValidPhone(loginData.phone!)) {
    errors.push('Valid phone number is required');
  }
  
  if (!isNotEmpty(loginData.password)) {
    errors.push('Password is required');
  } else if (loginData.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Define user registration data interface
interface UserRegistrationData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

/**
 * Validates if a user registration request is valid
 * @param userData - The user registration data object
 * @returns Object with isValid flag and errors array
 */
export const validateUserRegistration = (userData: UserRegistrationData): ValidationResult => {
  const errors: string[] = [];
  
  if (!isNotEmpty(userData.name)) {
    errors.push('Name is required');
  }
  
  if (!isValidEmail(userData.email)) {
    errors.push('Valid email is required');
  }
  
  if (!isValidPhone(userData.phone)) {
    errors.push('Valid phone number is required');
  }
  
  if (!isNotEmpty(userData.password)) {
    errors.push('Password is required');
  } else if (userData.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (userData.password !== userData.confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Define profile update data interface
interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  currentPassword?: string;
  confirmPassword?: string;
}

/**
 * Validates if a user profile update request is valid
 * @param profileData - The profile update data object
 * @returns Object with isValid flag and errors array
 */
export const validateProfileUpdate = (profileData: ProfileUpdateData): ValidationResult => {
  const errors: string[] = [];
  
  if (isNotEmpty(profileData.name) && profileData.name!.length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  
  if (isNotEmpty(profileData.email) && !isValidEmail(profileData.email!)) {
    errors.push('Valid email is required');
  }
  
  if (isNotEmpty(profileData.phone) && !isValidPhone(profileData.phone!)) {
    errors.push('Valid phone number is required');
  }
  
  if (isNotEmpty(profileData.password)) {
    if (profileData.password!.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    if (!isNotEmpty(profileData.currentPassword)) {
      errors.push('Current password is required to change password');
    }
    
    if (profileData.password !== profileData.confirmPassword) {
      errors.push('Passwords do not match');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Define password reset data interface
interface PasswordResetData {
  email: string;
}

/**
 * Validates if a password reset request is valid
 * @param resetData - The password reset data object
 * @returns Object with isValid flag and errors array
 */
export const validatePasswordReset = (resetData: PasswordResetData): ValidationResult => {
  const errors: string[] = [];
  
  if (!isValidEmail(resetData.email)) {
    errors.push('Valid email is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Define new password data interface
interface NewPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Validates if a new password submission is valid
 * @param passwordData - The new password data object
 * @returns Object with isValid flag and errors array
 */
export const validateNewPassword = (passwordData: NewPasswordData): ValidationResult => {
  const errors: string[] = [];
  
  if (!isNotEmpty(passwordData.token)) {
    errors.push('Reset token is required');
  }
  
  if (!isNotEmpty(passwordData.password)) {
    errors.push('Password is required');
  } else if (passwordData.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (passwordData.password !== passwordData.confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};