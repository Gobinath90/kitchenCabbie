import { test } from '@playwright/test';
import {
    loginAsAdmin,
    validateLeftSidebarMenu
} from '../../utils/test.helper';
import {
    navigateToCategoryPage,
    validateCategoryPageContent
} from '../../utils/category';

test.describe('Admin Panel UI Tests', () => {

    test('Admin login and left navigation menu validation', async ({ page }) => {
        test.info().annotations.push({ type: 'tag', description: '@smoke' });
        await loginAsAdmin(page);
        await validateLeftSidebarMenu(page);
    });


});
