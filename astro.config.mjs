import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";

// site: "https://dyordsabuzo.github.io",
// base: "/my-profile",

export default defineConfig({
  integrations: [
    tailwind(),
    icon(),
    mdx({
      include: ["src/content/**/*.mdx"],
    }),
    sitemap({
      filter: (page) => !page.includes("/blogs/"),
    }),
    react(),
  ],
  vite: {
    build: {
      rollupOptions: {
        external: (id) => id.includes("/blogs/") || id.includes("/blog/"),
      },
    },
    server: {
      watch: {
        ignored: ["**/blogs/**", "**/blog/**"],
      },
    },
  },
});
