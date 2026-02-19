import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "logo-elrugido.svg", "robots.txt"],
      manifest: {
        name: "ElRugido - Fe Católica",
        short_name: "ElRugido",
        description: "Tu compañero diario de fe católica. Rosario, oraciones, santos, evangelio y más.",
        theme_color: "#1a1a2e",
        background_color: "#0f0f23",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/dashboard",
        categories: ["education", "lifestyle"],
        icons: [
          {
            src: "/logo-elrugido.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,webp,woff,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/~oauth/, /^\/api/],
      runtimeCaching: [
          {
            urlPattern: /^https:\/\/duggdnqpemwojkojfyei\.supabase\.co\/rest\/v1\/daily_content/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "daily-content-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 12 },
            },
          },
          {
            urlPattern: /^https:\/\/duggdnqpemwojkojfyei\.supabase\.co\/rest\/v1\/calendar_saints/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "saints-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /^https:\/\/duggdnqpemwojkojfyei\.supabase\.co\/rest\/v1\/rosario_misterios/,
            handler: "CacheFirst",
            options: {
              cacheName: "rosario-texts-cache",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: /^https:\/\/duggdnqpemwojkojfyei\.supabase\.co\/rest\/v1\/rosario_oraciones/,
            handler: "CacheFirst",
            options: {
              cacheName: "rosario-prayers-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: /^https:\/\/duggdnqpemwojkojfyei\.supabase\.co\/rest\/v1\/frontera_articulos/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "frontera-articles-cache",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /^https:\/\/duggdnqpemwojkojfyei\.supabase\.co\/rest\/v1\/oraciones/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "oraciones-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /^https:\/\/duggdnqpemwojkojfyei\.supabase\.co\/rest\/v1\/novenas/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "novenas-cache",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /^https:\/\/duggdnqpemwojkojfyei\.supabase\.co\/rest\/v1\/library_lessons/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "lessons-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /^https:\/\/duggdnqpemwojkojfyei\.supabase\.co\/storage/,
            handler: "CacheFirst",
            options: {
              cacheName: "storage-images-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
