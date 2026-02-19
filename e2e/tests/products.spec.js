const { test, expect } = require('@playwright/test');
const { ShopPage } = require('../pages/ShopPage');

test.describe('Products', () => {
  let shopPage;

  test.beforeAll(async () => {
    await fetch('http://localhost:3000/api/cart').then(r => r.json())
      .then(data => Promise.all(data.cart.map(item => 
        fetch(`http://localhost:3000/api/cart/${item.id}`, { method: 'DELETE' })
      )));
  });

  test.beforeEach(async ({ page }) => {
    shopPage = new ShopPage(page);
    await shopPage.goto();
  });

  test('should load products page', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('ShopSmart');
    await expect(page.locator('text=Products')).toBeVisible();
  });

  test('should display all products', async ({ page }) => {
    await expect(shopPage.getProductCards()).toHaveCount(6);
    await expect(page.locator('text=Wireless Headphones')).toBeVisible();
    await expect(page.locator('text=$79.99')).toBeVisible();
  });
});
