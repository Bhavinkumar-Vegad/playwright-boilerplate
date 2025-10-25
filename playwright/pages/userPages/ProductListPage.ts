import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class ProductListPage extends BasePage {
  readonly productListTitle: Locator;
  readonly firstProductLink: Locator;

  constructor(public page: Page) {
    super(page, process.env.USER_URL as string);
    this.productListTitle = page.locator('h1', { hasText: 'Product List' });
    this.firstProductLink = page.locator('.product-item a').first();
  }

  async navigate() {
    await this.goto('/products');
  }

  async clickFirstProduct() {
    await this.firstProductLink.click();
  }
}