import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Tách vendor ra khỏi bundle app — trước đây react/react-dom/axios/recharts/lucide-react đều
        // nằm chung 1 file JS với toàn bộ code app, người dùng phải tải lại toàn bộ vendor mỗi khi
        // app code đổi (deploy mới), thay vì tận dụng cache trình duyệt cho phần vendor ít đổi.
        // Dùng dạng hàm (thay vì object literal) — dạng object bị lỗi type overload với phiên bản
        // Rollup type hiện tại của project.
        // Rollup luôn chuẩn hoá module id sang dấu "/" (kể cả trên Windows), an toàn để so khớp trực tiếp.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('recharts')) return 'vendor-charts';
          if (id.includes('axios') || id.includes('lucide-react')) return 'vendor-ui';
          if (id.includes('/react-router-dom/') || id.includes('/react/') || id.includes('/react-dom/')) return 'vendor-react';
          return undefined;
        },
      },
    },
  },
})
