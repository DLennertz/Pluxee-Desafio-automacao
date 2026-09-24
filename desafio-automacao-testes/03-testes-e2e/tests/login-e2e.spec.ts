import { test, expect, type Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { InventoryPage } from "../pages/InventoryPage";

function parseCurrency(value: string | null): number {
  const matches = (value ?? "0").match(/-?\d+(?:,\d{3})*(?:\.\d+)?/g) ?? [];
  if (matches.length === 0) {
    return 0;
  }

  const lastMatch = matches[matches.length - 1];
  return Number(lastMatch.replace(/,/g, ""));
}

async function getCartItems(
  page: Page,
): Promise<Array<{ name: string; price: number }>> {
  const names = await page
    .locator(".cart_item .inventory_item_name")
    .allTextContents();
  const prices = await page
    .locator(".cart_item .inventory_item_price")
    .allTextContents();

  return names.map((name, index) => ({
    name: name.trim(),
    price: Number((prices[index] ?? "$0").replace(/[$,]/g, "")),
  }));
}

async function completeCheckout(
  page: Page,
  expectedItems: Array<{ name: string; price: number }>,
) {
  await page.locator('[data-test="firstName"]').fill("Maria");
  await page.locator('[data-test="lastName"]').fill("Silva");
  await page.locator('[data-test="postalCode"]').fill("12345-678");
  await page.locator('[data-test="continue"]').click();

  await expect(page).toHaveURL(/.*\/checkout-step-two.html/);
  await expect(page.locator(".summary_info")).toBeVisible();
  await expect(page.locator(".summary_total_label")).toContainText("Total");

  const subtotalText = await page
    .locator(".summary_subtotal_label")
    .textContent();
  const taxText = await page.locator(".summary_tax_label").textContent();
  const totalText = await page.locator(".summary_total_label").textContent();
  const cartItemNames = await page
    .locator(".cart_item .inventory_item_name")
    .allTextContents();

  const expectedSubtotal = expectedItems.reduce(
    (sum, item) => sum + item.price,
    0,
  );
  const subtotalValue = parseCurrency(subtotalText);
  const taxValue = parseCurrency(taxText);
  const totalValue = parseCurrency(totalText);

  expect(subtotalValue).toBeCloseTo(expectedSubtotal, 2);
  expect(taxValue).toBeGreaterThan(0);
  expect(totalValue).toBeCloseTo(subtotalValue + taxValue, 2);
  expect(cartItemNames).toEqual(expectedItems.map((item) => item.name));

  await page.locator('[data-test="finish"]').click();

  await expect(page).toHaveURL(/.*\/checkout-complete.html/);
  await expect(page.locator(".complete-header")).toHaveText(
    "Thank you for your order!",
  );
}

async function assertCartEmpty(page: Page) {
  await expect(page.locator(".shopping_cart_badge")).toHaveCount(0);
  await expect(page.locator(".shopping_cart_link")).toHaveAttribute(
    "aria-label",
    "Cart, empty",
  );
}

test.describe("Fluxo E2E do SauceDemo", () => {
  test("deve fazer login, ordenar por preço, adicionar as duas mais baratas, finalizar checkout e voltar para home com carrinho vazio", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.loginAsStandardUser();

    await inventoryPage.expectInventoryPageLoaded();
    await inventoryPage.sortByPriceLowToHigh();

    const selectedProducts = await inventoryPage.getInventoryItemNames();
    const productsToAdd = selectedProducts.slice(0, 2);
    const productButtons = page.locator(".inventory_item .btn_inventory");

    for (let i = 0; i < productsToAdd.length; i++) {
      await productButtons.nth(i).click();
      await expect(
        page.locator("[data-test='shopping-cart-badge']"),
      ).toHaveText(String(i + 1));
      await expect(
        page.locator("[data-test='shopping-cart-link']"),
      ).toHaveAttribute("aria-label", `Cart, ${i + 1} items`);
    }

    await inventoryPage.openCart();

    const cartProducts = await page
      .locator(".cart_item .inventory_item_name")
      .allTextContents();

    await expect(page.locator(".cart_item")).toHaveCount(productsToAdd.length);
    await expect(page.locator("[data-test='shopping-cart-badge']")).toHaveText(
      String(productsToAdd.length),
    );
    expect(cartProducts).toEqual(productsToAdd);

    const expectedCheckoutItems = await getCartItems(page);

    await expect(page.locator(".checkout_button")).toBeVisible();
    await page.locator(".checkout_button").click();
    await expect(page).toHaveURL(/.*\/checkout-step-one.html/);

    await completeCheckout(page, expectedCheckoutItems);

    const pdfLink = page.locator(
      'a[href$=".pdf"], a[download], [data-test*="pdf"], [data-test*="download"]',
    );
    if ((await pdfLink.count()) > 0) {
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        pdfLink.first().click(),
      ]);
      await expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
    }

    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(/.*\/inventory.html/);
    await assertCartEmpty(page);

    const inventoryButtons = page.locator(".btn_inventory");
    const itemCount = await inventoryButtons.count();
    for (let i = 0; i < itemCount; i++) {
      await expect(inventoryButtons.nth(i)).toHaveText(/Add to cart/i);
    }
  });

  test("deve remover o item mais caro do carrinho, continuar comprando e finalizar a compra", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.loginAsStandardUser();
    await inventoryPage.expectInventoryPageLoaded();

    const itemCards = page.locator(".inventory_item");
    const itemNames = await inventoryPage.getInventoryItemNames();
    const prices = await inventoryPage.getInventoryPrices();
    const highestIndex = await inventoryPage.findMostExpensiveIndex();
    const mostExpensiveName = (
      await itemCards
        .nth(highestIndex)
        .locator(".inventory_item_name")
        .textContent()
    )?.trim();

    await itemCards.nth(highestIndex).locator(".inventory_item_name").click();
    await expect(page.locator(".inventory_details_container")).toBeVisible();
    await page.locator('[data-test="add-to-cart"]').click();
    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");
    await page.locator('[data-test="back-to-products"]').click();

    const secondHighestIndex = itemNames
      .map((name, index) => ({ name, index }))
      .filter((item) => item.name !== mostExpensiveName)
      .reduce(
        (selected, current) => {
          const currentPrice = Number(
            (prices[current.index] ?? "$0").replace(/[$,]/g, ""),
          );
          const selectedPrice = Number(
            (prices[selected.index] ?? "$0").replace(/[$,]/g, ""),
          );
          return currentPrice > selectedPrice ? current : selected;
        },
        { name: "", index: 0 },
      ).index;

    await itemCards
      .nth(secondHighestIndex)
      .locator(".inventory_item_name")
      .click();
    await page.locator('[data-test="add-to-cart"]').click();
    await expect(page.locator(".shopping_cart_badge")).toHaveText("2");

    await page.locator(".shopping_cart_link").click();
    await expect(page).toHaveURL(/.*\/cart.html/);

    const cartItems = page.locator(".cart_item");
    await page.locator('[data-test^="remove-"]').first().click();

    await expect(page.locator(".shopping_cart_badge")).toHaveText("1");
    await expect(page.locator(".shopping_cart_link")).toHaveAttribute(
      "aria-label",
      "Cart, 1 items",
    );
    await expect(cartItems).toHaveCount(1);

    const remainingCartNames = await page
      .locator(".cart_item .inventory_item_name")
      .allTextContents();
    const remainingItemName = await page
      .locator(".cart_item .inventory_item_name")
      .first()
      .textContent();
    const remainingItemPriceText = await page
      .locator(".cart_item .inventory_item_price")
      .first()
      .textContent();

    expect(remainingCartNames).not.toContain(mostExpensiveName ?? "");

    await page.locator('[data-test="continue-shopping"]').click();
    await expect(page).toHaveURL(/.*\/inventory.html/);
    await expect(page.locator(".title")).toHaveText("Products");

    const mostExpensiveCard = page.locator(".inventory_item").filter({
      has: page.locator(".inventory_item_name", {
        hasText: mostExpensiveName ?? "",
      }),
    });
    await expect(mostExpensiveCard.locator(".btn_inventory")).toHaveText(
      /Add to cart/i,
    );

    await page.locator(".shopping_cart_link").click();
    await page.locator(".checkout_button").click();
    await expect(page).toHaveURL(/.*\/checkout-step-one.html/);

    await completeCheckout(page, [
      {
        name: remainingItemName?.trim() ?? "",
        price: Number((remainingItemPriceText ?? "$0").replace(/[$,]/g, "")),
      },
    ]);

    await page.locator('[data-test="back-to-products"]').click();
    await expect(page).toHaveURL(/.*\/inventory.html/);
    await assertCartEmpty(page);
  });

  test("deve rejeitar login com credenciais inválidas", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login("standard_user", "wrong_password");

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(
      "Username and password do not match any user in this service",
    );
    await expect(page).toHaveURL("https://www.saucedemo.com/");
  });
});
