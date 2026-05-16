import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const createNextConfig = (phase: string): NextConfig => {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    allowedDevOrigins: ["127.0.0.1"],
    distDir: isDevServer ? ".next-dev" : ".next",
    reactStrictMode: true
  };
};

export default createNextConfig;
