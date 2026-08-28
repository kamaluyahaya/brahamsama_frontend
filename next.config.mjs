/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiTarget = process.env.API_URL || 'http://localhost:5009';
    return [
      {
        source: '/api/:path*',
        destination: `${apiTarget}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiTarget}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
