/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow the Base44 preview origin to access dev assets and HMR.
  // The platform sets BASE44_PUBLIC_HOST_SUFFIX at runtime.
  allowedDevOrigins: process.env.BASE44_PUBLIC_HOST_SUFFIX
    ? ["3000-" + process.env.BASE44_PUBLIC_HOST_SUFFIX]
    : [],
  webpack(config, { dev, isServer }) {
    if (dev && !isServer) {
      // New asset URLs bypass previously immutable-cached dashboard chunks.
      config.output.filename = "static/chunks/live/[name].js";
      config.output.chunkFilename = "static/chunks/live/[name].js";
    }
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  async headers() {
    // Dev chunks use stable filenames: immutable caching serves stale UI after edits.
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/:path*",
          headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
        },
      ];
    }
    return [
      {
        source: "/(.*)\\.(jpg|jpeg|png|gif|ico|svg|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.*)\\.(js|css)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
