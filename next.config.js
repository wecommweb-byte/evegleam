/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mediumorchid-chough-398089.hostingersite.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'evegleam.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'secure.gravatar.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
