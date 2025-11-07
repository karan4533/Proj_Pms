/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Increase file upload limits for CSV task import
    serverComponentsExternalPackages: [],
  },
  // Increase body size limit to 100MB for file uploads
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
