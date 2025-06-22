import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { loginAsAdmin } from '../../utils/test.helper';
import { createCategory, deleteCategoryByName, editCategoryByName, generateReadableName, navigateToCategoryPage, openCreateCategoryForm, submitCreateCategoryForm, validateCategoryPageContent, validateCategoryTableRows, validateCreateCategoryErrors, validateCreateCategoryForm } from '../../utils/category';

// Load JSON data once
const rawData = fs.readFileSync(path.join(__dirname, '../../fixtures', 'category-data.json'), 'utf-8');
const categoryData = JSON.parse(rawData);

test.describe('Admin Panel UI Tests', () => {
    test.beforeEach(async ({ page }) => {
        test.info().annotations.push({ type: 'tag', description: '@smoke' });
        await loginAsAdmin(page);
        await navigateToCategoryPage(page);
    });

    test('@smoke Category page UI validation', async ({ page }) => {
        await validateCategoryPageContent(page);
    });

    test('@smoke Category page table validation', async ({ page }) => {
        await validateCategoryPageContent(page);
        await validateCategoryTableRows(page);
    });

    test('@smoke Create Category UI form elements', async ({ page }) => {
        await validateCreateCategoryForm(page);
    });

    test('@smoke Create Category - Validation Errors', async ({ page }) => {
        await openCreateCategoryForm(page);
        await validateCreateCategoryErrors(page);

    });
    test('@smoke Cancel Create Category Form', async ({ page }) => {
        await openCreateCategoryForm(page);
        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(page.getByRole('heading', { name: 'Create Category' })).not.toBeVisible();
    });

    test('@smokes Create Category with readable dynamic name', async ({ page }) => {
        const { namePrefix, imagePath } = categoryData.validCategory;
        const categoryName = generateReadableName(namePrefix);
        const categorySlug = categoryName;
        await createCategory(page, categoryName, categorySlug, imagePath);
        await submitCreateCategoryForm(page);
        await expect(page.getByText('Created successfully')).toBeVisible();
        console.log(`✅ Created category: ${categoryName}`);
        await page.waitForTimeout(5000);
    });

    test('Create Category - Duplicate Name or Slug', async ({ page }) => {
        const { name, slug, imagePath } = categoryData.duplicateCategory;
        await createCategory(page, name, slug, imagePath);
        await page.getByRole('button', { name: 'Create', exact: true }).click();
        await expect(page.getByText('This category already exists')).toBeVisible();
    });

    test('Create, Edit and Delete Product with dynamic name', async ({ page }) => {
        const { namePrefix, imagePath } = categoryData.productCategory;
        const originalName = generateReadableName(namePrefix);
        const originalSlug = originalName;
        // Step 1: Create        
        await createCategory(page, originalName, originalSlug, imagePath);
        await submitCreateCategoryForm(page);
        await expect(page.getByText('Created successfully')).toBeVisible();
        console.log(`✅ Created product: ${originalName}`);
        await page.waitForTimeout(5000);

        // Step 2: Edit
        const updatedName = `${originalName}-updated`;
        await editCategoryByName(page, originalName, updatedName);
        await page.waitForTimeout(2000);

        await expect(page.getByText('Updated successfully')).toBeVisible();
        console.log(`✏️ Updated product to: ${updatedName}`);
        await page.waitForTimeout(5000);

        // Step 3: Delete
        await deleteCategoryByName(page, updatedName);
        await expect(page.getByText('Deleted successfully')).toBeVisible();
        console.log(`🗑️ Deleted product: ${updatedName}`);
    });
});
