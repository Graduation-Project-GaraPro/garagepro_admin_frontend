import { authService } from "./authService";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  success: boolean;
}

interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private retryAttempts: number;
  private retryDelay: number;
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_API_URL ||
      "https://localhost:7113/api",
    retryAttempts: number = 3,
    retryDelay: number = 1000
  ) {
    this.baseUrl = baseUrl;
    this.retryAttempts = retryAttempts;
    this.retryDelay = retryDelay;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  // 🧠 Lấy token từ localStorage (hoặc cookie)
  private getAccessToken(): string | null {
    return localStorage.getItem("authToken");
  }

  // 🔑 Lưu token mới
  private setAccessToken(token: string) {
    localStorage.setItem("authToken", token);
  }

  // 🧹 Xóa token khi logout
  private clearAccessToken() {
    localStorage.removeItem("authToken");
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async refreshAccessToken(): Promise<void> {
    if (this.isRefreshing) {
      // Nếu đang refresh, chờ kết quả cũ
      return this.refreshPromise!;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
          method: "POST",
          credentials: "include", // để gửi cookie refresh
        });

        if (!response.ok) throw new Error("Failed to refresh token");

        const data = await response.json();
        this.setAccessToken(data.accessToken);
      } catch (error) {
        this.clearAccessToken();
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    // ✅ Thêm Bearer Token nếu có
    const token = authService.getToken();
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      credentials: "include", // cần thiết để gửi cookie refresh
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401 && token) {
        // Có thể là token hết hạn → refresh
        await this.refreshAccessToken();

        // 🔁 Sau khi refresh xong → retry request 1 lần
        const newToken = this.getAccessToken();
        if (newToken) {
          config.headers = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          };
          const retryResponse = await fetch(url, config);
          if (!retryResponse.ok) {
            const errData = await this.parseErrorResponse(retryResponse);
            throw errData;
          }
          const retryData = await retryResponse.json();
          return {
            data: retryData,
            status: retryResponse.status,
            success: true,
          };
        }
      }

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        throw errorData;
      }

      const data = await response.json();
      return { data, status: response.status, success: true };
    } catch (error) {
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        await this.delay(this.retryDelay * attempt);
        return this.request<T>(endpoint, options, attempt + 1);
      }
      throw this.formatError(error);
    }
  }

  private shouldRetry(error: any): boolean {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return true;
    }
    if (error.status >= 500 && error.status < 600) {
      return true;
    }
    return false;
  }

  private async parseErrorResponse(response: Response): Promise<ApiError> {
    try {
      const errorData = await response.json();
      return {
        message: errorData.message || "An error occurred",
        status: response.status,
        code: errorData.code,
        details: errorData.details,
      };
    } catch {
      return {
        message: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }
  }

  private formatError(error: any): ApiError {
    if (error.status) {
      return {
        message: error.message || "API request failed",
        status: error.status,
        code: error.code,
        details: error.details,
      };
    }
    return {
      message: error.message || "Network error occurred",
      status: 0,
      code: "NETWORK_ERROR",
    };
  }

  // 🧩 Các method tiện lợi
  async get<T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    let url = endpoint;
    if (params) {
      const qs = new URLSearchParams();
      for (const [key, val] of Object.entries(params)) {
        qs.append(key, String(val));
      }
      url += `?${qs.toString()}`;
    }
    return this.request<T>(url, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
