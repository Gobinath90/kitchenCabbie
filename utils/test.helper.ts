import { Page, expect, test } from '@playwright/test';
import { adminBaseURL } from '../playwright.config';

const logPrefix = '[test.helper.ts]';

export const loginAsAdmin = async (page: Page) => {
    await test.step('Navigate to Admin Login Page', async () => {
        console.log(`${logPrefix} Navigating to admin login page...`);
        await page.goto(adminBaseURL);
    });

    await test.step('Fill Mobile Number and Password', async () => {
        console.log(`${logPrefix} Filling login credentials...`);
        await page.getByRole('textbox', { name: 'Mobile Number' }).fill('9952891031');
        await page.getByRole('textbox', { name: 'Password' }).fill('SmartWork@123');
    });

    await test.step('Click Login Button', async () => {
        console.log(`${logPrefix} Clicking the Login button...`);
        await page.getByRole('button', { name: 'Login' }).click();
    });
};

export const validateLeftSidebarMenu = async (page: Page) => {
    await test.step('Validate left navigation menu items', async () => {
        const expectedMenuItems = [
            'Dashboard', 'Category', 'Product', 'Banner', 'Hub',
            "Employee's", 'Customer', 'Order', 'Address', 'Inventory'
        ];

        const sidebar = page.getByRole('list');
        for (const item of expectedMenuItems) {
            console.log(`${logPrefix} Checking sidebar item: ${item}`);
            await expect(sidebar.getByText(item)).toBeVisible();
        }
    });
};
