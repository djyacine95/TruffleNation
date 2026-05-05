import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 3000;

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// BASE_PATH defaults to "/" for standard deployments (Render, Vercel, etc.)
const basePath = process.env.BASE_PATH ?? "/";

const isReplit = process.env.REPL_ID !== undefined;
const isDev = process.env.NODE_ENV !== "production";

const appDir = path.resolve(import.meta.dirname);
const repoRoot = path.resolve(appDir, "..", "..");

export default defineConfig(async ({ mode }) => {
  // Monorepo: many developers keep one `.env` at the repo root (next to workspace package.json).
  // Vite's default envDir is only `artifacts/trufflenation`, so those vars were invisible.
  // Merge root + app; app wins on duplicates.
  const env = { ...loadEnv(mode, repoRoot, ""), ...loadEnv(mode, appDir, "") };

  return {
    base: basePath,
    define: {
      "import.meta.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY ?? ""),
      "import.meta.env.VITE_CLERK_PROXY_URL": JSON.stringify(env.VITE_CLERK_PROXY_URL ?? ""),
      "import.meta.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL ?? ""),
    },
    plugins: [
      react(),
      tailwindcss(),
      ...(isDev
        ? [
            (await import("@replit/vite-plugin-runtime-error-modal")).default(),
            ...(isReplit
              ? [
                  await import("@replit/vite-plugin-cartographer").then((m) =>
                    m.cartographer({
                      root: path.resolve(import.meta.dirname, ".."),
                    }),
                  ),
                  await import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
                ]
              : []),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
      proxy: {
        "/api": {
          target: `http://localhost:${process.env.API_PORT ?? 8080}`,
          changeOrigin: true,
        },
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
    },
    optimizeDeps: {
      include: ["leaflet", "react-leaflet"],
    },
  };
});
