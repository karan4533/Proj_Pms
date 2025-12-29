/** @type {import('next').NextConfig} */
const nextConfig = {
  // Moved from experimental in Next.js 16
  serverExternalPackages: [],
  
  // Empty turbopack config to silence webpack warning
  turbopack: {},
  
  // Fix for OneDrive file locking issues on Windows
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  
  // Webpack config for development only
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
      config.watchOptions = {
        ...config.watchOptions,
        aggregateTimeout: 300,
        poll: 1000,
        ignored: /node_modules/,
      };
    }
    config.resolve = {
      ...config.resolve,
      symlinks: false,
    };
    return config;
  },
  
  // Increase body size limit for file uploads
  async headers() {
    return [
      {
        source: '/api/tasks/upload-excel',
        headers: [
          {
            key: 'Content-Length',
            value: '104857600', // 100MB in bytes
          },
        ],
      },
    ];
  },
};

export default nextConfig;
