/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { apiClient } from "./api-client";

export interface RoBoardCardDto {
  repairOrderId: string;
  receiveDate: string;
  roTypeName?: string;
  statusName: string;
  vehicleInfo: string;
  customerInfo: string;
  customerName?: string;
  customerPhone?: string;
  branchId?: string;
  estimatedRepairTime?: number;
  serviceName: string;
  estimatedAmount: number;
  branchName: string;
  label: {
    labelId: number;
    labelName: string;
    color: string;
  } | null;
}

class RepairOrderHubService {
  private connection: HubConnection | null = null;
  private isConnected = false;
  private reconnecting = false;

  // 🧠 lưu danh sách sự kiện đã đăng ký (để tránh đăng ký lại)
  private subscribedEvents = new Set<string>();

  /** Initialize SignalR connection */
  /** Initialize SignalR connection */
  public async initialize(): Promise<void> {
    if (this.connection && this.isConnected) {
      console.log("⚙️ SignalR already connected");
      return;
    }

    if (!this.connection) {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5117";
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken") || ""
          : "";

      this.connection = new HubConnectionBuilder()
        .withUrl(`${baseUrl}/api/repairorderhub`, {
          accessTokenFactory: () => token,
        })
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount >= 5) return null;
            return 3000;
          },
        })
        .build();

      // 🧠 ĐĂNG KÝ TẤT CẢ CÁC SỰ KIỆN NGAY Ở ĐÂY — TRƯỚC KHI START
      this.registerDefaultEvents();
      this.registerHubEvents();
    }

    // ✅ BẮT ĐẦU KẾT NỐI SAU KHI ĐÃ ĐĂNG KÝ HẾT
    try {
      if (this.connection.state === "Disconnected") {
        await this.connection.start();
        console.log("✅ SignalR Connected");
      }
      this.isConnected = true;
    } catch (error) {
      console.error("❌ SignalR Connection Error:", error);
      this.isConnected = false;
      this.tryReconnect();
    }
  }

  /** Tách riêng phần đăng ký event cho rõ */
  private registerHubEvents(): void {
    this.subscribe("Connected", (connectionId: string) => {
      console.log("🔗 Connected with Connection ID:", connectionId);
    });

    this.subscribe("RepairOrderCreated", (order) => {
      console.log("🆕 Repair Order Created:", order);
    });

    this.subscribe("RepairOrderMoved", (id, newStatus, card) => {
      console.log("🚚 Repair Order Moved:", id, newStatus, card);
    });

    this.subscribe("RepairOrderUpdated", (order) => {
      console.log("✏️ Repair Order Updated:", order);
    });

    this.subscribe("RepairOrderDeleted", (id) => {
      console.log("🗑️ Repair Order Deleted:", id);
    });
  }

  /** Reconnect manually if connection lost */
  private async tryReconnect(): Promise<void> {
    if (this.reconnecting) return;
    this.reconnecting = true;

    const maxRetries = 5;
    for (let i = 0; i < maxRetries && !this.isConnected; i++) {
      try {
        console.log(`🔁 Trying to reconnect... (${i + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, 4000));
        await this.connection?.start();
        this.isConnected = true;
        console.log("✅ SignalR Reconnected");
        break;
      } catch (error) {
        console.error(`Reconnect attempt ${i + 1} failed`, error);
      }
    }

    this.reconnecting = false;

    if (!this.isConnected) {
      console.error("❌ Failed to reconnect after max retries");
    }
  }

  public offRepairOrderCreated(
    callback: (repairOrder: RoBoardCardDto) => void
  ) {
    this.connection?.off("RepairOrderCreated", callback);
    this.subscribedEvents.delete("RepairOrderCreated");
  }

  /** Gracefully disconnect */
  public async disconnect(): Promise<void> {
    try {
      await this.connection?.stop();
      this.isConnected = false;
      this.subscribedEvents.clear(); // 🧹 reset event flags
      console.log("🔌 SignalR Disconnected");
    } catch (error) {
      console.error("Error disconnecting SignalR:", error);
    }
  }

  /** Returns true if connected */
  public get IsConnected(): boolean {
    return this.isConnected;
  }

  // === SERVER-LINKED METHODS ===

  /** Ngăn đăng ký trùng callback */
  private subscribe(eventName: string, callback: (...args: any[]) => void) {
    this.connection?.on(eventName, (...args) => {
      callback(...args);
    });
  }

  public onRepairOrderMoved(
    callback: (
      repairOrderId: string,
      newStatusId: string,
      updatedCard: RoBoardCardDto
    ) => void
  ): void {
    this.subscribe("RepairOrderMoved", callback);
  }

  public onRepairOrderCreated(
    callback: (repairOrder: RoBoardCardDto) => void
  ): void {
    this.subscribe("RepairOrderCreated", callback);
  }

  public onRepairOrderUpdated(
    callback: (repairOrder: RoBoardCardDto) => void
  ): void {
    this.subscribe("RepairOrderUpdated", callback);
  }

  public onRepairOrderDeleted(callback: (repairOrderId: string) => void): void {
    this.subscribe("RepairOrderDeleted", callback);
  }

  public onConnected(callback: (connectionId: string) => void): void {
    this.subscribe("Connected", callback);
  }

  /** Update repair order status */
  public async updateRepairOrderStatus(
    repairOrderId: string,
    newStatusId: string
  ): Promise<boolean> {
    try {
      const response = await apiClient.post<unknown>(
        "/api/RepairOrder/status/update",
        { repairOrderId, newStatusId }
      );

      return (response as any)?.success ?? true;
    } catch (error) {
      console.error("Failed to update repair order status:", error);
      return false;
    }
  }

  /** Handles onclose and reconnection automatically */
  private registerDefaultEvents(): void {
    if (!this.connection) return;

    this.connection.onclose(async (error) => {
      this.isConnected = false;
      console.warn("⚠️ SignalR Disconnected:", error?.message || error);
      await this.tryReconnect();
    });

    this.connection.onreconnecting(() => {
      console.log("🟡 SignalR reconnecting...");
      this.isConnected = false;
    });

    this.connection.onreconnected(() => {
      console.log("🟢 SignalR reconnected successfully");
      this.isConnected = true;
    });
  }
}

export const repairOrderHubService = new RepairOrderHubService();
