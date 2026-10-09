/** @type {import('next').NextConfig} */
const nextConfig = {
  deploymentId: process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || "local",
  experimental: {
    serverActions: {
      bodySizeLimit: "110mb",
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
