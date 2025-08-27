// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Don’t fail the production build because of ESLint rules like "no-explicit-any"
    ignoreDuringBuilds: true,
  },
  // If you ever hit TypeScript errors on Vercel and want to ship anyway, uncomment:
  // typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
