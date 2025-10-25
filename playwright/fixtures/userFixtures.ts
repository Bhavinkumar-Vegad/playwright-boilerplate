import { test as baseTest, expect, Page } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();
import * as fs from 'fs';
import * as path from 'path';
// import { getOtpByEmail } from '../../utils/db';
import { UserPage } from '../pages/userPages/UserPage';
import { CartPage } from '../pages/userPages/CartPage';
import { FavoritesPage } from '../pages/userPages/FavoritesPage';



const userAuthFile = 'playwright/.auth/user.json';

type UserFixtures = {
  userPage: UserPage;
  cartPage: CartPage;
  favoritesPage: FavoritesPage;
};

export const userTest = baseTest.extend<UserFixtures>({
  userPage: async ({ browser }, use) => {
    let page: Page | undefined; // Initialize as undefined
    let userPage: UserPage;

    if (fs.existsSync(userAuthFile)) {
      const context = await browser.newContext({ storageState: userAuthFile });
      const tempPage = await context.newPage();
      await tempPage.goto(process.env.USER_URL as string);
      try {
        await expect(tempPage.getByRole('heading', { name: 'Products' })).toBeVisible({ timeout: 5000 });
        page = tempPage; // Assign if successful
      } catch (e) {
        console.log('User session expired, re-authenticating...');
        await tempPage.close(); // Close tempPage if verification fails
      }
    }

    if (!page) { // If page is still undefined, perform full login
      const context = await browser.newContext();
      page = await context.newPage();
      await page.goto(process.env.USER_URL as string);
      await page.getByRole('textbox', { name: 'email' }).fill(process.env.USER_EMAIL as string);
      await page.getByRole('textbox', { name: 'password' }).fill(process.env.USER_PASSWORD as string);
      await page.getByRole('button', { name: 'Login' }).click();
      await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
      // const userOtp = await getOtpByEmail(process.env.USER_EMAIL as string);
      // console.log(`User OTP for ${process.env.USER_EMAIL}: ${userOtp}`);
      await page.context().storageState({ path: userAuthFile });
    }
    userPage = new UserPage(page as Page);
    await use(userPage);
  },
  cartPage: async ({ userPage }, use) => {
    const cartPage = new CartPage(userPage.page);
    await use(cartPage);
  },
  favoritesPage: async ({ userPage }, use) => {
    const favoritesPage = new FavoritesPage(userPage.page);
    await use(favoritesPage);
  },
});