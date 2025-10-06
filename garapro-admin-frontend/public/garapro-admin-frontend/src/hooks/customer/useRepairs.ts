"use client";

import { useState, useEffect } from "react";
import { repairService } from "@/services/customer/repairService";

export interface Part {
  id: number;
  name: string;
  price: number;
  quantity: number;
  status: "pending" | "approved" | "rejected";
}

export interface TimelineItem {
  id: number;
  date: string;
  title: string;
  description: string;
  status: "completed" | "in_progress" | "upcoming";
}

export interface ChatMessage {
  id: number;
  sender: "customer" | "shop";
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Repair {
  id: number;
  vehicleId: number;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  shopId: number;
  shopName: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  parts?: Part[];
  timeline?: TimelineItem[];
  totalCost?: number;
  images?: string[];
}

export interface CreateRepairData {
  vehicleId: number;
  shopId: number;
  description: string;
  priority?: "low" | "medium" | "high";
  images?: File[];
}

export function useRepairs() {
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        setLoading(true);
        const data = await repairService.getRepairs();
        setRepairs(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchRepairs();
  }, []);

  const getRepairById = async (id: number) => {
    try {
      setLoading(true);
      const repair = await repairService.getRepairById(id);
      return repair;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createRepair = async (data: CreateRepairData) => {
    try {
      setLoading(true);
      const newRepair = await repairService.createRepair(data);
      setRepairs(prev => [...prev, newRepair]);
      return newRepair;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelRepair = async (id: number, reason?: string) => {
    try {
      setLoading(true);
      await repairService.cancelRepair(id, reason);
      setRepairs(prev =>
        prev.map(r => (r.id === id ? { ...r, status: "cancelled" } : r))
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveParts = async (repairId: number, partIds: number[]) => {
    try {
      setLoading(true);
      await repairService.approveParts(repairId, partIds);
      // Update local state if needed
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectParts = async (repairId: number, partIds: number[], reason?: string) => {
    try {
      setLoading(true);
      await repairService.rejectParts(repairId, partIds, reason);
      // Update local state if needed
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (repairId: number, message: string) => {
    try {
      setLoading(true);
      const newMessage = await repairService.sendMessage(repairId, message);
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMessages = async (repairId: number) => {
    try {
      setLoading(true);
      const messages = await repairService.getMessages(repairId);
      return messages;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (repairId: number, images: File[]) => {
    try {
      setLoading(true);
      const imageUrls = await repairService.uploadImages(repairId, images);
      return imageUrls;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    repairs,
    loading,
    error,
    getRepairById,
    createRepair,
    cancelRepair,
    approveParts,
    rejectParts,
    sendMessage,
    getMessages,
    uploadImages,
  };
}