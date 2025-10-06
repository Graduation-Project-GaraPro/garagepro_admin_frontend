import { Vehicle } from "@/hooks/customer/useVehicles";

// Mock data for development
const mockVehicles: Vehicle[] = [
  {
    id: 1,
    make: "Toyota",
    model: "Camry",
    year: 2019,
    licensePlate: "ABC-1234",
    color: "Silver",
    vin: "1HGCM82633A123456",
    lastService: "2023-05-15",
    nextService: "2023-11-15",
  },
  {
    id: 2,
    make: "Honda",
    model: "Civic",
    year: 2020,
    licensePlate: "XYZ-5678",
    color: "Blue",
    vin: "2HGFC2F52LH123456",
    lastService: "2023-07-10",
    nextService: "2024-01-10",
  },
  {
    id: 3,
    make: "Ford",
    model: "Mustang",
    year: 2018,
    licensePlate: "DEF-9012",
    color: "Red",
    vin: "1FA6P8CF5K5123456",
    lastService: "2023-06-22",
    nextService: "2023-12-22",
  },
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const vehicleService = {
  // Get all vehicles for the current user
  getVehicles: async (): Promise<Vehicle[]> => {
    // Simulate API call
    await delay(800);
    return [...mockVehicles];
  },

  // Get a specific vehicle by ID
  getVehicleById: async (id: number): Promise<Vehicle | null> => {
    await delay(500);
    const vehicle = mockVehicles.find(v => v.id === id);
    return vehicle ? { ...vehicle } : null;
  },

  // Add a new vehicle
  addVehicle: async (vehicle: Omit<Vehicle, "id">): Promise<Vehicle> => {
    await delay(1000);
    const newId = Math.max(...mockVehicles.map(v => v.id)) + 1;
    const newVehicle = { ...vehicle, id: newId };
    mockVehicles.push(newVehicle);
    return { ...newVehicle };
  },

  // Update an existing vehicle
  updateVehicle: async (id: number, vehicle: Partial<Vehicle>): Promise<Vehicle> => {
    await delay(1000);
    const index = mockVehicles.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error(`Vehicle with ID ${id} not found`);
    }
    mockVehicles[index] = { ...mockVehicles[index], ...vehicle };
    return { ...mockVehicles[index] };
  },

  // Delete a vehicle
  deleteVehicle: async (id: number): Promise<void> => {
    await delay(800);
    const index = mockVehicles.findIndex(v => v.id === id);
    if (index === -1) {
      throw new Error(`Vehicle with ID ${id} not found`);
    }
    mockVehicles.splice(index, 1);
  },

  // Get service history for a vehicle
  getServiceHistory: async (vehicleId: number): Promise<any[]> => {
    await delay(1000);
    // Mock service history data
    return [
      {
        id: 1,
        vehicleId,
        date: "2023-05-15",
        type: "Oil Change",
        description: "Regular maintenance",
        cost: 49.99,
        shopName: "QuickFix Auto",
      },
      {
        id: 2,
        vehicleId,
        date: "2023-02-10",
        type: "Brake Replacement",
        description: "Front brake pads replacement",
        cost: 220.50,
        shopName: "QuickFix Auto",
      },
      {
        id: 3,
        vehicleId,
        date: "2022-11-05",
        type: "Tire Rotation",
        description: "Regular maintenance",
        cost: 35.00,
        shopName: "Tire World",
      },
    ];
  },
};