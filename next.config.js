/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { isServer }) => {
    // Suppress Supabase realtime-js dynamic require warning
    config.module.exprContextCritical = false;
    return config;
  },
};

module.exports = nextConfig;
