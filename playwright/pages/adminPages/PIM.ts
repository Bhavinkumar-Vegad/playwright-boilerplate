import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class PIMPage extends BasePage {
  readonly page: Page;

  constructor(page: Page) {
    super(page);
    this.page = page;
  }
}