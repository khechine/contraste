import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'api.contraste.tn',
        pathname: '/media/**',
      },
      // Keep legacy just in case or for migration
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8055',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'directus.contraste.tn',
        pathname: '/assets/**',
      },
    ],
  },
};

export default nextConfig;
