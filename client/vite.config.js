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
          manualChunks: {
            // Core React and Routing
            'vendor-react': ['react', 'react-dom', 'react-router'],
            // Animations
            'vendor-animations': ['framer-motion'],
            // Maps (Large footprint)
            'vendor-maps': ['leaflet', 'react-leaflet'],
            // UI Components and Charts
            'vendor-ui': ['lucide-react', 'recharts', 'react-icons', 'react-easy-crop'],
            // Utility Libraries (Country JSON, Lodash, etc.)
            'vendor-utils': ['country-state-city', 'lodash', 'date-fns'],
          },
        },
      },
    },
  };
});
