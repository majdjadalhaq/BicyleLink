import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const backendProxyTarget = env.VITE_BACKEND_URL ?? "http://localhost:3000";
  return {
    plugins: [react()],
    define: {
      "process.env": env,
    },
    server: {
      // Specify server port. Note if the port is already being used,
      // Vite will automatically try the next available port so this may not be the actual port
      // the server ends up listening on.
      port: 5173,

      // Automatically open the app in the browser on server start.
      open: "/",

      // Proxy /api requests to the API server. This will avoid any CORS issues.
      proxy: {
        "/api": backendProxyTarget,
        "/socket.io": {
          target: backendProxyTarget,
          ws: true,
        },
      },
    },
    preview: {
      port: 4173,
      proxy: {
        "/api": backendProxyTarget,
        "/socket.io": {
          target: backendProxyTarget,
          ws: true,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // framer-motion is now fully lazy (only used inside React.lazy() pages).
          // Splitting it into a dedicated chunk is safe — it will only be downloaded
          // when the first lazy route that needs it is navigated to.
          // socket.io-client is NOT split here because SocketProvider imports it
          // synchronously at app startup — splitting it would cause a load-order error.
          manualChunks: {
            "vendor-animations": ["framer-motion"],
          },
        },
      },
    },
  };
});
