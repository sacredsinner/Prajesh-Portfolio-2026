/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
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
  async rewrites() {
    return [
      {
        source: "/mobile/overview",
        destination: "/overview",
      },
      {
        source: "/m/overview",
        destination: "/overview",
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/overview",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-Requested-With" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self' *" },
          { key: "X-Micro-Frontend-Name", value: "studio-overview-mobile" },
          { key: "X-Micro-Frontend-Version", value: "2026.1.0" },
        ],
      },
      {
        source: "/mobile/overview",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, X-Requested-With" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self' *" },
          { key: "X-Micro-Frontend-Name", value: "studio-overview-mobile" },
          { key: "X-Micro-Frontend-Version", value: "2026.1.0" },
        ],
      },
    ]
  },
}

export default nextConfig
