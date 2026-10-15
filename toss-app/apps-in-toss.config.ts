import { defineConfig } from '@apps-in-toss/web-framework/config';

// 앱인토스 콘솔에 등록한 고유 appName과 일치해야 합니다.
export default defineConfig({
  appName: 'noviq',
  brand: { primaryColor: '#3182F6' },
  webView: {},
  permissions: [],
  webBundleDir: 'dist',
});
