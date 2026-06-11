import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "static.klipy.com" },
      { protocol: "https", hostname: "flagcdn.com" },
      { protocol: "https", hostname: "myzgtlbgcclxapbuvifv.supabase.co" },
    ],
  },
};

export default nextConfig;
