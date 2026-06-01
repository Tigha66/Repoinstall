import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  appType: 'spa', // Enable SPA fallback for client-side routing
  define: {
    __APP_VERSION__: JSON.stringify(process.env.APP_VERSION || '0.2.1'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  server: {
    port: 2886,
    host: true, // bind 0.0.0.0 so it is reachable behind a proxy
    // Allow access through reverse proxies / cloud preview hostnames.
    // Set to a specific hostname list to lock this down in production.
    allowedHosts: (process.env.VITE_ALLOWED_HOSTS || 'all') === 'all'
      ? true
      : (process.env.VITE_ALLOWED_HOSTS || '').split(',').map((h) => h.trim()).filter(Boolean),
    proxy: {
      '/api': {
        target: 'http://localhost:2785',
        changeOrigin: true,
        secure: false,
      },
      // Forward Socket.IO (live dashboard updates) to the API server
      '/socket.io': {
        target: 'http://localhost:2785',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
