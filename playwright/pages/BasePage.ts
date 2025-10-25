import { Page,expect } from '@playwright/test';

export class BasePage {
  constructor(public page: Page, public baseURL?: string) {}

  async waitForLoadState(state: "load" | "domcontentloaded" | "networkidle", options?: { timeout?: number }) {
    await this.page.waitForLoadState(state, options);
  }

  async goto(url: string) {
    const fullUrl = this.baseURL ? `${this.baseURL}${url}` : url;
    await this.page.goto(fullUrl);
  }

  async click(selector: string) {
    await this.page.locator(selector).click();
  }

  async fill(selector: string, value: string) {
    await this.page.locator(selector).fill(value);
  }

  async getByText(text: string) {
    return this.page.getByText(text);
  }

  async getByRole(role: any, options?: { name?: string | RegExp; level?: number; checked?: boolean; selected?: boolean; expanded?: boolean; exact?: boolean; includeHidden?: boolean; disabled?: boolean }) {
    return this.page.getByRole(role, options);
  }

  async isVisible(selector: string, options?: { timeout?: number }) {
    return await this.page.locator(selector).isVisible(options);
  }

  async hover(selector: string) {
    await this.page.locator(selector).hover();
  }

  async press(selector: string, key: string) {
    await this.page.locator(selector).press(key);
  }

  async selectOption(selector: string, value: string | { value?: string; label?: string; index?: number }) {
    await this.page.locator(selector).selectOption(value);
  }

  async check(selector: string) {
    await this.page.locator(selector).check();
  }

  async uncheck(selector: string) {
    await this.page.locator(selector).uncheck();
  }

  async waitForURL(url: string | RegExp, options?: { timeout?: number; waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit" }) {
    await this.page.waitForURL(url, options);
  }

  async acceptDialog() {
    this.page.on('dialog', dialog => dialog.accept());
  }

  async dismissDialog() {
    this.page.on('dialog', dialog => dialog.dismiss());
  }

  // Assertion Methods
  async shouldBeVisible(selector: string, options?: { timeout?: number }) {
    await expect(this.page.locator(selector)).toBeVisible(options);
  }

  async shouldHaveText(selector: string, expectedText: string | RegExp, options?: { ignoreCase?: boolean }) {
    await expect(this.page.locator(selector)).toHaveText(expectedText, options);
  }

  async shouldHaveCount(selector: string, expectedCount: number) {
    await expect(this.page.locator(selector)).toHaveCount(expectedCount);
  }

  async shouldBeEnabled(selector: string, options?: { timeout?: number }) {
    await expect(this.page.locator(selector)).toBeEnabled(options);
  }

  async shouldBeDisabled(selector: string, options?: { timeout?: number }) {
    await expect(this.page.locator(selector)).toBeDisabled(options);
  }

  async shouldBeVisibleByRole(role: any, options?: { name?: string | RegExp; level?: number; checked?: boolean; selected?: boolean; expanded?: boolean; exact?: boolean; includeHidden?: boolean; disabled?: boolean; timeout?: number }) {
    await expect(this.page.getByRole(role, options)).toBeVisible({ timeout: options?.timeout });
  }

  async shouldBeVisibleByLabel(selector: string, options?: { exact?: boolean; timeout?: number }) {
    await expect(this.page.getByLabel(selector, options)).toBeVisible({ timeout: options?.timeout });
  }

  async shouldBeVisibleByPlaceholder(selector: string, options?: { exact?: boolean; timeout?: number }) {
    await expect(this.page.getByPlaceholder(selector, options)).toBeVisible({ timeout: options?.timeout });
  }

  async shouldBeVisibleByAltText(selector: string, options?: { exact?: boolean; timeout?: number }) {
    await expect(this.page.getByAltText(selector, options)).toBeVisible({ timeout: options?.timeout });
  }

  async shouldBeVisibleByTitle(selector: string, options?: { exact?: boolean; timeout?: number }) {
    await expect(this.page.getByTitle(selector, options)).toBeVisible({ timeout: options?.timeout });
  }

  // Additional Utility Methods
  async clear(selector: string) {
    await this.page.locator(selector).clear();
  }

  async type(selector: string, text: string) {
    await this.page.locator(selector).type(text);
  }

  async isHidden(selector: string, options?: { timeout?: number }) {
    return await this.page.locator(selector).isHidden(options);
  }

  async isEditable(selector: string, options?: { timeout?: number }) {
    return await this.page.locator(selector).isEditable(options);
  }

  async goBack() {
    await this.page.goBack();
  }

  async goForward() {
    await this.page.goForward();
  }

  async reload() {
    await this.page.reload();
  }

  async takeScreenshot(path: string) {
    await this.page.screenshot({ path: path });
  }
}