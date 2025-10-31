/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable in Next.js 14, no need for experimental flag
}

// 仅在生产环境禁用缓存，开发环境不需要
if (process.env.NODE_ENV === 'production') {
  nextConfig.headers = async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  }
  
  nextConfig.generateBuildId = async () => {
    // 使用时间戳作为build ID，确保每次构建都是唯一的
    return `build-${Date.now()}`
  }
}

module.exports = nextConfig
