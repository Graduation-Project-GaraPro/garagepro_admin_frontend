import { Repair, CreateRepairData, Part, TimelineItem, ChatMessage } from "@/hooks/customer/useRepairs";

// Mock data for development
const mockRepairs: Repair[] = [
  {
    id: 1,
    vehicleId: 1,
    vehicleInfo: {
      make: "Toyota",
      model: "Camry",
      year: 2019,
      licensePlate: "ABC-1234",
    },
    shopId: 1,
    shopName: "QuickFix Auto",
    description: "Engine making unusual noise when accelerating",
    status: "in_progress",
    priority: "high",
    createdAt: "2023-10-25T10:30:00Z",
    updatedAt: "2023-10-26T14:15:00Z",
    estimatedCompletionDate: "2023-11-02",
    parts: [
      { id: 1, name: "Air Filter", price: 25.99, quantity: 1, status: "approved" },
      { id: 2, name: "Spark Plugs", price: 45.50, quantity: 4, status: "pending" },
    ],
    timeline: [
      {
        id: 1,
        date: "2023-10-25T10:30:00Z",
        title: "Repair Request Created",
        description: "Customer submitted repair request",
        status: "completed",
      },
      {
        id: 2,
        date: "2023-10-26T09:15:00Z",
        title: "Vehicle Inspection",
        description: "Initial inspection completed",
        status: "completed",
      },
      {
        id: 3,
        date: "2023-10-26T14:15:00Z",
        title: "Parts Ordered",
        description: "Necessary parts have been ordered",
        status: "in_progress",
      },
      {
        id: 4,
        date: "2023-10-30T00:00:00Z",
        title: "Repair Work",
        description: "Scheduled repair work",
        status: "upcoming",
      },
    ],
    totalCost: 198.96,
    images: ["/images/repairs/engine1.jpg", "/images/repairs/engine2.jpg"],
  },
  {
    id: 2,
    vehicleId: 2,
    vehicleInfo: {
      make: "Honda",
      model: "Civic",
      year: 2020,
      licensePlate: "XYZ-5678",
    },
    shopId: 2,
    shopName: "Master Mechanics",
    description: "Brake pads need replacement",
    status: "pending",
    priority: "medium",
    createdAt: "2023-10-28T15:45:00Z",
    updatedAt: "2023-10-28T15:45:00Z",
    images: ["/images/repairs/brakes1.jpg"],
  },
  {
    id: 3,
    vehicleId: 1,
    vehicleInfo: {
      make: "Toyota",
      model: "Camry",
      year: 2019,
      licensePlate: "ABC-1234",
    },
    shopId: 1,
    shopName: "QuickFix Auto",
    description: "Regular maintenance - oil change and tire rotation",
    status: "completed",
    priority: "low",
    createdAt: "2023-09-15T11:00:00Z",
    updatedAt: "2023-09-15T13:30:00Z",
    actualCompletionDate: "2023-09-15",
    totalCost: 89.99,
  },
];

