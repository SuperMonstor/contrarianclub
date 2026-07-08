import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Standalone studio. Fixed port so the Playwright export script always
// knows where to find a running preview/dev server.
export default defineConfig({
  plugins: [react()],
  server: { port: 4318 },
});
