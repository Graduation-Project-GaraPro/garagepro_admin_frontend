import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    // Chỉ remove khi build/run production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            // Giữ lại log quan trọng (tuỳ bạn)
            exclude: ["error", "warn"],
          }
        : false,
  },
};

export default nextConfig;
