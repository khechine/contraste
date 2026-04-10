import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8055',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'www.contraste.tn',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'www.contraste.tn',
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
