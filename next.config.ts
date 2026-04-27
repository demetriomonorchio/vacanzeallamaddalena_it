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
      {
        protocol: "https",
        hostname: "openweathermap.org",
        pathname: "/img/wn/**",
      },
    ],
  },

  // CDN-level redirect: / → /it (permanent, handled before any server code)
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "header",
            key: "host",
            value: "www\\.vacanzeallamaddalena\\.it",
          },
        ],
        destination: "https://vacanzeallamaddalena.it/:path*",
        permanent: true,
      },
      {
        source: "/",
        destination: "/it",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
