/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel rejects deployment IDs longer than 32 characters, and a git commit SHA is 40.
  deploymentId: (process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || "local").slice(0, 32),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
