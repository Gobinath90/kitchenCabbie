import { test, expect, Page } from '@playwright/test';

async function getDealCards(page: Page) {
    return page.locator('div.grid > div.bg-white.shadow-lg.inset-shadow-2xs.rounded-xl.flex');
}

async function waitForDealsSection(page: Page) {
    await page.goto('https://dev.kitchencab.in/home');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const dealsSection = page.locator('div.grid.grid-cols-1.md\\:grid-cols-2.gap-8');
    await expect(dealsSection).toBeVisible();
    await dealsSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
}

test.describe('Featured Deals Section', () => {

    test.beforeEach(async ({ }, testInfo) => {
        console.log(`\n🔷 Starting test: "${testInfo.title}"`);
    });
    test.afterEach(async ({ }, testInfo) => {
        const status = testInfo.status || 'unknown';
        console.log(`🔶 Finished test: "${testInfo.title}" with status: ${status}\n`);
    });

    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await waitForDealsSection(page);
    });

    test.afterEach(async ({ context }) => {
        await context.close();
    });

    test('Section Display - Verify the Featured Deals section is visible', async ({ page }) => {
        const dealsSection = page.locator('div.grid.grid-cols-1.md\\:grid-cols-2.gap-8');
        await expect(dealsSection).toBeVisible();
        const count = await dealsSection.locator('> div').count();
        expect(count).toBeGreaterThan(0);
        console.log(`✅ Featured Deals section visible with ${count} deal cards`);
    });

    test('Deal Cards Display - Verify all deal cards are displayed', async ({ page }) => {
        const dealCards = await getDealCards(page);
        const count = await dealCards.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
            await expect(dealCards.nth(i)).toBeVisible();
            console.log(`🃏 Deal card ${i + 1} is visible`);
        }
    });

    test('Image Display - Validate the deal card images', async ({ page }) => {
        const dealCards = await getDealCards(page);
        const count = await dealCards.count();

        for (let i = 0; i < count; i++) {
            const img = dealCards.nth(i).locator('img');
            await expect(img).toBeVisible();

            const src = await img.getAttribute('src');
            expect(src).toBeTruthy();
            expect(src?.startsWith('http')).toBeTruthy();

            const alt = await img.getAttribute('alt');
            expect(alt).toBeTruthy();
            console.log(`🖼️ Deal ${i + 1} image src: ${src}, alt: ${alt}`);

            // Check image resolution >= 100x100 (optional)
            const { width, height } = await img.evaluate((el: HTMLImageElement) => ({
                width: el.naturalWidth,
                height: el.naturalHeight,
            }));
            expect(width).toBeGreaterThanOrEqual(100);
            expect(height).toBeGreaterThanOrEqual(100);
        }
    });

    test('Deal Labels - Validate product labels', async ({ page }) => {
        const dealCards = await getDealCards(page);
        const count = await dealCards.count();

        for (let i = 0; i < count; i++) {
            const labels = dealCards.nth(i).locator('div.flex.space-x-2 > span');
            const labelCount = await labels.count();

            for (let j = 0; j < labelCount; j++) {
                const labelText = (await labels.nth(j).textContent())?.trim() || '';
                expect(labelText.length).toBeGreaterThan(0);
                console.log(`🏷️ Deal ${i + 1} label ${j + 1}: "${labelText}"`);
            }
        }
    });

    test('Deal Description - Verify deal descriptions', async ({ page }) => {
        const dealCards = await getDealCards(page);
        const count = await dealCards.count();

        for (let i = 0; i < count; i++) {
            const descriptions = dealCards.nth(i).locator('div.mt-3.text-gray-700 > ul > li');
            const descCount = await descriptions.count();
            expect(descCount).toBeGreaterThan(0);

            for (let j = 0; j < descCount; j++) {
                const descText = (await descriptions.nth(j).textContent())?.trim() || '';
                expect(descText.length).toBeGreaterThan(0);
                console.log(`📝 Deal ${i + 1} description ${j + 1}: "${descText}"`);
            }
        }
    });

    test('Explore Button - Validate Explore button functionality', async ({ page }) => {
        const dealCards = await getDealCards(page);
        const count = await dealCards.count();

        for (let i = 0; i < count; i++) {
            const exploreBtn = dealCards.nth(i).locator('button:has-text("Explore")');
            await expect(exploreBtn).toBeVisible();
            await expect(exploreBtn).toBeEnabled();
            console.log(`🔘 Deal ${i + 1} "Explore" button is visible and enabled`);
        }
    });

    test.skip('Price Consistency - Verify price and unit accuracy in descriptions', async ({ page }) => {
        const dealCards = await getDealCards(page);
        const count = await dealCards.count();

        const priceOnlyPattern = /₹\d{1,}(,\d{3})*(\.\d{1,2})?/;

        for (let i = 0; i < count; i++) {
            const descriptions = dealCards.nth(i).locator('div.mt-3.text-gray-700 > ul > li');
            const descCount = await descriptions.count();

            for (let j = 0; j < descCount; j++) {
                const descText = (await descriptions.nth(j).textContent())?.trim() || '';
                expect(descText.length).toBeGreaterThan(0);

                // Check if price substring exists anywhere in the text
                expect(descText.match(priceOnlyPattern)).not.toBeNull();

                console.log(`💵 Deal ${i + 1} price info ${j + 1}: "${descText}"`);
            }
        }
    });

    test('UI Alignment - Check layout and alignment', async ({ page }) => {
        const dealCards = await getDealCards(page);
        const count = await dealCards.count();

        for (let i = 0; i < count; i++) {
            const card = dealCards.nth(i);

            const titleBox = await card.locator('h3').boundingBox();
            const exploreBtnBox = await card.locator('button:has-text("Explore")').boundingBox();

            expect(titleBox).not.toBeNull();
            expect(exploreBtnBox).not.toBeNull();

            // Check horizontal alignment (x axis) within ~20px tolerance
            expect(Math.abs(titleBox!.x - exploreBtnBox!.x)).toBeLessThan(20);
            console.log(`🧩 Deal ${i + 1} title and Explore button roughly aligned horizontally`);
        }
    });

    test('Responsiveness - Validate display on Desktop and Mobile devices', async ({ page }) => {
        const dealsSectionSelector = 'div.grid.grid-cols-1.md\\:grid-cols-2.gap-8';

        // Desktop viewport test
        await page.setViewportSize({ width: 1280, height: 800 });
        let dealsSection = page.locator(dealsSectionSelector);
        await expect(dealsSection).toBeVisible();

        let columnsDesktop = await dealsSection.evaluate(el => window.getComputedStyle(el).gridTemplateColumns);
        console.log(`Desktop grid columns: ${columnsDesktop}`);
        expect(columnsDesktop.split(' ').length).toBeGreaterThan(1); // should be multiple columns

        // Mobile viewport test
        await page.setViewportSize({ width: 375, height: 667 });
        dealsSection = page.locator(dealsSectionSelector);
        await expect(dealsSection).toBeVisible();

        let columnsMobile = await dealsSection.evaluate(el => window.getComputedStyle(el).gridTemplateColumns);
        console.log(`Mobile grid columns: ${columnsMobile}`);
        expect(columnsMobile.split(' ').length).toBe(1); // should be single column
    });

    test.skip('Text Formatting - Validate text styling', async ({ page }) => {
        const dealCards = await getDealCards(page);
        const count = await dealCards.count();

        for (let i = 0; i < count; i++) {
            const title = dealCards.nth(i).locator('h3');

            const fontWeight = await title.evaluate(el => getComputedStyle(el).fontWeight);
            expect(['700', 'bold'].includes(fontWeight)).toBeTruthy();

            const fontFamily = await title.evaluate(el => getComputedStyle(el).fontFamily.toLowerCase());
            expect(fontFamily).toContain('bold');

            const labels = dealCards.nth(i).locator('div.flex.space-x-2 > span');
            const labelCount = await labels.count();

            // Regex to allow spaces and case-insensitive match for color functions
            const colorPattern = /^\s*(rgba?|hsla?|oklch)\s*\(.*\)\s*$/i;

            for (let j = 0; j < labelCount; j++) {
                const label = labels.nth(j);

                const fontSize = await label.evaluate(el => getComputedStyle(el).fontSize);
                const fontSizeNum = parseFloat(fontSize);
                expect(fontSizeNum).toBeGreaterThanOrEqual(10);
                expect(fontSizeNum).toBeLessThanOrEqual(14);

                const bgColor = await label.evaluate(el => getComputedStyle(el).backgroundColor);
                const textColor = await label.evaluate(el => getComputedStyle(el).color);

                console.log(`Label ${j + 1} bgColor: "${bgColor}"`);
                console.log(`Label ${j + 1} textColor: "${textColor}"`);

                expect(colorPattern.test(bgColor)).toBeTruthy();
                expect(colorPattern.test(textColor)).toBeTruthy();
            }
        }
    });



});
