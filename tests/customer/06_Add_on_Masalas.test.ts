import { test, expect, Page } from '@playwright/test';

async function waitForDealsSection(page: Page) {
    await page.goto('https://dev.kitchencab.in/home');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // You can optimize this later
}

test.describe('Add on Masalas Section', () => {

    test.beforeEach(async ({ page }, testInfo) => {
        console.log(`\n🔷 Starting test: "${testInfo.title}"`);
        await page.setViewportSize({ width: 1280, height: 800 });
        await waitForDealsSection(page);
    });

    test.afterEach(async ({ context }, testInfo) => {
        const status = testInfo.status || 'unknown';
        console.log(`🔶 Finished test: "${testInfo.title}" with status: ${status}\n`);
        await context.close();
    });

    test('Section Display - Verify Add on Masalas section', async ({ page }) => {
        const sectionTitle = page.locator('h2', { hasText: 'Add on Masalas' });
        await sectionTitle.scrollIntoViewIfNeeded();
        await page.waitForTimeout(2000); // Wait for section to be visible
        await expect(sectionTitle).toBeVisible();
    });

    test('Product Display - Verify masala product cards', async ({ page }) => {

        const cards = page.locator("//h2[text()='Add on Masalas']/following-sibling::div");
        await cards.first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(2000);
        const count = await cards.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Product Image - Validate image loading', async ({ page }) => {
        const images = page.locator('img[alt$="Powder"], img[alt$="Masala"], img[alt*="Briyani"]');
        const count = await images.count();
        console.log(`Found ${count} images matching criteria`);

        for (let i = 0; i < count; i++) {
            const img = images.nth(i);
            await img.scrollIntoViewIfNeeded();

            // Log alt attribute
            const altText = await img.getAttribute('alt');
            console.log(`Image #${i + 1} alt: "${altText}"`);
            await page.waitForTimeout(1000); // Wait for image to load
            await expect(img).toBeVisible();

            const src = await img.getAttribute('src');
            console.log(`Image #${i + 1} src: ${src}`);
            expect(src).toContain('https://kc-dev-s3-org');
        }
    });


    test('Price Display - Validate format', async ({ page }) => {
        const prices = page.locator('span.text-base.font-family-bold');
        const count = await prices.count();
        console.log(`Found ${count} prices`);
        for (let i = 0; i < count; i++) {
            const price = prices.nth(i);
            await price.scrollIntoViewIfNeeded();
            const priceText = await price.innerText();
            console.log(`Price #${i + 1}: "${priceText}"`);
            expect(priceText).toMatch(/^₹\d+$/);
            await page.waitForTimeout(1000); // Wait for price to be visible
        }
    });


    test('Add to Cart Button - Verify existence and label', async ({ page }) => {
        const cards = page.locator("//h2[text()='Add on Masalas']/following-sibling::div");
        await cards.first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(2000);

        const buttons = page.locator('button', { hasText: 'Add to Cart' });
        const count = await buttons.count();
        expect(count).toBeGreaterThan(0);
        await expect(buttons.first()).toBeEnabled();
    });

    test('Carousel Navigation - Validate arrow button scroll', async ({ page }) => {
        const cards = page.locator("//h2[text()='Add on Masalas']/following-sibling::div");
        await cards.first().scrollIntoViewIfNeeded();

        const rightArrow = page.locator("//h2[text()='Add on Masalas']/following-sibling::div//button[2]");
        await expect(rightArrow).toBeVisible();
        await rightArrow.click();

    });

    test('Discount Accuracy - Validate discount calculation', async ({ page }) => {
        const cards = page.locator("//h2[text()='Add on Masalas']/following-sibling::div//div[contains(@class,'min-w-[200px]')]");
        await cards.first().scrollIntoViewIfNeeded();
        const count = await cards.count();
        console.log(`Found ${count} product cards under Add on Masalas`);
      
        for (let i = 0; i < count; i++) {
          const card = cards.nth(i);
          await card.scrollIntoViewIfNeeded();
      
          const originalText = await card.locator('span.line-through').innerText().catch(() => '');
          const actualText = await card.locator('span.font-family-bold').innerText().catch(() => '');
          // Improved discount selector — span containing "off"
          const discountText = await card.locator('span', { hasText: 'off' }).innerText().catch(() => '');
      
          console.log(`Card #${i + 1}: Original: "${originalText}", Actual: "${actualText}", Discount: "${discountText}"`);
      
          const original = parseFloat(originalText.replace(/[^\d.]/g, '')) || 0;
          const actual = parseFloat(actualText.replace(/[^\d.]/g, '')) || 0;
          const discount = parseInt(discountText.replace(/[^\d]/g, '')) || 0;
      
          if (original && actual && original !== actual) {
            const calculated = Math.round(((original - actual) / original) * 100);
            console.log(`Calculated discount: ${calculated}%`);
            expect(discount).toBe(calculated);
          } else {
            expect(discount).toBe(0);
          }
        }
      });
      
      
    test('UI Alignment - Product cards consistent width', async ({ page }) => {
        const card = page.locator("//h2[text()='Add on Masalas']/following-sibling::div");
        await card.scrollIntoViewIfNeeded();
        const box = await card.boundingBox();
        expect(box?.width).toBeGreaterThan(190);
        await page.waitForTimeout(2000); 
    });

    test('Product Description - Validate name and weight', async ({ page }) => {
        const cards = page.locator("//h2[text()='Add on Masalas']/following-sibling::div//div//div//div//div[2]");
        const count = await cards.count();
        console.log(`Found ${count} product cards under Add on Masalas`);
        
        for (let i = 0; i < count; i++) {
            const card = cards.nth(i);
            await card.scrollIntoViewIfNeeded();
    
            const name = await card.locator('h3').innerText();
            const desc = await card.locator('p').nth(0).innerText();
            console.log(`Card #${i + 1} - Name: "${name}", Description: "${desc}"`);
    
            expect(name.trim().length).toBeGreaterThan(0);
            expect(desc).toMatch(/\|\s?\d+(g|kg)$/i);
            await page.waitForTimeout(1000); 
        }
    });
    

    test('Responsiveness - Display on mobile and desktop', async ({ page }) => {
        // Mobile view
        await page.setViewportSize({ width: 390, height: 844 });
        const cardsMobile = page.locator("//h2[text()='Add on Masalas']/following-sibling::div");
        await cardsMobile.first().scrollIntoViewIfNeeded();
        await expect(cardsMobile.first()).toBeVisible();

        // Desktop view
        await page.setViewportSize({ width: 1280, height: 800 });
        const cardsDesktop = page.locator("//h2[text()='Add on Masalas']/following-sibling::div");
        await cardsDesktop.first().scrollIntoViewIfNeeded();
        await expect(cardsDesktop.first()).toBeVisible();
    });

});
