// src/services/public-auth-service.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

async function handleJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();

  if (!res.ok) {
    try {
      const json = JSON.parse(text);
      const message = json.message || json.error || text || "Request failed";
      throw new Error(message);
    } catch {
      throw new Error(text || "Request failed");
    }
  }

  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

export const publicAuthService = {
  async requestOtp(phoneNumber: string): Promise<{ message: string }> {
    const res = await fetch(
      `${API_BASE_URL}/auth/forgot-password/send-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      }
    );

    return handleJsonResponse<{ message: string }>(res);
  },

  async verifyOtp(
    phoneNumber: string,
    token: string
  ): Promise<{ message: string; resetToken: string }> {
    const res = await fetch(
      `${API_BASE_URL}/auth/forgot-password/verify-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, token }),
      }
    );

    return handleJsonResponse<{ message: string; resetToken: string }>(res);
  },

  async resetPassword(
    phoneNumber: string,
    resetToken: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, resetToken, newPassword }),
    });

    return handleJsonResponse<{ message: string }>(res);
  },
};
