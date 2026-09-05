// Empty on purpose. The studio's CSS is plain CSS, no Tailwind, no
// postcss plugins of its own. Without this file, Vite's config search
// walks up out of posters/ and finds the parent repo's postcss.config.mjs
// (the Next.js app's Tailwind setup), which fails to load here because
// @tailwindcss/postcss is not a dependency of this standalone project.
// This file exists only to stop that upward search at the studio's own
// root.
const config = {
  plugins: {},
};

export default config;
