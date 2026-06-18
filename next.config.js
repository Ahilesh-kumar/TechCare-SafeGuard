/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    // Strip trailing slash if present to avoid double slashes //api in routes
    if (apiUrl.endsWith("/")) {
      apiUrl = apiUrl.slice(0, -1);
    }
    console.log(`[NextConfig] Rewriting /api/:path* requests to: ${apiUrl}`);
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
