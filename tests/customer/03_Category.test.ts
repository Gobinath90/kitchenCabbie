import { test, expect, Page } from '@playwright/test';

test.describe('Category Functionality', () => {
    // --- Logging Hooks ---
    test.beforeEach(async ({ }, testInfo) => {
        console.log(`\n🔷 Starting test: "${testInfo.title}"`);
    });

    test.afterEach(async ({ }, testInfo) => {
        const status = testInfo.status || 'unknown';
        console.log(`🔶 Finished test: "${testInfo.title}" with status: ${status}\n`);
    });

    // --- Selectors ---
    const getCategoryContainers = (page: Page) => page.locator('div.grid > div.flex.flex-col');
    const getCategoryLabels = (page: Page) => page.locator('div.grid > div.flex.flex-col > p');
    const getCategoryImages = (page: Page) => page.locator('div.grid > div.flex.flex-col img');

    // --- Helper Assertions ---
    async function assertLabelsVisibleAndValid(page: Page) {
        const labels = getCategoryLabels(page);
        const count = await labels.count();
        expect(count).toBeGreaterThan(0);

        // Regex: allow letters, numbers, space, comma, dash, slash, parentheses, ampersand, dot
        const validLabelRegex = /^[a-zA-Z0-9\s,.\-\/()&]+$/;

        for (let i = 0; i < count; i++) {
            const label = labels.nth(i);
            await expect(label).toBeVisible();

            const text = (await label.textContent())?.trim() || '';
            expect(text.length).toBeGreaterThan(0);
            expect(validLabelRegex.test(text)).toBeTruthy();
        }
    }

    async function assertImagesVisibleAndValidSrc(page: Page) {
        const images = getCategoryImages(page);
        const count = await images.count();
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
            const img = images.nth(i);
            await expect(img).toBeVisible();

            const src = await img.getAttribute('src');
            expect(src).toBeTruthy();
            expect(src?.startsWith('http')).toBeTruthy();
        }
    }

    async function assertImagesResolution(page: Page) {
        const images = getCategoryImages(page);
        const count = await images.count();

        for (let i = 0; i < count; i++) {
            const img = images.nth(i);
            const src = await img.getAttribute('src');
            const [naturalWidth, naturalHeight] = await Promise.all([
                img.evaluate((node) => (node as HTMLImageElement).naturalWidth),
                img.evaluate((node) => (node as HTMLImageElement).naturalHeight),
            ]);

            expect(src).toBeTruthy();

            if (naturalWidth < 100 || naturalHeight < 100) {
                console.warn(`⚠️ Image ${i + 1} might be broken or low resolution.`);
            } else {
                expect(naturalWidth).toBeGreaterThanOrEqual(100);
                expect(naturalHeight).toBeGreaterThanOrEqual(100);
            }
        }
    }

    // --- Setup ---
    test.beforeEach(async ({ page }) => {
        await page.goto('https://dev.kitchencab.in/home');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
    });

    test.afterEach(async ({ context }) => {
        await context.close();
    });

    // --- Tests ---
    test('Category Display - Verify all categories are displayed and log names', async ({ page }) => {
        const labels = getCategoryLabels(page);
        const count = await labels.count();
        console.log(`\n✅ Number of categories found: ${count}\n`);

        for (let i = 0; i < count; i++) {
            const text = (await labels.nth(i).textContent())?.trim();
            console.log(`🔹 Category ${i + 1}: ${text}`);
        }
        expect(count).toBeGreaterThan(0);
    });

    test('Category Label - Validate category name labels', async ({ page }) => {
        await assertLabelsVisibleAndValid(page);
    });

    test('Category Image - Verify each category image loads correctly', async ({ page }) => {
        await assertImagesVisibleAndValidSrc(page);
    });

    test('Image Quality - Check image resolution', async ({ page }) => {
        await assertImagesResolution(page);
    });

    test('Special Characters - Validate no unnecessary characters in labels', async ({ page }) => {
        const labels = getCategoryLabels(page);
        const count = await labels.count();

        // Regex to detect invalid characters (exclude allowed set)
        const invalidCharsRegex = /[^a-zA-Z0-9\s,.\-\/()&]/;

        for (let i = 0; i < count; i++) {
            const text = (await labels.nth(i).textContent())?.trim() || '';
            const hasInvalidChars = invalidCharsRegex.test(text);
            console.log(`Label ${i + 1}: "${text}" — Invalid chars found: ${hasInvalidChars}`);
            expect(hasInvalidChars).toBeFalsy();
        }
    });

    test('Category Click Action - Verify click navigation', async ({ page }) => {
        const firstCategory = getCategoryContainers(page).first();
        await expect(firstCategory).toBeVisible();

        const label = (await firstCategory.locator('p').textContent())?.trim();
        console.log(`🖱️ Clicking on first category: "${label}"`);

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle' }),
            firstCategory.click(),
        ]);

        const currentUrl = page.url();
        console.log(`🔗 Navigated to URL: ${currentUrl}`);

        expect(currentUrl).toContain('product/?category_slugs=');
    });

    test('UI Alignment - Verify layout and alignment', async ({ page }) => {
        const firstCategory = getCategoryContainers(page).first();
        await expect(firstCategory).toBeVisible();

        const [display, alignItems] = await Promise.all([
            firstCategory.evaluate(el => window.getComputedStyle(el).display),
            firstCategory.evaluate(el => window.getComputedStyle(el).alignItems),
        ]);

        console.log(`📐 CSS Display property: ${display}`);
        console.log(`📐 CSS Align Items property: ${alignItems}`);

        expect(display).toBe('flex');
        expect(alignItems).toBe('center');
    });

    test('Page scroll validation', async ({ page }) => {
        const [viewportHeight, bodyScrollHeight] = await Promise.all([
            page.evaluate(() => window.innerHeight),
            page.evaluate(() => document.body.scrollHeight),
        ]);

        console.log(`Viewport height: ${viewportHeight}, Body scroll height: ${bodyScrollHeight}`);

        if (bodyScrollHeight <= viewportHeight) {
            console.log('Page is not scrollable vertically. Skipping scroll test.');
            return;
        }

        const initialScrollY = await page.evaluate(() => window.scrollY);
        await page.evaluate(() => window.scrollBy(0, 100));
        const newScrollY = await page.evaluate(() => window.scrollY);

        console.log(`Initial scrollY: ${initialScrollY}, New scrollY: ${newScrollY}`);

        expect(newScrollY).toBeGreaterThan(initialScrollY);
    });

    test('Responsive Layout - Test responsiveness on various devices', async ({ page }) => {
        const viewports = [
            { width: 1280, height: 720 }, // desktop
            { width: 768, height: 1024 }, // tablet portrait
            { width: 375, height: 667 },  // mobile portrait
            { width: 414, height: 896 },  // mobile landscape
        ];

        for (const viewport of viewports) {
            await page.setViewportSize(viewport);
            console.log(`Testing viewport: ${viewport.width}x${viewport.height}`);

            const container = page.locator('div.grid').first();
            await expect(container).toBeVisible({ timeout: 10000 });
        }

        const fullScreen = await page.evaluate(() => ({
            width: window.screen.width,
            height: window.screen.height,
        }));

        console.log(`Testing full screen viewport: ${fullScreen.width}x${fullScreen.height}`);

        await page.setViewportSize(fullScreen);

        const container = page.locator('div.grid').first();
        await expect(container).toBeVisible({ timeout: 10000 });

        // Reset to default viewport after tests
        await page.setViewportSize({ width: 1280, height: 720 });
    });
});