// Mock chat messages
const mockChatMessages: Record<number, ChatMessage[]> = {
  1: [
    {
      id: 1,
      sender: "shop",
      message: "We've completed the initial inspection of your vehicle. We found issues with the air filter and spark plugs that need to be addressed.",
      timestamp: "2023-10-26T09:30:00Z",
      read: true,
    },
    {
      id: 2,
      sender: "customer",
      message: "Thanks for the update. How much will the repairs cost?",
      timestamp: "2023-10-26T10:15:00Z",
      read: true,
    },
    {
      id: 3,
      sender: "shop",
      message: "The total estimated cost is $198.96. This includes parts and labor. Please approve the parts in your repair details page.",
      timestamp: "2023-10-26T11:00:00Z",
      read: true,
    },
  ],
  2: [
    {
      id: 1,
      sender: "shop",
      message: "We've received your repair request for brake pad replacement. When would you like to bring in your vehicle?",
      timestamp: "2023-10-28T16:30:00Z",
      read: true,
    },
  ],
};

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const repairService = {
  // Get all repairs for the current user
  getRepairs: async (): Promise<Repair[]> => {
    // Simulate API call
    await delay(800);
    return [...mockRepairs];
  },

  // Get a specific repair by ID
  getRepairById: async (id: number): Promise<Repair | null> => {
    await delay(500);
    const repair = mockRepairs.find(r => r.id === id);
    return repair ? { ...repair } : null;
  },

  // Create a new repair request
  createRepair: async (data: CreateRepairData): Promise<Repair> => {
    await delay(1200);
    const newId = Math.max(...mockRepairs.map(r => r.id)) + 1;
    
    // Mock vehicle info based on vehicleId
    let vehicleInfo = {
      make: "Unknown",
      model: "Unknown",
      year: 2020,
      licensePlate: "Unknown",
    };
    
    if (data.vehicleId === 1) {
      vehicleInfo = {
        make: "Toyota",
        model: "Camry",
        year: 2019,
        licensePlate: "ABC-1234",
      };
    } else if (data.vehicleId === 2) {
      vehicleInfo = {
        make: "Honda",
        model: "Civic",
        year: 2020,
        licensePlate: "XYZ-5678",
      };
    }
    
    // Mock shop name based on shopId
    const shopName = data.shopId === 1 ? "QuickFix Auto" : "Master Mechanics";
    
    const now = new Date().toISOString();
    
    const newRepair: Repair = {
      id: newId,
      vehicleId: data.vehicleId,
      vehicleInfo,
      shopId: data.shopId,
      shopName,
      description: data.description,
      status: "pending",
      priority: data.priority || "medium",
      createdAt: now,
      updatedAt: now,
      images: data.images ? ["/images/repairs/placeholder.jpg"] : [],
      timeline: [
        {
          id: 1,
          date: now,
          title: "Repair Request Created",
          description: "Customer submitted repair request",
          status: "completed",
        },
      ],
    };
    
    mockRepairs.push(newRepair);
    return { ...newRepair };
  },

  // Cancel a repair request
  cancelRepair: async (id: number, reason?: string): Promise<void> => {
    await delay(800);
    const index = mockRepairs.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Repair with ID ${id} not found`);
    }
    
    mockRepairs[index].status = "cancelled";
    mockRepairs[index].updatedAt = new Date().toISOString();
    
    // Add cancellation to timeline
    if (!mockRepairs[index].timeline) {
      mockRepairs[index].timeline = [];
    }
    
    const newTimelineId = mockRepairs[index].timeline.length > 0 
      ? Math.max(...mockRepairs[index].timeline.map(t => t.id)) + 1 
      : 1;
    
    mockRepairs[index].timeline.push({
      id: newTimelineId,
      date: new Date().toISOString(),
      title: "Repair Cancelled",
      description: reason || "Customer cancelled the repair request",
      status: "completed",
    });
  },

  // Approve parts for a repair
  approveParts: async (repairId: number, partIds: number[]): Promise<void> => {
    await delay(800);
    const repairIndex = mockRepairs.findIndex(r => r.id === repairId);
    if (repairIndex === -1) {
      throw new Error(`Repair with ID ${repairId} not found`);
    }
    
    if (!mockRepairs[repairIndex].parts) {
      throw new Error(`No parts found for repair with ID ${repairId}`);
    }
    
    mockRepairs[repairIndex].parts = mockRepairs[repairIndex].parts!.map(part => {
      if (partIds.includes(part.id)) {
        return { ...part, status: "approved" };
      }
      return part;
    });
    
    mockRepairs[repairIndex].updatedAt = new Date().toISOString();
  },

  // Reject parts for a repair
  rejectParts: async (repairId: number, partIds: number[], reason?: string): Promise<void> => {
    await delay(800);
    const repairIndex = mockRepairs.findIndex(r => r.id === repairId);
    if (repairIndex === -1) {
      throw new Error(`Repair with ID ${repairId} not found`);
    }
    
    if (!mockRepairs[repairIndex].parts) {
      throw new Error(`No parts found for repair with ID ${repairId}`);
    }
    
    mockRepairs[repairIndex].parts = mockRepairs[repairIndex].parts!.map(part => {
      if (partIds.includes(part.id)) {
        return { ...part, status: "rejected" };
      }
      return part;
    });
    
    mockRepairs[repairIndex].updatedAt = new Date().toISOString();
  },

  // Send a message in the repair chat
  sendMessage: async (repairId: number, message: string): Promise<ChatMessage> => {
    await delay(500);
    if (!mockChatMessages[repairId]) {
      mockChatMessages[repairId] = [];
    }
    
    const newId = mockChatMessages[repairId].length > 0 
      ? Math.max(...mockChatMessages[repairId].map(m => m.id)) + 1 
      : 1;
    
    const newMessage: ChatMessage = {
      id: newId,
      sender: "customer",
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };
    
    mockChatMessages[repairId].push(newMessage);
    return { ...newMessage };
  },

  // Get all messages for a repair
  getMessages: async (repairId: number): Promise<ChatMessage[]> => {
    await delay(500);
    return mockChatMessages[repairId] ? [...mockChatMessages[repairId]] : [];
  },

  // Upload images for a repair
  uploadImages: async (repairId: number, images: File[]): Promise<string[]> => {
    await delay(1500);
    // In a real implementation, this would upload the files to a server
    // and return the URLs. For mock purposes, we'll just return placeholder URLs.
    const imageUrls = images.map((_, index) => `/images/repairs/upload_${repairId}_${index}.jpg`);
    
    const repairIndex = mockRepairs.findIndex(r => r.id === repairId);
    if (repairIndex !== -1) {
      if (!mockRepairs[repairIndex].images) {
        mockRepairs[repairIndex].images = [];
      }
      mockRepairs[repairIndex].images = [...mockRepairs[repairIndex].images!, ...imageUrls];
    }
    
    return imageUrls;
  },
};