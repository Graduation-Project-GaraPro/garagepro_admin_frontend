// Technician validation functions for the emergency rescue project
import { isNotEmpty, isValidEmail, isValidPhone, isValidLocation, isValidDate } from './index';

// Define validation result interface
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Define technician registration data interface
interface TechnicianRegistrationData {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  password: string;
  confirmPassword: string;
}

/**
 * Validates if a technician registration request is valid
 * @param technicianData - The technician registration data object
 * @returns Object with isValid flag and errors array
 */
export const validateTechnicianRegistration = (technicianData: TechnicianRegistrationData): ValidationResult => {
  const errors: string[] = [];
  
  if (!isNotEmpty(technicianData.name)) {
    errors.push('Name is required');
  }
  
  if (!isValidEmail(technicianData.email)) {
    errors.push('Valid email is required');
  }
  
  if (!isValidPhone(technicianData.phone)) {
    errors.push('Valid phone number is required');
  }
  
  if (!isNotEmpty(technicianData.specialization)) {
    errors.push('Specialization is required');
  }
  
  if (!isNotEmpty(technicianData.experience)) {
    errors.push('Experience information is required');
  }
  
  if (!isNotEmpty(technicianData.password)) {
    errors.push('Password is required');
  } else if (technicianData.password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }
  
  if (technicianData.password !== technicianData.confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Define technician profile update data interface
interface TechnicianProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  password?: string;
  currentPassword?: string;
  confirmPassword?: string;
}

/**
 * Validates if a technician profile update request is valid
 * @param profileData - The profile update data object
 * @returns Object with isValid flag and errors array
 */
export const validateTechnicianProfileUpdate = (profileData: TechnicianProfileUpdateData): ValidationResult => {
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
  
  if (isNotEmpty(profileData.specialization) && profileData.specialization!.length < 2) {
    errors.push('Specialization must be at least 2 characters');
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

// Import Location type from index.ts
import { Location } from './index';

// Define availability update data interface
interface AvailabilityUpdateData {
  isAvailable: boolean | null | undefined;
  currentLocation?: Location;
}

/**
 * Validates if a technician availability update is valid
 * @param availabilityData - The availability update data object
 * @returns Object with isValid flag and errors array
 */
export const validateAvailabilityUpdate = (availabilityData: AvailabilityUpdateData): ValidationResult => {
  const errors: string[] = [];
  
  if (availabilityData.isAvailable === undefined || availabilityData.isAvailable === null) {
    errors.push('Availability status is required');
  }
  
  if (availabilityData.isAvailable && !isValidLocation(availabilityData.currentLocation!)) {
    errors.push('Valid current location is required when setting availability to true');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Define service area interface
interface ServiceArea {
  name: string;
  center: Location;
  radius: number;
}

// Define service area update data interface
interface ServiceAreaUpdateData {
  areas: ServiceArea[];
}

/**
 * Validates if a service area update is valid
 * @param serviceAreaData - The service area update data object
 * @returns Object with isValid flag and errors array
 */
export const validateServiceAreaUpdate = (serviceAreaData: ServiceAreaUpdateData): ValidationResult => {
  const errors: string[] = [];
  
  if (!Array.isArray(serviceAreaData.areas) || serviceAreaData.areas.length === 0) {
    errors.push('At least one service area is required');
  } else {
    for (let i = 0; i < serviceAreaData.areas.length; i++) {
      const area = serviceAreaData.areas[i];
      
      if (!isNotEmpty(area.name)) {
        errors.push(`Area name is required for area at index ${i}`);
      }
      
      if (!isValidLocation(area.center)) {
        errors.push(`Valid center location is required for area at index ${i}`);
      }
      
      if (!isNotEmpty(area.radius) || isNaN(area.radius) || area.radius <= 0) {
        errors.push(`Valid radius is required for area at index ${i}`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Define skill interface
interface Skill {
  name: string;
  certificationDate?: string;
}

// Define skill update data interface
interface SkillUpdateData {
  skills: Skill[];
}

/**
 * Validates if a skill/certification update is valid
 * @param skillData - The skill update data object
 * @returns Object with isValid flag and errors array
 */
export const validateSkillUpdate = (skillData: SkillUpdateData): ValidationResult => {
  const errors: string[] = [];
  
  if (!Array.isArray(skillData.skills) || skillData.skills.length === 0) {
    errors.push('At least one skill or certification is required');
  } else {
    for (let i = 0; i < skillData.skills.length; i++) {
      const skill = skillData.skills[i];
      
      if (!isNotEmpty(skill.name)) {
        errors.push(`Skill name is required for skill at index ${i}`);
      }
      
      if (skill.certificationDate && !isValidDate(skill.certificationDate)) {
        errors.push(`Valid certification date is required for skill at index ${i}`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};