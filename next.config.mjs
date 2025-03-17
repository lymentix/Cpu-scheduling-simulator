/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Add this line for static site generation
  basePath: '/cpu-scheduling-simulator', // Add this line for subpath hosting
};

export default nextConfig;