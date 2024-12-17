/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'https://bundlesuite-users-data.vercel.app']
    }
  }
};

export default nextConfig;
