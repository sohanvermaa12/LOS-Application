/** @type {import('next').NextConfig} */
import nextEnv from "@next/env";
import { resolve } from "node:path";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(resolve(process.cwd(), "src"));

const nextConfig = {
  reactStrictMode: true
};

export default nextConfig;