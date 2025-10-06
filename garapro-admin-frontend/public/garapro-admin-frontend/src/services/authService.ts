export interface GoogleLoginDto {
  idToken: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7113/api';

export interface AuthResponseDto {
  token: string;      // access token JWT
  expiresIn: number;  // số giây token sống
  userId: string;     // Id của user
  email: string;      // Email user
  roles: string[];    // Roles user (Admin, Customer, ...)
}

export interface SendOtpDto {
  phoneNumber: string;
}

export interface VerifyOtpDto {
  phoneNumber: string;
  token: string;
}

export interface CompleteRegistrationDto {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  password: string;
  confirmPassword: string;
}

class AuthService {
  async sendOtp(data: SendOtpDto): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send OTP");
    }

    return response.json();
  }

  async verifyOtp(data: VerifyOtpDto): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to verify OTP");
    }

    return response.json();
  }

  async completeRegistration(data: CompleteRegistrationDto): Promise<{
    message: string;
    userId: string;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/auth/complete-registration`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    return response.json();
  }

  async googleLogin(dto: GoogleLoginDto): Promise<AuthResponseDto> {
    const response = await fetch(`${API_BASE_URL}/auth/google-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Google login failed: ${errorText}`)
    }

    const authData = await response.json()
    
    // Lưu token và user info vào localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', authData.token)
      localStorage.setItem('userId', authData.userId)
      localStorage.setItem('userEmail', authData.email)
      localStorage.setItem('userRoles', JSON.stringify(authData.roles))
    }

    return authData
  }

  async phoneLogin(data: { phoneNumber: string; password: string }): Promise<AuthResponseDto> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Đăng nhập thất bại");
    }
  
    const authData = await response.json()
    
    // Lưu token và user info vào localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', authData.token)
      localStorage.setItem('userId', authData.userId)
      localStorage.setItem('userEmail', authData.email)
      localStorage.setItem('userRoles', JSON.stringify(authData.roles))
    }

    return authData
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userRoles')
    }
  }

  getCurrentUser(): { userId: string | null; email: string | null; roles: string[] } {
    if (typeof window !== 'undefined') {
      return {
        userId: localStorage.getItem('userId'),
        email: localStorage.getItem('userEmail'),
        roles: JSON.parse(localStorage.getItem('userRoles') || '[]')
      }
    }
    return { userId: null, email: null, roles: [] }
  }

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('authToken')
    }
    return false
  }

}

export const authService = new AuthService();
