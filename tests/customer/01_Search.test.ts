import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('https://dev.kitchencab.in/home');
    });

    test('Search Bar Display - Verify search bar is visible', async ({ page }) => {
        await expect(page.getByRole('textbox', { name: 'Search the Product you want' })).toBeVisible();
    });

    test('Placeholder Text - Validate placeholder text', async ({ page }) => {
        const searchBox = page.getByRole('textbox', { name: 'Search the Product you want' });
        await expect(searchBox).toHaveAttribute('placeholder', 'Search the Product you want');
    });

    test('Search Icon - Verify search icon is visible and clickable', async ({ page }) => {
        const searchIcon = page.getByRole('img', { name: 'search-icon' });
        await expect(searchIcon).toBeVisible();
        await expect(searchIcon).toBeEnabled();
    });
    test('Valid Search Input - Validate search functionality with valid input', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Search the Product you want' }).fill('Whole Chicken without Skin');
        await page.getByRole('img', { name: 'search-icon' }).click();
        await expect(page.getByRole('heading', { name: 'Whole Chicken without Skin' })).toBeVisible();
    });

    test('Invalid Search Input - Validate search with invalid input', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Search the Product you want' }).fill('Whole Chicken without Skins');
        await page.getByRole('img', { name: 'search-icon' }).click();
        await expect(page.getByText('Oops, we couldnt find any')).toBeVisible();
    });
    test('Empty Search Input - Validate search with empty input', async ({ page }) => {
        await page.getByRole('img', { name: 'search-icon' }).click();
        await expect(page).toHaveURL('https://dev.kitchencab.in/search');
    });

    test('Typing Response - Check if input is captured correctly', async ({ page }) => {
        const input = page.getByRole('textbox', { name: 'Search the Product you want' });
        await expect(input).toBeVisible();
        await input.evaluate((el: HTMLInputElement) => {
            el.value = 'Chicken';
            el.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await expect(input).toHaveValue('Chicken');
    });

    test('Case Sensitivity - Validate search works with different casing', async ({ page }) => {
        const input = page.getByRole('textbox', { name: 'Search the Product you want' });
        await input.fill('wHOLE CHICKEN WITHOUT SKIN');
        await page.getByRole('img', { name: 'search-icon' }).click();
        await expect(page.getByRole('heading', { name: 'Whole Chicken without Skin' })).toBeVisible();
    });
    test('Navigation - Verify navigation on search result click', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Search the Product you want' }).fill('Whole Chicken without Skin');
        await page.getByRole('img', { name: 'search-icon' }).click();

        // Wait and click the product link
        const productLink = page.getByRole('heading', { name: 'Whole Chicken without Skin' });
        await expect(productLink).toBeVisible();
        await productLink.click();

        await expect(page).toHaveURL(/.*\/product-detail\/whole-chicken-without-skin/);
    });
    test('UI Validation - Check search bar alignment and style', async ({ page }) => {
        const input = page.getByRole('textbox', { name: 'Search the Product you want' });
        const boundingBox = await input.boundingBox();
        expect(boundingBox).not.toBeNull();
        expect(boundingBox?.width).toBeGreaterThan(200);
    });

});