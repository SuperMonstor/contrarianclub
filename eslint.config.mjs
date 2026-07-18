import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local agent worktrees may contain their own generated build output.
    ".claude/**",
    // The poster studio is a standalone Vite project with its own toolchain.
    // Next's rules (next/image and friends) do not apply to it.
    "posters/**",
  ]),
]);

export default eslintConfig;
