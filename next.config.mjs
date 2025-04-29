/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Optimizes for containerized environments
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add any other Next.js configuration options here
}

export default nextConfig
