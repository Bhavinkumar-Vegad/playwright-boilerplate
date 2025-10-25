import { test as baseTest, expect, Page } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();
import * as fs from 'fs';
import * as path from 'path';
import { getOtpByEmail } from '../../utils/db';
import { AdminPage } from '../pages/adminPages/Admin';
import { PIMPage } from '../pages/adminPages/PIM';
import { LeavePage } from '../pages/adminPages/Leave';

const adminAuthFile = 'playwright/.auth/admin.json';

type AdminFixtures = {
  adminPage: AdminPage;
  pimPage: PIMPage;
  adminLeavePage: LeavePage;
};

export const adminTest = baseTest.extend<AdminFixtures>({
  adminPage: async ({ browser, page }, use) => {
    let adminPageInstance: AdminPage;
    let authPage: Page | undefined; // Initialize as undefined

    if (fs.existsSync(adminAuthFile)) {
      const context = await browser.newContext({ storageState: adminAuthFile });
      const tempPage = await context.newPage();
      await tempPage.goto(process.env.ADMIN_URL as string);
      try {
        await expect(tempPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible({ timeout: 5000 });
        authPage = tempPage; // Assign if successful
      } catch (e) {
        console.log('Admin session expired, re-authenticating...');
        await tempPage.close(); // Close tempPage if verification fails
      }
    }

    if (!authPage) { // If page is still undefined, perform full login
      const context = await browser.newContext();
      authPage = await context.newPage();
      await authPage.goto(process.env.ADMIN_URL as string);
      await authPage.getByRole('textbox', { name: 'Username' }).fill(process.env.ADMIN_EMAIL as string);
      await authPage.getByRole('textbox', { name: 'Password' }).fill(process.env.ADMIN_PASSWORD as string);
      await authPage.getByRole('button', { name: 'Login' }).click();
      await expect(authPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
      const adminOtp = await getOtpByEmail(process.env.ADMIN_EMAIL as string);
      console.log(`Admin OTP for ${process.env.ADMIN_EMAIL}: ${adminOtp}`);
      await authPage.context().storageState({ path: adminAuthFile });
    }
    adminPageInstance = new AdminPage(authPage as Page);
    await use(adminPageInstance);
  },

  pimPage: async ({ adminPage }, use) => {
    await use(new PIMPage(adminPage.page));
  },
  adminLeavePage: async ({ adminPage }, use) => {
    await use(new LeavePage(adminPage.page));
  },
});