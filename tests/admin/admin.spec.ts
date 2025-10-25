import { adminTest } from '../../playwright/fixtures/adminFixtures';
import { expect } from '@playwright/test';

adminTest('admin should be able to access admin dashboard', async ({ adminPage, adminLeavePage }) => {
  await expect(adminPage.page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await adminLeavePage.navigateToLeavePage();
  await adminLeavePage.waitForLoadState('networkidle');
  await adminLeavePage.applyLeave();
  await adminLeavePage.goto('/time/viewEmployeeTimesheet');
  await adminLeavePage.waitForLoadState('networkidle');
});