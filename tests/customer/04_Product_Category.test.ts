import { test, expect, Page } from '@playwright/test';

// Helper functions
async function getCategoryTabs(page: Page) {
    const tabContainer = page.locator('div.flex.overflow-x-auto');
    return tabContainer.locator('button');
}

async function getProductCards(page: Page) {
    return page.locator('div[class*="min-w-\\[300px\\]"]');
}

async function waitForPageReady(page: Page) {
    await page.goto('https://dev.kitchencab.in/home');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Scroll to category tab container before tests
    const element = page.locator('div.flex.overflow-x-auto').first();
    await element.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
}

test.describe('Product Category Functionality', () => {

    // --- Logging Hooks ---
    test.beforeEach(async ({ }, testInfo) => {
        console.log(`\n🔷 Starting test: "${testInfo.title}"`);
    });

    test.afterEach(async ({ }, testInfo) => {
        const status = testInfo.status || 'unknown';
        console.log(`🔶 Finished test: "${testInfo.title}" with status: ${status}\n`);
    });
    test.beforeEach(async ({ page }) => {
        // Reset viewport to default desktop before each test
        await page.setViewportSize({ width: 1280, height: 800 });
        await waitForPageReady(page);

    });

    // Close context after each test to clear state and close browser page
    test.afterEach(async ({ context }) => {
        await context.close();
    });

    test('Product Category Tabs - Verify all product category tabs are displayed', async ({ page }) => {
        const tabButtons = await getCategoryTabs(page);
        const count = await tabButtons.count();
        console.log(`🔢 Found ${count} buttons inside category tab container`);

        const validTabs: string[] = [];

        for (let i = 0; i < count; i++) {
            const btn = tabButtons.nth(i);
            const label = (await btn.textContent())?.trim() || '';
            if (!['Add Item', 'Add to Cart'].includes(label)) {
                console.log(`📦 Tab ${validTabs.length + 1}: ${label}`);
                validTabs.push(label);
                expect(label.length).toBeGreaterThan(0);
            }
        }

        expect(validTabs.length).toBeGreaterThan(0);
        console.log(`✅ Validated ${validTabs.length} product category tabs`);
    });

    test('Tab Navigation - Validate category tab switching', async ({ page }) => {
        const tabs = await getCategoryTabs(page);
        const count = await tabs.count();
        expect(count).toBeGreaterThan(0);

        // Gather all valid tabs first with their indices
        const validTabs: { index: number; label: string }[] = [];

        for (let i = 0; i < count; i++) {
            const tab = tabs.nth(i);
            const label = (await tab.textContent())?.trim() || '';
            if (!['Add Item', 'Add to Cart'].includes(label) && label.length > 0) {
                validTabs.push({ index: i, label });
            }
        }

        expect(validTabs.length).toBeGreaterThan(0);
        console.log(`✅ Found ${validTabs.length} valid category tabs`);

        for (const { index, label } of validTabs) {
            await test.step(`Clicking tab "${label}"`, async () => {
                console.log(`➡️ Clicking tab at index ${index} with label "${label}"`);
                const tab = tabs.nth(index);
                await tab.click();
                await page.waitForTimeout(2000);
                await page.waitForSelector('div[class*="min-w-\\[300px\\]"]', { state: 'visible' });
                console.log(`     ✅ Tab "${label}" clicked and products visible`);
            });
        }
    });


    test('Product Display - Verify product card information', async ({ page }) => {
        const productCards = await getProductCards(page);
        const count = await productCards.count();
        console.log(`🧩 Found ${count} product cards`);
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
            const card = productCards.nth(i);

            const image = card.locator('img');
            await expect(image).toBeVisible();
            const src = await image.getAttribute('src');
            console.log(`🖼️ Image ${i + 1}: ${src}`);
            expect(src).toMatch(/^https?:\/\//);

            const title = (await card.locator('h3').textContent())?.trim() || '';
            console.log(`📦 Product Title ${i + 1}: ${title}`);
            expect(title.length).toBeGreaterThan(0);

            const desc = (await card.locator('p').nth(0).textContent())?.trim() || '';
            console.log(`📝 Description ${i + 1}: ${desc}`);
            expect(desc.length).toBeGreaterThan(0);

            const price = (await card.locator('span.text-lg').textContent())?.trim() || '';
            console.log(`💰 Price ${i + 1}: ${price}`);
            expect(price).toMatch(/₹\d+/);

            const addButton = card.locator('button:has-text("Add Item")');
            await expect(addButton).toBeVisible();
            console.log(`✅ "Add Item" button found for product ${i + 1}`);
        }
    });

    test('Product Image - Verify product image loading', async ({ page }) => {
        const productImages = (await getProductCards(page)).locator('img');
        const count = await productImages.count();

        console.log(`🖼️ Found ${count} product images to verify\n`);
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
            const img = productImages.nth(i);
            await expect(img).toBeVisible();

            const src = await img.getAttribute('src');
            console.log(`🔹 Image ${i + 1}: ${src}`);

            expect(src).toBeTruthy();
            expect(src?.startsWith('http')).toBeTruthy();

            const { width, height } = await img.evaluate((el: HTMLImageElement) => ({
                width: el.naturalWidth,
                height: el.naturalHeight,
            }));

            console.log(`📏 Image ${i + 1} resolution: ${width}x${height}`);
            expect(width).toBeGreaterThanOrEqual(100);
            expect(height).toBeGreaterThanOrEqual(100);
        }

        console.log(`✅ All ${count} product images are loaded and valid.\n`);
    });

    test('Discount Calculation - Validate discount percentage', async ({ page }) => {
        const productCards = await getProductCards(page);
        const count = await productCards.count();
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
            const card = productCards.nth(i);

            const priceText = await card.locator('span.text-lg.font-bold').textContent();
            const originalPriceText = await card.locator('span.line-through').textContent();
            const discountText = await card.locator('span.text-\\[\\#3c8031\\]').textContent();

            if (!priceText || !originalPriceText || !discountText) {
                console.warn(`Skipping product card ${i + 1} due to missing price or discount info`);
                continue;
            }

            const price = parseFloat(priceText.replace(/[^\d\.]/g, ''));
            const originalPrice = parseFloat(originalPriceText.replace(/[^\d\.]/g, ''));
            const discountPercent = parseFloat(discountText.replace(/[^\d\.]/g, ''));

            const expectedDiscount = Math.round(((originalPrice - price) / originalPrice) * 100);

            console.log(`Product ${i + 1} - Price: ${price}, Original: ${originalPrice}, Displayed Discount: ${discountPercent}%, Calculated: ${expectedDiscount}%`);

            expect(discountPercent).toBeCloseTo(expectedDiscount, 0);
        }
    });

    test('Add Item Button - Verify Add Item button functionality', async ({ page }) => {
        const addItemButtons = page.locator('button:has-text("Add Item")');
        const count = await addItemButtons.count();
        expect(count).toBeGreaterThan(0);

        const firstButton = addItemButtons.first();
        await expect(firstButton).toBeEnabled();
        await firstButton.click();

        const signUpModal = page.locator('div.relative.overflow-hidden.rounded-lg.bg-white.shadow-xl');
        await expect(signUpModal).toBeVisible({ timeout: 5000 });

        await expect(signUpModal.locator('h2:text("Sign Up / Log In")')).toBeVisible();
        await expect(signUpModal.locator('input#mobileNumber')).toBeVisible();
        await expect(signUpModal.locator('button:has-text("Continue")')).toBeVisible();
        await expect(signUpModal.locator('button:has-text("Skip")')).toBeVisible();

        const modalHeader = await signUpModal.locator('h1').textContent();
        expect(modalHeader).toContain('Kitchen Cabbie');
    });

    test('Price Display - Verify price format', async ({ page }) => {
        await page.locator("//button[normalize-space(text())='Bones']").click();
        await page.waitForTimeout(3000);

        const priceSpans = page.locator('span.text-lg.font-bold');
        const count = await priceSpans.count();
        expect(count).toBeGreaterThan(0);

        const priceRegex = /^₹\d{1,}(,\d{3})*(\.\d{1,2})?$/;

        for (let i = 0; i < count; i++) {
            const priceText = (await priceSpans.nth(i).textContent())?.trim() || '';
            console.log(`Checking price ${i + 1}: ${priceText}`);
            expect(priceRegex.test(priceText)).toBeTruthy();
        }
    });

    test('UI Alignment - Check layout and alignment', async ({ page }) => {
        const productCards = await getProductCards(page);
        const count = await productCards.count();
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
            const card = productCards.nth(i);
            const titleBox = await card.locator('h3').boundingBox();
            const priceBox = await card.locator('span.text-lg.font-bold').boundingBox();

            expect(titleBox).not.toBeNull();
            expect(priceBox).not.toBeNull();

            // Titles and prices should be roughly vertically aligned
            expect(Math.abs((titleBox!.x) - (priceBox!.x))).toBeLessThan(10);
        }
    });

    test('Active Tab Indicator - Validate first tab is active by default', async ({ page }) => {
        const tabs = await getCategoryTabs(page);
        const tabCount = await tabs.count();
        expect(tabCount).toBeGreaterThan(0);

        const firstTab = tabs.first();
        const firstTabClasses = await firstTab.evaluate(node => node.className);

        console.log('First tab classes:', firstTabClasses);

        expect(firstTabClasses.includes('border-green-500')).toBe(true);

        for (let i = 1; i < tabCount; i++) {
            const otherTab = tabs.nth(i);
            const otherTabClasses = await otherTab.evaluate(node => node.className);
            expect(otherTabClasses.includes('border-green-500')).toBe(false);
        }
    });

    test('Responsiveness - Validate display on Desktop and Mobile devices', async ({ page }) => {
        // Desktop viewport test
        await page.setViewportSize({ width: 1280, height: 800 });
        console.log('Testing responsiveness on: Desktop (1280x800)');
        let mainContainer = page.locator('div.flex.overflow-x-auto').first();
        await expect(mainContainer).toBeVisible();
        let hasHorizontalScroll = await mainContainer.evaluate(el => el.scrollWidth > el.clientWidth);
        expect(hasHorizontalScroll).toBe(false);

        // Mobile viewport test
        await page.setViewportSize({ width: 375, height: 667 });
        console.log('Testing responsiveness on: Mobile (375x667)');
        mainContainer = page.locator('div.flex.overflow-x-auto').first();
        await expect(mainContainer).toBeVisible();
        hasHorizontalScroll = await mainContainer.evaluate(el => el.scrollWidth > el.clientWidth);
        expect(hasHorizontalScroll).toBe(true);
    });
});



