/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST' },
        ],
      },
    ]
  },
  images: {
    domains: ['photo-solution-backend.vercel.app'],
  },
  output: 'standalone',
}

export default nextConfig;
