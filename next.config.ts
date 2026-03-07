import type { NextConfig } from "next";
import createMDX from '@next/mdx'

const withMDX = createMDX({})

const isGithubPages = process.env.DEPLOY_TARGET === 'github'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: isGithubPages ? '/blog' : '',
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
  images: { unoptimized: true },
}

export default withMDX(nextConfig)
