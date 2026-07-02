import type { NextConfig } from "next";
import { DEFAULT_ADMIN_HOST } from "@/lib/admin-routes";

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
      DEFAULT_ADMIN_HOST,
  },
};

export default nextConfig;
