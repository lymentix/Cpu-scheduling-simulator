/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Enables static site generation for GitHub Pages
  basePath: '/cpu-scheduling-simulator', // Required for GitHub Pages subpath
  assetPrefix: '/cpu-scheduling-simulator/', // Ensures proper asset loading

  images: {
    unoptimized: true, // Prevents image optimization (required for static export)
  },
};

export default nextConfig;
