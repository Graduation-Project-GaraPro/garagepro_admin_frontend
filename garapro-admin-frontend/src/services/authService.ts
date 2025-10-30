// services/auth-service.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7113/api';

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

class AuthService {
  private isRefreshing = false;
  private failedQueue: Array<{resolve: (token: string) => void, reject: (error: any) => void}> = [];
   
  private isLoggingOut = false; // ← THÊM FLAG NÀY

  private getStoredToken(): string | null {
    if (globalToken) {
      return globalToken;
    }
    
    if (typeof window !== 'undefined') {
      const storedToken = sessionStorage.getItem('authToken');
      if (storedToken) {
        globalToken = storedToken;
        return storedToken;
      }
    }
    return null;
  }

  private setStoredUserData(token: string, userId: string, email: string): void {
    globalToken = token;
    globalUserId = userId;
    globalUserEmail = email;
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('userId', userId);
      sessionStorage.setItem('userEmail', email);
    }
  }

  private clearStoredToken(): void {
    globalToken = null;
    globalUserId = null;
    globalUserEmail = null;
    
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userEmail');
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
      throw new Error(error.error || "Đăng nhập thất bại");
    }

    const authData = await response.json();
    this.setStoredUserData(authData.token, authData.userId, authData.email);
    
    return authData;
  }

  async refreshToken(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const authData = await response.json();
    // Giữ lại userId và email khi refresh token
    const currentUserId = this.getCurrentUserId();
    const currentUserEmail = this.getCurrentUserEmail();
    this.setStoredUserData(
      authData.token, 
      currentUserId || authData.userId || '', 
      currentUserEmail || authData.email || ''
    );
    
    return authData.token;
  }

  // CHỈ DÙNG MỘT HÀM GETTOKEN DUY NHẤT
  getToken(): string | null {
    return this.getStoredToken();
  }

  getCurrentUserId(): string | null {
    if (globalUserId) {
      return globalUserId;
    }
    
    if (typeof window !== 'undefined') {
      const storedUserId = sessionStorage.getItem('userId');
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
    
    if (typeof window !== 'undefined') {
      const storedUserEmail = sessionStorage.getItem('userEmail');
      if (storedUserEmail) {
        globalUserEmail = storedUserEmail;
        return storedUserEmail;
      }
    }
    return null;
  }

  async handleTokenRefresh(): Promise<string> {
    // KIỂM TRA NẾU ĐANG LOGOUT THÌ KHÔNG REFRESH
    if (this.isLoggingOut) {
      throw new Error('Logging out, cannot refresh token');
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
      if (typeof window !== 'undefined') {
        window.location.href = '/login?session=expired';
      }
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }


  async logout(): Promise<void> {
    this.isLoggingOut = true; // ← SET FLAG TRƯỚC KHI LOGOUT
    
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.clearStoredToken();
      this.isLoggingOut = false; // ← RESET FLAG SAU KHI LOGOUT
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();