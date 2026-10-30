/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel's own deployment ID comes first: it is unique for every deployment, so a
  // plain "Redeploy" of the same commit works (a commit-SHA ID repeats, and Vercel
  // refuses a second deployment with the same ID). Vercel also caps IDs at 32 characters;
  // dpl_ IDs fit, and a 40-character commit SHA is cut to 32.
  deploymentId: (process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA || "local").slice(0, 32),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
}

export default nextConfig
