import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' so the built app works from any static folder or sub-path.
export default defineConfig({
  plugins: [react()],
  base: './',
});
