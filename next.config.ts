import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

const withSerwist = withSerwistInit({
  swSrc: "./src/sw.js",
  swDest: "./public/sw.js"
});

export default withSerwist(nextConfig);