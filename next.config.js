/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images served from the S3 bucket (used in og:image etc. if ever needed)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wild-child-cms.s3.us-east-1.amazonaws.com',
      },
    ],
  },
};

module.exports = nextConfig;
