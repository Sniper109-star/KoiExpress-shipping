import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@shipframe/adapter-process.env.ADAPTER_MODE", "@shipframe/adapter-mock"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
