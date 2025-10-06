import { Notification } from "@/hooks/customer/useNotifications";

// Mock data for development
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "repair",
    title: "Repair Status Update",
    message: "Your vehicle repair status has been updated to 'In Progress'",
    timestamp: "2023-10-26T14:15:00Z",
    read: false,
    actionUrl: "/customer/repairs/1",
    relatedId: 1,
    priority: "medium",
  },
  {
    id: 2,
    type: "appointment",
    title: "Appointment Reminder",
    message: "Your appointment is scheduled for tomorrow at 10:00 AM",
    timestamp: "2023-11-14T09:00:00Z",
    read: true,
    actionUrl: "/customer/appointments/1",
    relatedId: 1,
    priority: "high",
  },
  {
    id: 3,
    type: "promotion",
    title: "Special Discount",
    message: "Get 15% off on your next oil change service!",
    timestamp: "2023-11-10T12:30:00Z",
    read: false,
    priority: "low",
  },
  {
    id: 4,
    type: "system",
    title: "Account Security",
    message: "Your account password was recently changed. If this wasn't you, please contact support.",
    timestamp: "2023-11-05T18:45:00Z",
    read: true,
    priority: "high",
  },
  {
    id: 5,
    type: "repair",
    title: "Part Approval Required",
    message: "Your repair requires approval for parts. Please review and approve.",
    timestamp: "2023-10-27T10:20:00Z",
    read: false,
    actionUrl: "/customer/repairs/1",
    relatedId: 1,
    priority: "high",
  },
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const notificationService = {
  // Get all notifications for the current user
  getNotifications: async (): Promise<Notification[]> => {
    // Simulate API call
    await delay(600);
    return [...mockNotifications].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  // Mark a notification as read
  markAsRead: async (id: number): Promise<void> => {
    await delay(300);
    const index = mockNotifications.findIndex(n => n.id === id);
    if (index === -1) {
      throw new Error(`Notification with ID ${id} not found`);
    }
    mockNotifications[index].read = true;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<void> => {
    await delay(500);
    mockNotifications.forEach(notification => {
      notification.read = true;
    });
  },

  // Delete a notification
  deleteNotification: async (id: number): Promise<void> => {
    await delay(400);
    const index = mockNotifications.findIndex(n => n.id === id);
    if (index === -1) {
      throw new Error(`Notification with ID ${id} not found`);
    }
    mockNotifications.splice(index, 1);
  },

  // Clear all notifications
  clearAllNotifications: async (): Promise<void> => {
    await delay(600);
    mockNotifications.length = 0;
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<number> => {
    await delay(200);
    return mockNotifications.filter(n => !n.read).length;
  },

  // Setup WebSocket connection for real-time notifications
  // This is a mock implementation
  setupNotificationSocket: () => {
    // In a real implementation, this would connect to a WebSocket server
    // and return a socket object with event handlers
    return {
      on: (event: string, callback: Function) => {
        // Mock event listener
        console.log(`Registered listener for ${event} event`);
      },
      disconnect: () => {
        // Mock disconnect method
        console.log('Disconnected from notification socket');
      },
    };
  },
};