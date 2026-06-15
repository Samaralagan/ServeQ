import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
    vercel: {
      functions: {
        runtime: "nodejs20.x",
      },
    },
  },
});
