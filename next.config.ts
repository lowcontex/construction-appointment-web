import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV !== "production";

const scriptSrc = [
  "script-src",
  "'self'",
  "'unsafe-inline'",
  isDevelopment ? "'unsafe-eval'" : "",
].filter(Boolean).join(" ");

const connectSrc = [
  "connect-src",
  "'self'",
  isDevelopment ? "ws:" : "",
  isDevelopment ? "http://localhost:*" : "",
  isDevelopment ? "http://127.0.0.1:*" : "",
].filter(Boolean).join(" ");

const productionOnlyDirectives = [
  !isDevelopment ? "upgrade-insecure-requests" : "",
].filter(Boolean);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              scriptSrc,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob:",
              connectSrc,
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              ...productionOnlyDirectives,
            ].join("; "),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Origin-Agent-Cluster", value: "?1" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
