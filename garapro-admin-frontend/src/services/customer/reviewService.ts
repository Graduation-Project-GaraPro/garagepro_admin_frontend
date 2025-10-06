import { Review, CreateReviewData } from "@/hooks/customer/useReviews";

// Mock data for development
const mockReviews: Review[] = [
  {
    id: 1,
    shopId: 1,
    shopName: "QuickFix Auto",
    customerId: 101,
    rating: 4,
    title: "Great service, quick turnaround",
    content: "I brought my car in for an oil change and they were very efficient. The staff was friendly and professional. Would recommend!",
    date: "2023-09-15",
    serviceType: "Oil Change",
    vehicleInfo: {
      make: "Toyota",
      model: "Camry",
      year: 2019,
    },
    shopResponse: {
      content: "Thank you for your kind review! We're glad you had a positive experience and look forward to serving you again.",
      date: "2023-09-16",
    },
  },
  {
    id: 2,
    shopId: 2,
    shopName: "Master Mechanics",
    customerId: 101,
    rating: 5,
    title: "Excellent brake repair",
    content: "They did an amazing job fixing my brakes. The car feels like new again. The price was fair and they completed the work ahead of schedule.",
    date: "2023-08-22",
    serviceType: "Brake Repair",
    vehicleInfo: {
      make: "Honda",
      model: "Civic",
      year: 2020,
    },
    images: ["/images/reviews/brakes_before.jpg", "/images/reviews/brakes_after.jpg"],
  },
  {
    id: 3,
    shopId: 1,
    shopName: "QuickFix Auto",
    customerId: 102,
    rating: 3,
    title: "Decent tire rotation",
    content: "The service was okay, but I had to wait longer than expected. The work itself was done properly though.",
    date: "2023-10-05",
    serviceType: "Tire Rotation",
  },
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const reviewService = {
  // Get all reviews for the current user
  getReviews: async (): Promise<Review[]> => {
    // Simulate API call
    await delay(800);
    return [...mockReviews.filter(r => r.customerId === 101)];
  },

  // Get a specific review by ID
  getReviewById: async (id: number): Promise<Review | null> => {
    await delay(500);
    const review = mockReviews.find(r => r.id === id);
    return review ? { ...review } : null;
  },

  // Get reviews for a specific shop
  getReviewsByShop: async (shopId: number): Promise<Review[]> => {
    await delay(700);
    return [...mockReviews.filter(r => r.shopId === shopId)];
  },

  // Create a new review
  createReview: async (data: CreateReviewData): Promise<Review> => {
    await delay(1000);
    const newId = Math.max(...mockReviews.map(r => r.id)) + 1;
    
    // Mock vehicle info if vehicleId is provided
    let vehicleInfo = undefined;
    if (data.vehicleId) {
      if (data.vehicleId === 1) {
        vehicleInfo = {
          make: "Toyota",
          model: "Camry",
          year: 2019,
        };
      } else if (data.vehicleId === 2) {
        vehicleInfo = {
          make: "Honda",
          model: "Civic",
          year: 2020,
        };
      }
    }
    
    // Mock shop name based on shopId
    const shopName = data.shopId === 1 ? "QuickFix Auto" : "Master Mechanics";
    
    const newReview: Review = {
      id: newId,
      shopId: data.shopId,
      shopName,
      customerId: 101, // Mock current user ID
      rating: data.rating,
      title: data.title,
      content: data.content,
      date: new Date().toISOString().split('T')[0],
      serviceType: data.serviceType,
      vehicleInfo,
      images: data.images ? ["/images/reviews/upload1.jpg"] : undefined,
    };
    
    mockReviews.push(newReview);
    return { ...newReview };
  },

  // Update an existing review
  updateReview: async (id: number, data: Partial<CreateReviewData>): Promise<Review> => {
    await delay(1000);
    const index = mockReviews.findIndex(r => r.id === id && r.customerId === 101);
    if (index === -1) {
      throw new Error(`Review with ID ${id} not found or not owned by current user`);
    }
    
    // Update only the fields that are provided
    if (data.rating !== undefined) mockReviews[index].rating = data.rating;
    if (data.title !== undefined) mockReviews[index].title = data.title;
    if (data.content !== undefined) mockReviews[index].content = data.content;
    if (data.serviceType !== undefined) mockReviews[index].serviceType = data.serviceType;
    
    // Handle image uploads separately
    
    return { ...mockReviews[index] };
  },

  // Delete a review
  deleteReview: async (id: number): Promise<void> => {
    await delay(800);
    const index = mockReviews.findIndex(r => r.id === id && r.customerId === 101);
    if (index === -1) {
      throw new Error(`Review with ID ${id} not found or not owned by current user`);
    }
    
    mockReviews.splice(index, 1);
  },

  // Upload images for a review
  uploadImages: async (reviewId: number, images: File[]): Promise<string[]> => {
    await delay(1500);
    // In a real implementation, this would upload the files to a server
    // and return the URLs. For mock purposes, we'll just return placeholder URLs.
    const imageUrls = images.map((_, index) => `/images/reviews/upload_${reviewId}_${index}.jpg`);
    
    const reviewIndex = mockReviews.findIndex(r => r.id === reviewId);
    if (reviewIndex !== -1) {
      if (!mockReviews[reviewIndex].images) {
        mockReviews[reviewIndex].images = [];
      }
      mockReviews[reviewIndex].images = [...mockReviews[reviewIndex].images!, ...imageUrls];
    }
    
    return imageUrls;
  },
};