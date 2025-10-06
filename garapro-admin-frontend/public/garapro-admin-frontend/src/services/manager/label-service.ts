import type { Label, NewLabel } from "@/types/manager/label"

// TODO: Replace with actual API calls when backend is ready
class LabelService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"

  // Get all labels
  async getAllLabels(): Promise<Label[]> {
    // For now, return mock data since API is not available
    return this.getMockLabels()
  }

  // Create a new label
  async createLabel(labelData: NewLabel): Promise<Label> {
    // For now, simulate creating a label with mock data
    const newLabel: Label = {
      id: Date.now(),
      ...labelData,
      isDefault: false,
    }
    return newLabel
  }

  // Update an existing label
  async updateLabel(id: number, labelData: Partial<Label>): Promise<Label> {
    // For now, return the updated label data
    return {
      id,
      name: labelData.name || "",
      category: labelData.category || "",
      color: labelData.color || "#3b82f6",
      description: labelData.description || "",
      isDefault: labelData.isDefault || false,
    }
  }

  // Delete a label
  async deleteLabel(id: number): Promise<void> {
    // For now, just return successfully
    // Mock implementation - will be replaced with actual API call
    console.log(`Mock: Deleting label with id ${id}`)
    return Promise.resolve()
  }

  // Set a label as default
  async setDefaultLabel(id: number): Promise<void> {
    // For now, just return successfully
    // Mock implementation - will be replaced with actual API call
    console.log(`Mock: Setting label ${id} as default`)
    return Promise.resolve()
  }

  // Mock data fallback for development
  private getMockLabels(): Label[] {
    return [
      {
        id: 1,
        name: "Priority Service",
        category: "Status",
        color: "#ef4444",
        description: "High priority repair orders",
        isDefault: true,
      },
      {
        id: 2,
        name: "Warranty Work",
        category: "Type",
        color: "#3b82f6",
        description: "Warranty covered repairs",
        isDefault: false,
      },
      {
        id: 3,
        name: "Customer Waiting",
        category: "Status",
        color: "#f59e0b",
        description: "Customer is waiting for completion",
        isDefault: false,
      },
      {
        id: 4,
        name: "Parts Ordered",
        category: "Status",
        color: "#8b5cf6",
        description: "Waiting for parts delivery",
        isDefault: false,
      },
      {
        id: 5,
        name: "Quality Check",
        category: "Process",
        color: "#10b981",
        description: "Ready for final inspection",
        isDefault: false,
      },
    ]
  }
}

export const labelService = new LabelService()
