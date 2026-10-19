import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

const htmlVersionPlugin = () => ({
  name: "html-version-plugin",
  transformIndexHtml(html: string) {
    const buildTimestamp = Date.now().toString(36);
    return html.replace(
      /(src|href)="([^"]+\.(?:js|css))"/g,
      `$1="$2?v=${buildTimestamp}"`
    );
  },
});

export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss(),
    htmlVersionPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
  server: {
    proxy: {
      "/api/resend": {
        target: "https://api.resend.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/resend/, ""),
      },
      "/api/mercadopago": {
        target: "https://api.mercadopago.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mercadopago/, ""),
      },
    },
  },
});
