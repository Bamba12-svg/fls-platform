import '@fls/config/load-env.mjs';
/** @type {import('next').NextConfig} */
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3001';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@fls/core', '@fls/db'],
  poweredByHeader: false,
  images: {
    // Formats nouvelle génération exigés par le cahier des charges
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },
  experimental: { serverActions: { bodySizeLimit: '12mb' } },
  // Le back-office (application séparée) est servi sous l'URL masquée /admin-fls
  async rewrites() {
    return [
      { source: '/admin-fls', destination: `${ADMIN_URL}/admin-fls` },
      { source: '/admin-fls/:path*', destination: `${ADMIN_URL}/admin-fls/:path*` },
    ];
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        // Version de démonstration : jamais indexée par Google
        ...(process.env.DATA_SOURCE === 'demo' ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : []),
      ],
    }];
  },
};

export default nextConfig;
