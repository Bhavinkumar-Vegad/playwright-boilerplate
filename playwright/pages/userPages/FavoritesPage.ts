import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class FavoritesPage extends BasePage {
  readonly heading: Locator;
  readonly continueShoppingButton: Locator;

  constructor(public page: Page) {
    super(page, process.env.USER_URL as string);
    this.heading = page.getByRole('heading', { name: 'Favorites' });
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
  }

  async navigate() {
    await this.goto('/favorites');
  }
}