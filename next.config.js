/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wild-child-cms.s3.us-east-1.amazonaws.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/bridal-hair-makeup-atlanta-new-orleans',
        destination: '/bridal-hair-makeup-atlanta',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source:
          '/((?!_next/static|_next/image|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff2?)$).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
