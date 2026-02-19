const { test, expect } = require('@playwright/test');
const { ShopPage } = require('../pages/ShopPage');

test.describe('Cart', () => {
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

  test('should add item to cart', async ({ page }) => {
    await shopPage.addToCart(0);
    await expect(page.locator('.cart-btn')).toContainText('Cart (1)');
  });

  test('should view cart and see items', async ({ page }) => {
    await shopPage.addToCart(0);
    await shopPage.openCart();
    
    await expect(page.locator('text=Your Cart')).toBeVisible();
    await expect(shopPage.getCartItems()).toHaveCount(1);
    await expect(page.locator('text=Wireless Headphones')).toBeVisible();
  });

  test('should remove item from cart', async ({ page }) => {
    await shopPage.addToCart(0);
    await shopPage.openCart();
    await shopPage.removeFromCart();
    
    await expect(page.locator('text=Your cart is empty')).toBeVisible();
  });

  test('should calculate cart total correctly', async ({ page }) => {
    await shopPage.addToCart(0);
    await shopPage.addToCart(0);
    await shopPage.openCart();
    
    await expect(page.locator('text=Total: $159.98')).toBeVisible();
  });

  test('should navigate back to products from cart', async ({ page }) => {
    await shopPage.addToCart(0);
    await shopPage.openCart();
    await shopPage.goBackToShop();
    
    await expect(page.locator('text=Products')).toBeVisible();
    await expect(shopPage.getProductCards()).toHaveCount(6);
  });
});
