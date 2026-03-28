const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e/tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:8080',
    headless: true,
  },
  reporter: 'line',
});
