"use client";

import { useState, useEffect } from "react";

interface Part {
  name: string;
  quantity: number;
  price: number;
  status: "ordered" | "installed" | "pending";
}

interface TimelineItem {
  date: string;
  action: string;
  status: "completed" | "in-progress" | "pending";
}

interface Request {
  id: number | string;
  vehicle: string;
  licensePlate: string;
  issue: string;
  description: string;
  priority: "high" | "medium" | "low";
  status: "completed" | "in-progress" | "pending" | "cancelled";
  date: string;
  time: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  technician: string;
  estimatedCost: number;
  actualCost: number;
  estimatedTime: string;
  progress: number;
  images: string[];
  parts: Part[];
  timeline: TimelineItem[];
}

interface UseRepairDetailsResult {
  data: Request | null;
  loading: boolean;
  error: Error | null;
}

export function useRepairDetails(id: string): UseRepairDetailsResult {
  const [data, setData] = useState<Request | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Trong thực tế, đây sẽ là một API call
        // const response = await fetch(`/api/repairs/${id}`);
        // const data = await response.json();

        // Giả lập dữ liệu
        const mockData: Request = {
          id,
          vehicle: "Toyota Camry 2020",
          licensePlate: "51F-123.45",
          issue: "Thay dầu và bảo dưỡng định kỳ",
          description: "Xe cần thay dầu và kiểm tra tổng thể theo lịch bảo dưỡng 10.000km",
          priority: "medium",
          status: "in-progress",
          date: "15/05/2023",
          time: "09:30",
          customerName: "Nguyễn Văn A",
          phone: "0901234567",
          email: "nguyenvana@example.com",
          address: "123 Đường ABC, Quận 1, TP.HCM",
          technician: "Trần Văn B",
          estimatedCost: 1500000,
          actualCost: 0,
          estimatedTime: "2 giờ",
          progress: 60,
          images: [
            "https://example.com/image1.jpg",
            "https://example.com/image2.jpg",
          ],
          parts: [
            {
              name: "Dầu động cơ",
              quantity: 1,
              price: 500000,
              status: "installed",
            },
            {
              name: "Lọc dầu",
              quantity: 1,
              price: 200000,
              status: "installed",
            },
            {
              name: "Lọc gió",
              quantity: 1,
              price: 300000,
              status: "pending",
            },
          ],
          timeline: [
            {
              date: "15/05/2023 09:30",
              action: "Tiếp nhận xe",
              status: "completed",
            },
            {
              date: "15/05/2023 10:00",
              action: "Bắt đầu kiểm tra",
              status: "completed",
            },
            {
              date: "15/05/2023 10:30",
              action: "Thay dầu và lọc dầu",
              status: "completed",
            },
            {
              date: "15/05/2023 11:00",
              action: "Kiểm tra và thay lọc gió",
              status: "in-progress",
            },
            {
              date: "15/05/2023 11:30",
              action: "Hoàn thành và bàn giao",
              status: "pending",
            },
          ],
        };

        // Giả lập độ trễ mạng
        setTimeout(() => {
          setData(mockData);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { data, loading, error };
}