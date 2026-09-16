import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: "C:/Users/abdal/Desktop/projects/js/next js/new kosmetik/kometik-new",
  },
  images: {
    remotePatterns: [
       {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "i.otto.de",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
      {
        protocol: "https",
        hostname: "www.dior.com",
      },
    ],
  },
};

export default nextConfig;