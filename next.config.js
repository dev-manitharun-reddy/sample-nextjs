/** @type {import('next').NextConfig} */
const nextConfig = {
  // add the domain array to the images object to allow images from the domain to be used in the app
  images: {
    domains: ["picsum.photos", "ik.imagekit.io"],
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },
};

module.exports = nextConfig;
