import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        // Google user profile photos (OAuth sign-in via Google)
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        // Supabase Storage public files (vendor avatars, event images, receipts)
        protocol: "https",
        hostname: "vrcedxsfglrrpxkawvsy.storage.supabase.co",
      },
    ],
  },
};

export default withSerwist(nextConfig);
