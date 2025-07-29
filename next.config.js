/** @type {import('next').NextConfig} */

// Conditionally load bundle analyzer only if available
let withBundleAnalyzer
try {
  withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
  })
} catch (error) {
  // Bundle analyzer not available, use identity function
  withBundleAnalyzer = config => config
}

const nextConfig = {
  // Disable React strict mode to avoid map issues
  reactStrictMode: false,

  // Essential for production builds
  compress: true,
  poweredByHeader: false,

  // Image optimization - keep simple for Netlify
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },

  // API proxy for development CORS
  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? [
          {
            source: '/api/v1/:path*',
            destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/:path*`,
          },
        ]
      : []
  },

  // Disable custom headers (handled by netlify.toml)
  async headers() {
    return []
  },
}

module.exports = withBundleAnalyzer(nextConfig)
