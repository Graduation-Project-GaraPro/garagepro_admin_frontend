import { Appointment, CreateAppointmentData } from "@/hooks/customer/useAppointments";

// Mock data for development
const mockAppointments: Appointment[] = [
  {
    id: 1,
    vehicleId: 1,
    serviceType: "Oil Change",
    date: "2023-11-15",
    time: "10:00",
    status: "scheduled",
    notes: "Please check tire pressure as well",
    shopId: 1,
    shopName: "QuickFix Auto",
    estimatedDuration: 45,
  },
  {
    id: 2,
    vehicleId: 2,
    serviceType: "Brake Inspection",
    date: "2023-11-20",
    time: "14:30",
    status: "scheduled",
    shopId: 2,
    shopName: "Master Mechanics",
    estimatedDuration: 60,
  },
  {
    id: 3,
    vehicleId: 1,
    serviceType: "Tire Rotation",
    date: "2023-10-05",
    time: "09:15",
    status: "completed",
    shopId: 1,
    shopName: "QuickFix Auto",
    estimatedDuration: 30,
  },
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const appointmentService = {
  // Get all appointments for the current user
  getAppointments: async (): Promise<Appointment[]> => {
    // Simulate API call
    await delay(800);
    return [...mockAppointments];
  },

  // Get a specific appointment by ID
  getAppointmentById: async (id: number): Promise<Appointment | null> => {
    await delay(500);
    const appointment = mockAppointments.find(a => a.id === id);
    return appointment ? { ...appointment } : null;
  },

  // Create a new appointment
  createAppointment: async (data: CreateAppointmentData): Promise<Appointment> => {
    await delay(1000);
    const newId = Math.max(...mockAppointments.map(a => a.id)) + 1;
    const newAppointment: Appointment = {
      id: newId,
      ...data,
      status: "scheduled",
      shopName: data.shopId === 1 ? "QuickFix Auto" : "Master Mechanics",
      estimatedDuration: data.serviceType === "Oil Change" ? 45 : 60,
    };
    mockAppointments.push(newAppointment);
    return { ...newAppointment };
  },

  // Update an existing appointment
  updateAppointment: async (id: number, data: Partial<Appointment>): Promise<Appointment> => {
    await delay(1000);
    const index = mockAppointments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    mockAppointments[index] = { ...mockAppointments[index], ...data };
    return { ...mockAppointments[index] };
  },

  // Cancel an appointment
  cancelAppointment: async (id: number, reason?: string): Promise<void> => {
    await delay(800);
    const index = mockAppointments.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    mockAppointments[index].status = "cancelled";
    if (reason) {
      mockAppointments[index].notes = reason;
    }
  },

  // Get available time slots for a specific date, shop, and service type
  getAvailableTimeSlots: async (date: string, shopId: number, serviceType: string): Promise<string[]> => {
    await delay(700);
    // Mock available time slots
    const allTimeSlots = [
      "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
      "11:00", "11:30", "13:00", "13:30", "14:00", "14:30",
      "15:00", "15:30", "16:00", "16:30"
    ];
    
    // Filter out slots that are already booked
    const bookedSlots = mockAppointments
      .filter(a => a.date === date && a.shopId === shopId && a.status !== "cancelled")
      .map(a => a.time);
    
    return allTimeSlots.filter(slot => !bookedSlots.includes(slot));
  },
};