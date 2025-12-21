import {authService} from "@/services/authService";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export enum StockFilter {
  All = 0,
  InStock = 1,
  OutOfStock = 2,
}

class PartManagementService {
  private getAuthToken(): string | null {
    return authService.getToken(); // CHỈ DÙNG GETTOKEN
  }

  private async authenticatedFetch(
    url: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<Response> {
    const MAX_RETRIES = 2;

    try {
      const token = this.getAuthToken();

      if (!token) {
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        throw new Error("Authentication required");
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 && retryCount === 0) {
        await authService.handleTokenRefresh();
        return this.authenticatedFetch(url, options, retryCount + 1);
      }

      if (response.status === 403) {
        if (typeof window !== "undefined") {
          window.location.href = "/access-denied";
        }
        throw new Error("Access denied");
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  // ===== BRAND =====
  async getBrands(search?: string) {
    const res = await this.authenticatedFetch(
      `${API_BASE}/AdminPartCategories/brands?search=${search ?? ""}`
    );
    return res.json();
  }

  // ===== MODEL =====
  async getModels(brandId: string, search?: string) {
    const res = await this.authenticatedFetch(
      `${API_BASE}/AdminPartCategories/models?brandId=${brandId}&search=${search ?? ""}`
    );
    return res.json();
  }

  // ===== BRANCH =====
  async getBranches(search?: string) {
    const res = await this.authenticatedFetch(
      `${API_BASE}/AdminPartCategories/branches?search=${search ?? ""}`
    );
    return res.json();
  }

  // ===== PART CATEGORY LIST =====
  async getPartCategories(
    modelId: string,
    branchId: string,
    search?: string
  ) {
    const res = await this.authenticatedFetch(
      `${API_BASE}/AdminPartCategories/part-categories?modelId=${modelId}&branchId=${branchId}&search=${search ?? ""}`
    );
    return res.json();
  }

  // ===== PART CATEGORY DETAIL =====
  async getPartCategoryDetail(
  categoryId: string,
  branchId: string,
  stockFilter: StockFilter,
  modelId?: string
) {
  const params = new URLSearchParams({
    branchId,
    stockFilter: stockFilter.toString(),
  });

  if (modelId) {
    params.append("modelId", modelId);
  }

  const res = await this.authenticatedFetch(
    `${API_BASE}/AdminPartCategories/part-categories/${categoryId}?${params.toString()}`
  );

  return res.json();
}

}

export const partManagementService = new PartManagementService();
