/** @type {import('next').NextConfig} */
const nextConfig = {
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
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      new URL('https://my-store-id.public.blob.vercel-storage.com/**'),
    ],
  },
};

module.exports = nextConfig;

import Image from 'next/image';
 
<Image
  src="https://my-store-id.public.blob.vercel-storage.com/avatar.png"
  alt="User avatar"
  width={200}
  height={200}
/>