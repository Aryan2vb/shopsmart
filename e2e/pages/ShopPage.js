class ShopPage {
  constructor(page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  async addToCart(index = 0) {
    await this.page.click(`text=Add to Cart >> nth=${index}`);
    await this.page.waitForTimeout(1000);
  }

  async openCart() {
    await this.page.locator('.cart-btn').click();
  }

  async getCartCount() {
    const text = await this.page.locator('.cart-btn').textContent();
    const match = text.match(/Cart \((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  }

  async removeFromCart() {
    await this.page.click('text=Remove');
    await this.page.waitForTimeout(1000);
  }

  async goBackToShop() {
    await this.page.click('text=Back to Shop');
  }

  getProductCards() {
    return this.page.locator('.product-card');
  }

  getCartItems() {
    return this.page.locator('.cart-item');
  }
}

module.exports = { ShopPage };
