import path from 'node:path';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(path.join(process.cwd(), 'src'));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;