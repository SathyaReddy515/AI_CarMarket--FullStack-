/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false, // disables turbopack
    serverComponentsHmrCache: false, // disables server components HMR cache
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
