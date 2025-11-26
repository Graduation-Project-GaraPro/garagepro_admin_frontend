// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { OnlineUserProvider } from "@/constants/OnlineUserProvider";
import { RepairOrderHubProvider } from "@/constants/RepairOrderHubProvider";
import { AuthProvider } from "@/contexts/auth-context";
import { PermissionProvider } from "@/contexts/permission-context"; // 👈 THÊM DÒNG NÀY

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OtoGarage",
  description: "OtoGarage Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
         
          <PermissionProvider>
            <OnlineUserProvider>
              <RepairOrderHubProvider>{children}</RepairOrderHubProvider>
            </OnlineUserProvider>
            <Toaster />
          </PermissionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
