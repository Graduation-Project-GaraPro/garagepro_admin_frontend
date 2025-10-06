"use client";

import { useState, useEffect } from "react";
import { userProfileService } from "@/services/customer/userProfileService";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  joinDate: string;
  totalServices: number;
  totalSpent: number;
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    marketing: boolean;
    twoFactor: boolean;
    loginAlerts: boolean;
    sessionTimeout: number;
  };
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  preferences?: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    marketing?: boolean;
    twoFactor?: boolean;
    loginAlerts?: boolean;
    sessionTimeout?: number;
  };
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  // Fetch current user data
  const fetchCurrentUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await userProfileService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      setError("Không thể tải thông tin người dùng. Vui lòng thử lại sau.");
      console.error("Error fetching user data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (data: UpdateUserData) => {
    if (!user) return;
    
    setIsUpdating(true);
    setError(null);
    try {
      const updatedUser = await userProfileService.updateUserProfile(user.id, data);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError("Không thể cập nhật thông tin. Vui lòng thử lại sau.");
      console.error("Error updating user profile:", err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Change password
  const changePassword = async (data: PasswordChangeData) => {
    if (!user) return;
    
    setIsChangingPassword(true);
    setError(null);
    try {
      await userProfileService.changePassword(user.id, data);
    } catch (err) {
      setError("Không thể thay đổi mật khẩu. Vui lòng thử lại sau.");
      console.error("Error changing password:", err);
      throw err;
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences: User['preferences']) => {
    if (!user) return;
    
    return updateUserProfile({ preferences });
  };

  // Update avatar
  const updateAvatar = async (file: File) => {
    if (!user) return;
    
    setIsUpdating(true);
    setError(null);
    try {
      const avatarUrl = await userProfileService.uploadAvatar(user.id, file);
      const updatedUser = { ...user, avatar: avatarUrl };
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError("Không thể cập nhật ảnh đại diện. Vui lòng thử lại sau.");
      console.error("Error updating avatar:", err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Load user data on mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  return {
    user,
    loading,
    error,
    isUpdating,
    isChangingPassword,
    fetchCurrentUser,
    updateUserProfile,
    changePassword,
    updatePreferences,
    updateAvatar
  };
};