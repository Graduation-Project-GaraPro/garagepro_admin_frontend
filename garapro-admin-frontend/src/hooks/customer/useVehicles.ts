"use client";

import { useState, useEffect } from "react";
import { vehicleService } from "@/services/customer/vehicleService";

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  vin: string;
  lastService?: string;
  nextService?: string;
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const data = await vehicleService.getVehicles();
        setVehicles(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const addVehicle = async (vehicle: Omit<Vehicle, "id">) => {
    try {
      setLoading(true);
      const newVehicle = await vehicleService.addVehicle(vehicle);
      setVehicles(prev => [...prev, newVehicle]);
      return newVehicle;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateVehicle = async (id: number, vehicle: Partial<Vehicle>) => {
    try {
      setLoading(true);
      const updatedVehicle = await vehicleService.updateVehicle(id, vehicle);
      setVehicles(prev =>
        prev.map(v => (v.id === id ? { ...v, ...updatedVehicle } : v))
      );
      return updatedVehicle;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (id: number) => {
    try {
      setLoading(true);
      await vehicleService.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getVehicleById = (id: number) => {
    return vehicles.find(v => v.id === id) || null;
  };

  return {
    vehicles,
    loading,
    error,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicleById,
  };
}