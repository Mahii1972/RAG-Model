/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@xenova/transformers'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'p7.hiclipart.com',
        port: '',
        pathname: '/preview/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
