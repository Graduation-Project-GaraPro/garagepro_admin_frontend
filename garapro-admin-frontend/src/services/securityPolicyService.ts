// services/securityPolicyService.ts
import { authService } from './authService';

export interface SecurityPolicy {
  minPasswordLength: number;
  requireSpecialChar: boolean;
  requireNumber: boolean;
  requireUppercase: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  accountLockoutTime: number;
  // mfaRequired: boolean;
  passwordExpiryDays: number;
  enableBruteForceProtection: boolean;
  updatedAt: string;
  updatedBy: string | null;
}

class SecurityPolicyService {
  private policy: SecurityPolicy | null = null;
  private readonly apiUrl = "https://localhost:7113/api/SecurityPolicy";

  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    try {
      const token = await authService.getValidToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('No authentication token available for security policy request');
    }

    return headers;
  }

  async loadPolicy(): Promise<SecurityPolicy> {
    try {
      console.log('Loading policy from:', `${this.apiUrl}/current`);
      
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.apiUrl}/current`, {
        method: 'GET',
        headers,
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to load security policy: ${response.status} - ${errorText}`);
      }

      const data: SecurityPolicy = await response.json();
      console.log('Policy data received:', data);
      this.policy = data;
      return this.policy;
    } catch (error) {
      console.error('Error loading policy:', error);
      throw error;
    }
  }

  async getPolicy(): Promise<SecurityPolicy> {
    if (!this.policy) {
      console.log('No cached policy, loading from API...');
      return await this.loadPolicy();
    }
    console.log('Returning cached policy:', this.policy);
    return this.policy;
  }

  clearCache(): void {
    this.policy = null;
    console.log('Policy cache cleared');
  }

  async updatePolicy(newPolicy: Partial<SecurityPolicy>): Promise<{ message: string; updatedPolicy: SecurityPolicy }> {
    try {
      console.log("Updating policy with:", newPolicy);
  
      const headers = await this.getAuthHeaders();
  
      const response = await fetch(this.apiUrl, {
        method: "PUT",
        headers,
        body: JSON.stringify(newPolicy),
        mode: "cors",
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update security policy: ${response.status} - ${errorText}`);
      }
  
      const result = await response.json();
  
      if (!result.updatedPolicy) {
        throw new Error("Response does not contain updatedPolicy");
      }
  
      // Clear cache after update
      this.clearCache();
      
      return {
        message: result.message,
        updatedPolicy: result.updatedPolicy,
      };
    } catch (error) {
      console.error("Error updating policy:", error);
      throw error;
    }
  }

  validatePassword(password: string, policy: SecurityPolicy): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < policy.minPasswordLength) {
      errors.push(`Password must be at least ${policy.minPasswordLength} characters long`);
    }
    if (policy.requireSpecialChar && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    if (policy.requireNumber && !/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  getSessionTimeoutInMs(policy: SecurityPolicy): number {
    return policy.sessionTimeout * 60 * 1000;
  }

  isBruteForceProtectionEnabled(policy: SecurityPolicy): boolean {
    return policy.enableBruteForceProtection;
  }
}

export const securityPolicyService = new SecurityPolicyService();