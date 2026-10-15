import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 토스 WebView 번들 내부에서도 JS/CSS를 올바르게 읽도록 상대 경로를 사용합니다.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { outDir: 'dist', emptyOutDir: true },
});
