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
  passwordExpiryDays: number;
  enableBruteForceProtection: boolean;
  updatedAt: string;
  updatedBy: string | null;
}

class SecurityPolicyService {
  private policy: SecurityPolicy | null = null;
  private readonly apiUrl = "https://localhost:7113/api/SecurityPolicy";

  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}, retryCount = 0): Promise<Response> {
  const token = authService.getToken();
  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    throw new Error('Authentication required');
  }
  if (!token) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    throw new Error('Authentication required');
  }

  // Tạo headers với token
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  const fetchOptions = {
    ...options,
    headers,
    credentials: 'include' as RequestCredentials
  };

  let response = await fetch(url, fetchOptions);

  // Nếu token hết hạn, thử refresh token và gửi lại request
  if (response.status === 401 && retryCount === 0) {
    try {
      const newToken = await authService.handleTokenRefresh();
      
      // Cập nhật header với token mới
      const retryHeaders = {
        ...headers,
        'Authorization': `Bearer ${newToken}`
      };

      const retryOptions = {
        ...options,
        headers: retryHeaders,
        credentials: 'include' as RequestCredentials
      };

      response = await fetch(url, retryOptions);
    } catch (refreshError) {
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      throw refreshError;
    }
  }
   if (response.status === 403) {
      console.log('🚫 Access denied');
      if (typeof window !== 'undefined') {
        window.location.href = '/access-denied';
      }
      window.location.href = '/access-denied';
      throw new Error('Access denied: You do not have permission to access this resource.');
    }

  return response;
}

  async loadPolicy(): Promise<SecurityPolicy> {
    try {
      console.log('Loading policy from:', `${this.apiUrl}/current`);
      
      const response = await this.makeAuthenticatedRequest(`${this.apiUrl}/current`, {
        method: 'GET',
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

      const response = await this.makeAuthenticatedRequest(this.apiUrl, {
        method: "PUT",
        body: JSON.stringify(newPolicy),
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