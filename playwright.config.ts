import { defineConfig, devices } from '@playwright/test';

export const adminBaseURL = 'https://admin.kitchencab.in/login';
export const customerBaseURL = 'https://dev.kitchencab.in/home';
export const testDir = './tests';


export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  timeout: 180000,

  reporter: [
    ['line'],
    ['html'],
    ['junit', { outputFile: './report/results.xml' }],
    ['monocart-reporter', {
      name: "Kitchen Cabbie Automation Test Report",
      outputFile: './report/monocart-report/index.html',
      detailedSteps: true
    }]
  ],

  use: {
    baseURL: adminBaseURL, 
  },
  
  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        browserName: 'chromium',
        channel: 'chrome',
        headless: process.env.CI ? true : false,
        screenshot: 'on',
        video: 'on',
        trace: 'retain-on-failure',
        actionTimeout: 60000,
        viewport: null,
        deviceScaleFactor: undefined,
        launchOptions: { args: ['--start-maximized'] }
      }
    },
  ],

  
});
