/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://carimportbackend-production.up.railway.app/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;