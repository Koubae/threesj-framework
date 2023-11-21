import { defineConfig } from 'vite';
// @ts-ignore
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
});