import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',      // thư mục chứa test
  use: {
    headless: true,        // chạy không hiển thị browser
    screenshot: 'on',      // tự chụp screenshot
    video: 'on',           // quay video cho từng testcase
    trace: 'on-first-retry', // log + hành động
  },
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }], // xuất report
  ],
});
