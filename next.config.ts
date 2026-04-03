import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  // CDN-level redirect: / → /it (permanent, handled before any server code)
  async redirects() {
    return [
      {
        source: "/",
        destination: "/it",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
