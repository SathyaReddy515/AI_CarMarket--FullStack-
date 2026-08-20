import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  
  images:{
    remotePatterns:[
      {
        protocol: 'https',
        hostname: 'uzgrsujoxaundjvuhgxj.supabase.co',
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-src 'self' https://vehiqldrivefuture.created.app",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
