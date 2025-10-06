"use client";

import { useState, useEffect } from "react";
import { reviewService } from "@/services/customer/reviewService";

export interface Review {
  id: number;
  shopId: number;
  shopName: string;
  customerId: number;
  rating: number; // 1-5
  title: string;
  content: string;
  date: string;
  serviceType: string;
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
  };
  images?: string[];
  shopResponse?: {
    content: string;
    date: string;
  };
}

export interface CreateReviewData {
  shopId: number;
  rating: number;
  title: string;
  content: string;
  serviceType: string;
  vehicleId?: number;
  images?: File[];
}

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await reviewService.getReviews();
        setReviews(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const getReviewById = async (id: number) => {
    try {
      setLoading(true);
      const review = await reviewService.getReviewById(id);
      return review;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getReviewsByShop = async (shopId: number) => {
    try {
      setLoading(true);
      const shopReviews = await reviewService.getReviewsByShop(shopId);
      return shopReviews;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (data: CreateReviewData) => {
    try {
      setLoading(true);
      const newReview = await reviewService.createReview(data);
      setReviews(prev => [...prev, newReview]);
      return newReview;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (id: number, data: Partial<CreateReviewData>) => {
    try {
      setLoading(true);
      const updatedReview = await reviewService.updateReview(id, data);
      setReviews(prev =>
        prev.map(r => (r.id === id ? { ...r, ...updatedReview } : r))
      );
      return updatedReview;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id: number) => {
    try {
      setLoading(true);
      await reviewService.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (reviewId: number, images: File[]) => {
    try {
      setLoading(true);
      const imageUrls = await reviewService.uploadImages(reviewId, images);
      return imageUrls;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    reviews,
    loading,
    error,
    getReviewById,
    getReviewsByShop,
    createReview,
    updateReview,
    deleteReview,
    uploadImages,
  };
}