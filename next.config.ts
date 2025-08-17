/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'graph.microsoft.com',
        port: '',
        pathname: '/**',
      },
      // Add your Directus instance domain here
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_DIRECTUS_URL?.replace('https://', '') || 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
    // Fallback for development
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Enable SCSS support
  sassOptions: {
    includePaths: ['./src/styles'],
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_DIRECTUS_URL: process.env.NEXT_PUBLIC_DIRECTUS_URL,
  },
};

module.exports = nextConfig;