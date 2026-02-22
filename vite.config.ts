import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        renderer: resolve(__dirname, 'src/renderer/index.html'),
        editor: resolve(__dirname, 'src/editor/index.html'),
      },
      output: {
        dir: 'dist',
        entryFileNames: (chunkInfo) => {
          // Place entry files in their respective directories
          if (chunkInfo.name === 'renderer') {
            return 'renderer/renderer.js';
          }
          if (chunkInfo.name === 'editor') {
            return 'editor/editor.js';
          }
          return '[name]/[name].js';
        },
        chunkFileNames: 'shared/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? '';
          // Place HTML files in their respective directories
          if (name.endsWith('.html')) {
            if (name.includes('renderer')) {
              return 'renderer/index.html';
            }
            if (name.includes('editor')) {
              return 'editor/index.html';
            }
          }
          if (name.endsWith('.css')) {
            return '[name]/[name].css';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.spec.ts',
        'vite.config.ts',
        'dist/',
      ],
    },
  },
});
