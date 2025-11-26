/* eslint-disable @typescript-eslint/no-explicit-any */
// services/auth-service.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7113/api";

export interface AuthResponseDto {
  token: string;
  expiresIn: number;
  userId: string;
  email: string;
  roles: string[];
}

export interface LoginDto {
  phoneNumber: string;
  password: string;
}

// Biến global để chia sẻ trạng thái token
let globalToken: string | null = null;
let globalUserId: string | null = null;
let globalUserEmail: string | null = null;
let globalUserRoles: string[] = [];
class AuthService {
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  private isLoggingOut = false; // ← THÊM FLAG NÀY

  private getStoredToken(): string | null {
    if (globalToken) {
      console.log(' Using globalToken');
      return globalToken;
    }
    
    if (typeof window !== 'undefined') {
      const storedToken = sessionStorage.getItem('authToken');
      console.log(' sessionStorage token:', storedToken);
      if (storedToken) {
        globalToken = storedToken;
        return storedToken;
      }
    }
    console.log(' No token found');
    return null;
  }

  private setStoredUserData(token: string, userId: string, email: string, roles: string[] = []): void {
    globalToken = token;
    globalUserId = userId;
    globalUserEmail = email;
    globalUserRoles = roles;
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('userId', userId);
      sessionStorage.setItem('userEmail', email);
      sessionStorage.setItem('userRoles', JSON.stringify(roles));
    }
  }

  private clearStoredToken(): void {
    globalToken = null;
    globalUserId = null;
    globalUserEmail = null;
    globalUserRoles = [];
    
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userEmail');
      sessionStorage.removeItem('userRoles');
    }
  }

  async phoneLogin(data: LoginDto): Promise<AuthResponseDto> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login Fail");
    }

    const authData = await response.json();
    this.setStoredUserData(authData.token, authData.userId, authData.email, authData.roles);
    
    return authData;
  }

  getCurrentUserRoles(): string[] {
    if (globalUserRoles.length > 0) {
      return globalUserRoles;
    }
    
    if (typeof window !== 'undefined') {
      const storedRoles = sessionStorage.getItem('userRoles');
      if (storedRoles) {
        try {
          globalUserRoles = JSON.parse(storedRoles);
          return globalUserRoles;
        } catch {
          return [];
        }
      }
    }
    return [];
  }

  async refreshToken(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const authData = await response.json();
    const currentUserId = this.getCurrentUserId();
    const currentUserEmail = this.getCurrentUserEmail();
    this.setStoredUserData(
      authData.token,
      currentUserId || authData.userId || "",
      currentUserEmail || authData.email || ""
    );

    return authData.token;
  }


  getToken(): string | null {
    const token = this.getStoredToken();
    console.log(' getToken called - Token exists:', !!token);
    console.log(' sessionStorage authToken:', sessionStorage.getItem('authToken'));
    console.log(' globalToken:', globalToken);
    return token;
  }

  getCurrentUserId(): string | null {
    if (globalUserId) {
      return globalUserId;
    }

    if (typeof window !== "undefined") {
      const storedUserId = sessionStorage.getItem("userId");
      if (storedUserId) {
        globalUserId = storedUserId;
        return storedUserId;
      }
    }
    return null;
  }

  getCurrentUserEmail(): string | null {
    if (globalUserEmail) {
      return globalUserEmail;
    }

    if (typeof window !== "undefined") {
      const storedUserEmail = sessionStorage.getItem("userEmail");
      if (storedUserEmail) {
        globalUserEmail = storedUserEmail;
        return storedUserEmail;
      }
    }
    return null;
  }

  async handleTokenRefresh(): Promise<string> {
   
    if (this.isLoggingOut) {
      throw new Error("Logging out, cannot refresh token");
    }

    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await this.refreshToken();

      this.failedQueue.forEach(({ resolve }) => resolve(newToken));
      this.failedQueue = [];

      return newToken;
    } catch (error) {
      this.failedQueue.forEach(({ reject }) => reject(error));
      this.failedQueue = [];

      this.clearStoredToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login?session=expired";
      }
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  async logout(): Promise<void> {
    this.isLoggingOut = true; 

    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      this.clearStoredToken();
      this.isLoggingOut = false; // ← RESET FLAG SAU KHI LOGOUT
    }
  }

  isAuthenticated(): boolean {
    const authenticated = !!this.getToken();
    console.log(' isAuthenticated:', authenticated);
    return authenticated;
  }
}

export const authService = new AuthService();
