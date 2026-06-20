import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_ADMIN_HOST:
      process.env.NEXT_PUBLIC_ADMIN_HOST ||
      process.env.ADMIN_HOST ||
      "admin.thecontrarian.club",
  },
};

export default nextConfig;
