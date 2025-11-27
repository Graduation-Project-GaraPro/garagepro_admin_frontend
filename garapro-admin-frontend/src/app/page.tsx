// app/page.tsx
import { Suspense } from "react";
import LoginPageClient from "@/components/LoginPageClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}
