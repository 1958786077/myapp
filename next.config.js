/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable in Next.js 14, no need for experimental flag
}

// 浠呭湪鐢熶骇鐜绂佺敤缂撳瓨锛屽紑鍙戠幆澧冧笉闇€瑕?if (process.env.NODE_ENV === 'production') {
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
    // 浣跨敤鏃堕棿鎴充綔涓篵uild ID锛岀‘淇濇瘡娆℃瀯寤洪兘鏄敮涓€鐨?    return `build-${Date.now()}`
  }
}

module.exports = nextConfig
