import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      // forward API calls
      '/api': 'http://localhost:3000',

      // forward video file requests
      '/uploads': 'http://localhost:3000',
    },
  },
});
