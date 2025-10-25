import { Page } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LeavePage extends BasePage {
  constructor(public page: Page) {
    super(page, process.env.ADMIN_URL as string);
  }

  async navigateToLeavePage() {
    await this.goto('/leave/viewLeaveList');
  }

  async applyLeave() {
    await this.goto('/leave/viewLeaveList');
    console.log('Applying for leave...');
  }
}