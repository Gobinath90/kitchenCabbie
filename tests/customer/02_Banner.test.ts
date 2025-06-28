import { test, expect } from '@playwright/test';

test.describe('Banner Functionality', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('https://dev.kitchencab.in/home');
    });

    test('Banner Display - Verify banner is displayed correctly', async ({ page }) => {
        await expect(page.getByRole('img', { name: 'Banner' })).toBeVisible();
    });

    test('Banner Content - Validate text content of the banner', async ({ page }) => {

    });

    test('Image Display - Validate banner images', async ({ page }) => {
        const bannerImage = page.locator('div.relative img[alt^="Banner"]');
        await expect(bannerImage).toBeVisible();

        const src = await bannerImage.getAttribute('src');
        const expectedBanners = [
            'banner/egg web.png',
            'banner/mutton web.png',
            'banner/chicken web.png', // add more as needed
        ];
        const matched = expectedBanners.some(banner => src?.includes(banner));
        expect(matched).toBe(true);
    });

    test('Navigation Arrows - Verify navigation arrow buttons', async ({ page }) => {
        const prevButton = page.locator('button[aria-label="Previous Banner"]');
        const nextButton = page.locator('button[aria-label="Next Banner"]');
        const selector = 'div.relative img[alt^="Banner"]';

        await expect(prevButton).toBeVisible();
        await expect(nextButton).toBeVisible();

        const initialSrc = await page.locator(selector).getAttribute('src');
        console.log('Initial src:', initialSrc);

        await nextButton.click();
        await page.waitForFunction(
            ({ initialSrc, selector }) => {
                const img = document.querySelector(selector);
                return img?.getAttribute('src') !== initialSrc;
            },
            { initialSrc, selector }
        );

        const newSrc = await page.locator(selector).getAttribute('src');
        console.log('After next click:', newSrc);
        expect(newSrc).not.toBe(initialSrc);

        await prevButton.click();
        await page.waitForFunction(
            ({ initialSrc, selector }) => {
                const img = document.querySelector(selector);
                return img?.getAttribute('src') === initialSrc;
            },
            { initialSrc, selector }
        );

        const revertedSrc = await page.locator(selector).getAttribute('src');
        console.log('After previous click:', revertedSrc);
        expect(revertedSrc).toBe(initialSrc);
    });


    test('Auto-Slide - Verify if the banner auto-slides', async ({ page }) => {
        const bannerImage = page.locator('div.relative img[alt^="Banner"]');
        const initialSrc = await bannerImage.getAttribute('src');

        // Wait longer than the auto-slide interval (adjust as per your site)
        await page.waitForTimeout(5000);

        const newSrc = await bannerImage.getAttribute('src');
        expect(newSrc).not.toBe(initialSrc);
    });

    test('Bullet Indicator - Verify banner bullet indicators', async ({ page }) => {
        // All bullet dots
        const bullets = page.locator('div.absolute.bottom-3.flex.space-x-2 > div');

        // Check bullets count
        await expect(bullets).toHaveCount(5);

        // Check which bullet is active (white bg and scale-110)
        const activeBullet = page.locator('div.absolute.bottom-3.flex.space-x-2 > div.bg-white.scale-110');
        await expect(activeBullet).toHaveCount(1);

        // Click next arrow and verify active bullet changes
        const nextButton = page.locator('button[aria-label="Next Banner"]');
        await nextButton.click();
        await page.waitForTimeout(1000);

        const newActiveBullet = page.locator('div.absolute.bottom-3.flex.space-x-2 > div.bg-white.scale-110');
        await expect(newActiveBullet).toHaveCount(1);
    });

    test('Click Action - Validate clickable banner', async ({ page }) => {
        const bannerImage = page.locator('div.relative img[alt^="Banner"]');

        // Example: Click banner navigates to URL
        await bannerImage.click();

        // Wait for navigation and verify new URL (adjust expected URL)
        await page.waitForLoadState('networkidle');
        expect(page.url()).toContain('/product/?category_slugs=');
    });

    test('Text Alignment - Validate text positioning', async ({ page }) => {
        const banners = page.locator('div.relative.w-full');

        const count = await banners.count();
        for (let i = 0; i < count; i++) {
            const banner = banners.nth(i);
            const textLocator = banner.locator('text=Expected Banner Text');

            if (await textLocator.count() > 0) {
                const textAlign = await textLocator.evaluate(el => window.getComputedStyle(el).textAlign);
                expect(textAlign).toBe('center');
            }
        }
    });

    test.skip('Price Accuracy - Validate starting price displayed', async ({ page }) => {
        // Adjust page.goto if needed here

        const priceElement = page.locator('div.relative', { hasText: /Start at: ₹\d+/i });

        // Wait up to 10 seconds for element to appear, in case page is slow
        await expect(priceElement).toBeVisible({ timeout: 10000 });

        const priceText = await priceElement.textContent();
        expect(priceText).toMatch(/Start at: ₹\d+/);
    });

    test('Responsiveness - Validate banner responsiveness', async ({ page }) => {
        // Desktop viewport
        await page.setViewportSize({ width: 1200, height: 800 });
        const banner = page.locator('div.relative.w-full.flex.items-center.justify-center.rounded-lg.overflow-hidden');
        await expect(banner).toBeVisible();

        // Wait a bit or wait for an element state to stabilize
        await page.waitForTimeout(500);

        const desktopWidth = await banner.evaluate(el => el.clientWidth);

        // Mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Wait for possible layout changes on mobile
        await page.waitForTimeout(500);

        const mobileWidth = await banner.evaluate(el => el.clientWidth);

        console.log('desktopWidth:', desktopWidth, 'mobileWidth:', mobileWidth);

        // Now assert mobile width is less than desktop width
        expect(mobileWidth).toBeLessThan(desktopWidth);

        // Reset viewport size after test (for example, to 1200x800)
        await page.setViewportSize({ width: 1200, height: 800 });

    });

});