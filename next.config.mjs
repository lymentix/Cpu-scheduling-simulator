/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Enables static export for GitHub Pages
  basePath: '/Cpu-scheduling-simulator', // Ensure exact repo name (case-sensitive)
  assetPrefix: '/Cpu-scheduling-simulator/', // Fix asset loading issues
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
