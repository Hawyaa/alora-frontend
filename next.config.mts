/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.pinimg.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  experimental: {
    turbo: {
      rules: {}
    }
  }
}

module.exports = nextConfig
