import '@fls/config/load-env.mjs';
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Back-office servi sous une URL masquée (cahier des charges) : https://fls.sn/admin-fls
  basePath: '/admin-fls',
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@fls/core', '@fls/db'],
  experimental: { serverActions: { bodySizeLimit: '12mb' }, serverComponentsExternalPackages: ['sharp'] },
  images: { unoptimized: true },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Frame-Options', value: 'DENY' }, { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'same-origin' }, { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
    ] }];
  },
};
export default nextConfig;
