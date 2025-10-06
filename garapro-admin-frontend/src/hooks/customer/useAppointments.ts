"use client";

import { useState, useEffect } from "react";
import { appointmentService } from "@/services/customer/appointmentService";

export interface Appointment {
  id: number;
  vehicleId: number;
  serviceType: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  shopId: number;
  shopName: string;
  estimatedDuration: number; // in minutes
}

export interface CreateAppointmentData {
  vehicleId: number;
  serviceType: string;
  date: string;
  time: string;
  notes?: string;
  shopId: number;
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const data = await appointmentService.getAppointments();
        setAppointments(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const getAppointmentById = async (id: number) => {
    try {
      setLoading(true);
      const appointment = await appointmentService.getAppointmentById(id);
      return appointment;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (data: CreateAppointmentData) => {
    try {
      setLoading(true);
      const newAppointment = await appointmentService.createAppointment(data);
      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (id: number, data: Partial<Appointment>) => {
    try {
      setLoading(true);
      const updatedAppointment = await appointmentService.updateAppointment(id, data);
      setAppointments(prev =>
        prev.map(a => (a.id === id ? { ...a, ...updatedAppointment } : a))
      );
      return updatedAppointment;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id: number, reason?: string) => {
    try {
      setLoading(true);
      await appointmentService.cancelAppointment(id, reason);
      setAppointments(prev =>
        prev.map(a => (a.id === id ? { ...a, status: "cancelled" } : a))
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTimeSlots = async (date: string, shopId: number, serviceType: string) => {
    try {
      setLoading(true);
      const slots = await appointmentService.getAvailableTimeSlots(date, shopId, serviceType);
      return slots;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    appointments,
    loading,
    error,
    getAppointmentById,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    getAvailableTimeSlots,
  };
}