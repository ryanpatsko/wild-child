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
      { source: '/faq', destination: '/makeup-faq', statusCode: 301 },
      { source: '/makeup-classes', destination: '/atlanta-makeup-classes', statusCode: 301 },
      { source: '/film-tv-makeup-artist', destination: '/atlanta-film-tv-makeup-artist', statusCode: 301 },
      { source: '/event-hair-and-makeup', destination: '/atlanta-special-event-hair-makeup', statusCode: 301 },
      { source: '/creative-fx', destination: '/atlanta-special-effects-makeup', statusCode: 301 },
      { source: '/bridal-hair-makeup-atlanta', destination: '/atlanta-bridal-hair-makeup', statusCode: 301 },
      {
        source: '/bridal-hair-makeup-atlanta-new-orleans',
        destination: '/atlanta-bridal-hair-makeup',
        statusCode: 301,
      },
      {
        source: '/bridal-hair-makeup-pittsburgh',
        destination: '/pittsburgh-bridal-hair-makeup',
        statusCode: 301,
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
