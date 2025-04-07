import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */ devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d1209ykw9ugpec.cloudfront.net",
        pathname: "*",
      },
    ],
  },
};

export default nextConfig;
