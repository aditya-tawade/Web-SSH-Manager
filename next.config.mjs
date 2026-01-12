/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Externalize ssh2 for serverless functions (fixes Turbopack build errors)
    serverExternalPackages: ['ssh2'],
    experimental: {
        // Use webpack instead of turbopack for production builds
        turbo: false,
    },
};

export default nextConfig;
