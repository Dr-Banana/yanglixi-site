/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // SSR 模式：移除 static export 配置
}

module.exports = nextConfig

