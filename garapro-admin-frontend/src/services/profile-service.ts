"use client";

import { authService } from "@/services/authService";

// =======================
// BASE URL
// =======================
const RAW_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, ""); // remove trailing slash

// =======================
// GET TOKEN
// =======================
async function getAuthToken(): Promise<string | null> {
  return authService.getToken();
}

// =======================
// REQUEST CLIENT
// =======================
export async function request<T>(
  path: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  console.log("🚀 Making request to:", url);

  try {
    // Inject token
    const token = await getAuthToken();
    console.log("🚀 Token:", token);

    if (!token) {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
      throw new Error("Authentication required");
    }

    // Headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log("📡 Response:", response.status);

    // 401 → refresh token
    if (response.status === 401 && retryCount === 0) {
      console.log("🔄 Token expired → refreshing...");
      try {
        await authService.handleTokenRefresh();
        return request<T>(path, options, retryCount + 1);
      } catch {
        throw new Error("Session expired. Please login again.");
      }
    }

    // 403 → no permission
    if (response.status === 403) {
      throw new Error("Access denied.");
    }

    // Non-OK Response
    if (!response.ok) {
      const errorText = await response.text();
      let message = `HTTP error ${response.status}`;
      try {
        const json = JSON.parse(errorText);
        message = json.message || json.error || message;
      } catch {
        message = errorText || message;
      }
      throw new Error(message);
    }

    // No content
    if (response.status === 204) return {} as T;

    return (await response.json()) as T;
  } catch (error) {
    console.log("💥 Request failed:", error);
    if (
      error instanceof Error &&
      error.message.includes("Authentication required")
    ) {
      if (typeof window !== "undefined") window.location.href = "/";
    }
    throw error;
  }
}

// =======================
// DTO
// =======================
export interface UpdateUserDto {
  gender?: boolean | null;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  dateOfBirth?: string | null; // ISO or yyyy-MM-dd
}

export interface UserDto {
  id: string;
  email: string;
  gender?: boolean | null;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  dateOfBirth?: string | null;
}

// =======================
// USER SERVICE
// =======================
export const userService = {
  async getCurrentUser(): Promise<UserDto> {
    return request<UserDto>("/users/me", {
      method: "GET",
    });
  },

  async updateCurrentUser(payload: UpdateUserDto): Promise<UserDto> {
    return request<UserDto>("/users/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
};
