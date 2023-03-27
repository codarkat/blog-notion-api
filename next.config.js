/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    newNextLinkBehavior: false,
  },
  images: {
    domains: ["www.notion.so", "images.unsplash.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.us-west-2.amazonaws.com",
        port: "",
        pathname: "/secure.notion-static.com/**",
      },
      {
        protocol: "https",
        hostname: "s3-us-west-2.amazonaws.com",
        port: "",
        pathname: "/public.notion-static.com/**",
      },
    ],
  },
  compiler: {
    styledComponents: true,
  },
};

module.exports = nextConfig;
