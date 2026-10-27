/** @type {import('next').NextConfig} */
const isBuildCommand =
  process.env.npm_lifecycle_event === 'build' && !process.env.VERCEL;

const nextConfig = {
  reactStrictMode: true,
  distDir: isBuildCommand ? '.next-build' : '.next',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
