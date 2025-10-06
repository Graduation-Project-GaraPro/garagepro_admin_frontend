import { User, UpdateUserData, PasswordChangeData } from "@/hooks/customer/useCurrentUser";

// Mock data for development
const mockUser: User = {
  id: 1,
  name: "Nguyễn Văn A",
  email: "nguyenvana@example.com",
  phone: "0901234567",
  address: "123 Đường ABC, Quận 1, TP.HCM",
  avatar: "/avatars/default.png",
  joinDate: "2023-01-15T00:00:00Z",
  totalServices: 5,
  totalSpent: 2500000,
  preferences: {
    notifications: {
      email: true,
      sms: true,
      push: false,
    },
    marketing: true,
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: 30,
  },
};

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const userProfileService = {
  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    // Simulate API call
    await delay(600);
    return { ...mockUser };
  },

  // Update user profile
  updateUserProfile: async (userId: number, data: UpdateUserData): Promise<User> => {
    // Simulate API call
    await delay(800);
    
    // In a real implementation, this would send data to an API
    // For now, we'll just update our mock data
    Object.assign(mockUser, data);
    
    // If preferences are being updated, merge them properly
    if (data.preferences) {
      mockUser.preferences = {
        ...mockUser.preferences,
        ...data.preferences,
        // Handle nested notifications object if it exists
        notifications: data.preferences.notifications
          ? { ...mockUser.preferences.notifications, ...data.preferences.notifications }
          : mockUser.preferences.notifications
      };
    }
    
    return { ...mockUser };
  },

  // Change password
  changePassword: async (userId: number, data: PasswordChangeData): Promise<void> => {
    // Validate passwords
    if (data.newPassword !== data.confirmPassword) {
      throw new Error("Mật khẩu mới và xác nhận mật khẩu không khớp");
    }
    
    // Mock validation for current password (in real app, would verify against stored password)
    if (data.currentPassword !== "password123") {
      throw new Error("Mật khẩu hiện tại không đúng");
    }
    
    // Simulate API call
    await delay(700);
    
    // In a real implementation, this would send the password change request to an API
    console.log("Password changed successfully");
  },

  // Upload avatar
  uploadAvatar: async (userId: number, file: File): Promise<string> => {
    // Simulate API call for file upload
    await delay(1200);
    
    // In a real implementation, this would upload the file to a server
    // and return the URL of the uploaded image
    
    // For mock purposes, generate a fake URL
    const timestamp = new Date().getTime();
    const mockAvatarUrl = `/avatars/user-${userId}-${timestamp}.jpg`;
    
    // Update mock user
    mockUser.avatar = mockAvatarUrl;
    
    return mockAvatarUrl;
  },
};