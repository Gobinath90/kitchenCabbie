import { Page, expect, test } from '@playwright/test';

const logPrefix = '[category.ts]';

/**
 * Navigates to the Category page and validates the page header and subtext.
 */
export const navigateToCategoryPage = async (page: Page) => {
  await test.step('Navigate to Category Page', async () => {
    console.log(`${logPrefix} Clicking on 'Category' in the sidebar...`);
    await page.getByRole('list').getByText('Category').click();
  });

  await test.step('Validate Category Page Header and Description', async () => {
    console.log(`${logPrefix} Validating heading and subtext on Category page...`);
    await expect(page.getByRole('heading', { name: 'Categories' })).toBeVisible();
    await expect(page.getByText('Manage your product categories')).toBeVisible();
  });
};

/**
 * Validates all expected column headers in the Category table.
 */
export const validateCategoryPageContent = async (page: Page) => {
  await test.step('Validate Category Table Column Headers', async () => {
    const columnHeaders = [
      'S.No', 'Image', 'Name', 'Slug', 'Status', 'Level', 'Parent',
      'Created By', 'Created At', 'Updated At', 'Actions'
    ];

    for (const header of columnHeaders) {
      console.log(`${logPrefix} Checking column header: ${header}`);
      await expect(page.getByText(header, { exact: true })).toBeVisible();
    }
  });
};

/**
 * Validates the data in each row of the Category table.
 * Logs the data for each row to the console.
 */
export const validateCategoryTableRows = async (page: Page) => {
  await test.step('Validate Category Table Row Data', async () => {
    const rows = page.locator('.grid.items-start.bg-white');
    const rowCount = await rows.count();
    console.log(`${logPrefix} Total Rows: ${rowCount}`);
    const columnDefinitions = [
      { label: 'S.No', selector: 'div', index: 0 },
      { label: 'Name', selector: 'div', index: 2 },
      { label: 'Slug', selector: 'div', index: 3 },
      { label: 'Status', selector: 'div span', index: 0 },
      { label: 'Level', selector: 'div', index: 5 },
      { label: 'Parent', selector: 'div', index: 6 },
      { label: 'Created By', selector: 'div', index: 7 },
      { label: 'Created At', selector: 'div', index: 8 },
      { label: 'Updated At', selector: 'div', index: 9 }
    ];

    for (let i = 0; i < rowCount; i++) {
      console.log(`\n${logPrefix} --- Row ${i + 1} ---`);
      const row = rows.nth(i);

      for (const { label, selector, index } of columnDefinitions) {
        const value = await row.locator(selector).nth(index).textContent();
        console.log(`${logPrefix} ${label}: ${value?.trim()}`);
      }
    }
  });
};

export const validateCreateCategoryForm = async (page: Page) => {

  await test.step('Validate Create Category Form UI Elements', async () => {
    console.log(`${logPrefix} Opening Create Category form...`);
    await page.getByRole('button', { name: '+ Create Category' }).click();

    await expect(page.getByRole('heading', { name: 'Create Category' })).toBeVisible();
    console.log(`${logPrefix} 'Create Category' heading is visible.`);

    const expectedLabels = ['Name', 'Slug', 'Level', 'Image', 'Order'];
    for (const label of expectedLabels) {
      console.log(`${logPrefix} Checking field: ${label}`);
      await expect(page.locator('label').filter({ hasText: label })).toBeVisible();
    }

    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create', exact: true })).toBeVisible();
    console.log(`${logPrefix} Action buttons 'Cancel' and 'Create' are visible.`);
  });
};

export const createCategory = async ( page: Page, name: string, slug: string, imagePath: string[]) => {

  await openCreateCategoryForm(page);
  await selectImageThroughFileManager(page, imagePath);
  await test.step('Fill Category Form', async () => {
    console.log(`${logPrefix} Filling name: ${name}`);
    await page.getByRole('textbox', { name: 'Category Name' }).fill(name);
    console.log(`${logPrefix} Filling slug: ${slug}`);
    await page.getByRole('textbox', { name: 'Slug' }).fill(slug);
    await expect(page.getByPlaceholder('Enter order number')).toBeVisible();
  });
};

export const selectImageThroughFileManager = async ( page: Page, pathSegments: string[] ) => {

  await test.step('Select image via file manager', async () => {
    await page.getByRole('button', { name: 'Browse Image' }).click();

    for (const segment of pathSegments) {
      console.log(`${logPrefix} Clicking folder/file: ${segment}`);
      await page.getByText(segment, { exact: true }).click();
    }

    await page.getByRole('button', { name: /^Open \(\d+\)$/ }).click();
    console.log(`${logPrefix} Image selected and opened.`);
  });
};

export const openCreateCategoryForm = async (page: Page) => {
  await test.step('Open Create Category Form', async () => {
    await page.getByRole('button', { name: '+ Create Category' }).click();
  });
};

export const submitCreateCategoryForm = async (page: Page) => {
  await test.step('Submit Create Category Form', async () => {
    await page.getByRole('button', { name: 'Create', exact: true }).click();
  });
};

export const validateCreateCategoryErrors = async (page: Page) => {
  console.log(`${logPrefix} Navigating to Create Category form...`);

  await test.step('Submit form with all fields empty', async () => {
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await expect(page.getByText('Name is required.')).toBeVisible();
  });

  await test.step('Fill only name and submit', async () => {
    await page.getByRole('textbox', { name: 'Category Name' }).fill('Chicken');
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await expect(page.getByText('Slug is required.')).toBeVisible();
  });

  await test.step('Fill name and slug, but no image, and submit', async () => {
    await page.getByRole('textbox', { name: 'Slug' }).fill('chicken-a');
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await expect(page.getByText(/image is not allowed to be/i)).toBeVisible();
  });
};





/**
 * Generates a readable category name like "chicken-jun-sat-ab"
 */
function randomAlpha(length: number): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
}

export function generateReadableName(base: string): string {
  const randomPart = randomAlpha(6).toUpperCase(); // 6-letter random string
  return `${base}-${randomPart}`;    // e.g., chicken-xdfqzm
}



export async function editCategoryByName(page: Page, categoryName: string, newSlug: string) {
  const rows = page.locator('.grid.items-start.bg-white');
  const rowCount = await rows.count();
  let found = false;

  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const name = await row.locator('div').nth(2).textContent();

    if (name?.trim() === categoryName) {
      console.log(`[Edit] Found row with name: ${categoryName}`);
      const editButton = row.locator('button[title="Edit"]');
      await editButton.click();
      await page.waitForTimeout(2000);

      await page.getByRole('textbox', { name: 'Category Name' }).fill(newSlug);
      await page.getByRole('button', { name: 'Update' }).click();

      await expect(page.getByText(newSlug)).toBeVisible();
      found = true;
      break;
    }
  }

  expect(found).toBeTruthy();
}

export async function deleteCategoryByName(page: Page, categoryName: string) {
  const rows = page.locator('.grid.items-start.bg-white');
  const rowCount = await rows.count();
  let found = false;

  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const name = await row.locator('div').nth(2).textContent();

    if (name?.trim() === categoryName) {
      console.log(`[Delete] Found row with name: ${categoryName}`);
      const deleteButton = row.locator('button[title="Delete"]');
      await deleteButton.click();
      await page.waitForTimeout(2000);

      // Add confirmation modal handling here if needed
      await page.locator("//button[normalize-space(text())='Delete']").click();

      // Expect category is no longer visible
      await expect(page.getByText(categoryName)).not.toBeVisible();
      found = true;
      break;
    }
  }

  expect(found).toBeTruthy();
}
