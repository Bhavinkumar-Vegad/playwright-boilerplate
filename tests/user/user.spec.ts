import { userTest } from '../../playwright/fixtures/userFixtures';

userTest('user should be able to access user portal', async ({ userPage, cartPage, favoritesPage }) => {
  await userPage.waitForLoadState('networkidle');
  await userPage.shouldBeVisibleByRole('heading', { name: 'Products' });
  await cartPage.navigate();
  await userPage.waitForLoadState('networkidle');
  await favoritesPage.navigate();
  await userPage.waitForLoadState('networkidle');
});