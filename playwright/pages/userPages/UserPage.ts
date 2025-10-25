import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class UserPage extends BasePage {
  constructor(public page: Page) {
    super(page, process.env.USER_URL as string);
  }

  // Add any user-specific methods here if needed
}