import { expect, Locator, Page } from "@playwright/test";

export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly inventoryList: Locator;
  readonly cartLink: Locator;
  readonly firstItem: Locator;
  readonly addToCartButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.locator(".title");
    this.inventoryList = page.locator(".inventory_list");
    this.cartLink = page.locator(".shopping_cart_link");
    this.firstItem = page.locator(".inventory_item_name").first();
    this.addToCartButtons = page.locator(".btn_inventory");
  }

  async expectInventoryPageLoaded() {
    await expect(this.page).toHaveURL(/.*\/inventory.html/);
    await expect(this.title).toHaveText("Products");
    await expect(this.inventoryList).toBeVisible();
  }

  async sortByPriceLowToHigh() {
    await this.page.locator(".product_sort_container").selectOption("lohi");
    await expect(this.page.locator(".product_sort_container")).toHaveValue(
      "lohi",
    );
  }

  async addProductAt(index: number) {
    const buttons = this.page.locator(".inventory_item .btn_inventory");
    await buttons.nth(index).click();
    await expect(this.page.locator(".shopping_cart_badge")).toBeVisible();
  }

  async addFirstTwoItemsToCart() {
    await this.addProductAt(0);
    await this.addProductAt(1);
    await expect(this.page.locator(".shopping_cart_badge")).toHaveText("2");
  }

  async getInventoryItemNames() {
    return this.page
      .locator(".inventory_item .inventory_item_name")
      .allTextContents();
  }

  async getInventoryPrices() {
    return this.page
      .locator(".inventory_item .inventory_item_price")
      .allTextContents();
  }

  async findMostExpensiveIndex() {
    const prices = await this.getInventoryPrices();
    let highestIndex = 0;
    let highestPrice = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < prices.length; i++) {
      const value = Number((prices[i] ?? "$0").replace(/[$,]/g, ""));
      if (value > highestPrice) {
        highestPrice = value;
        highestIndex = i;
      }
    }

    return highestIndex;
  }

  async openMostExpensiveProduct() {
    const items = this.page.locator(".inventory_item");
    const highestIndex = await this.findMostExpensiveIndex();

    await items.nth(highestIndex).locator(".inventory_item_name").click();
    await expect(
      this.page.locator(".inventory_details_container"),
    ).toBeVisible();
  }

  async addCurrentProductToCart() {
    const addToCartButton = this.page.locator('[data-test="add-to-cart"]');
    await addToCartButton.click();
    await expect(this.page.locator(".shopping_cart_badge")).toHaveText("1");
  }

  async backToProducts() {
    await this.page.locator('[data-test="back-to-products"]').click();
    await this.expectInventoryPageLoaded();
  }

  async openCart() {
    await this.cartLink.click();
    await expect(this.page).toHaveURL(/.*\/cart.html/);
    await expect(this.page.locator(".cart_contents_container")).toBeVisible();
  }

  async removeFirstCartItem() {
    const cartItems = this.page.locator(".cart_item");
    await this.page.locator('[data-test^="remove-"]').first().click();
    await expect(cartItems).toHaveCount(1);
  }

  async assertEmptyCart() {
    await expect(this.page.locator(".shopping_cart_badge")).toHaveCount(0);
    await expect(this.page.locator(".shopping_cart_link")).toHaveAttribute(
      "aria-label",
      "Cart, empty",
    );
  }
}
