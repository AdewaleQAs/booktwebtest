import { Page, Locator, expect } from '@playwright/test';

export class SignInPage {
  readonly page: Page;

  // Sign-in form locators
  readonly phoneInput: Locator;
  readonly countryCodeSelect: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly signUpLink: Locator;
  readonly forgotPasswordLink: Locator;

  // Success overlay locators
  readonly successHeading: Locator;
  readonly signingInText: Locator;
  readonly redirectingText: Locator;

  constructor(page: Page) {
    this.page = page;

    // Sign-in form
    this.countryCodeSelect = page.locator('select[aria-label="Country code"]');
    this.phoneInput = page.locator('input[inputmode="tel"]');
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.signUpLink = page.getByRole('link', { name: 'Sign Up' });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });

    // Success overlay
    this.successHeading = page.getByRole('heading', { name: 'Success!' });
    this.signingInText = page.locator('text=Signing you in');
    this.redirectingText = page.locator('text=Redirecting to dashboard');
  }

  async goto() {
    await this.page.goto('/sign-in');
  }

  async signInWithEmail(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async signInWithPhone(phone: string, countryCode = '+1') {
    await this.countryCodeSelect.selectOption(countryCode);
    await this.phoneInput.fill(phone);
    await this.signInButton.click();
  }

  async expectErrorMessage(message: string) {
    const errorMessage = this.page.locator('p', { hasText: message });
    await expect(errorMessage).toBeVisible();
  }

  async expectToBeOnSignInPage() {
    await expect(this.page).toHaveURL(/\/sign-in/);
    await expect(this.signInButton).toBeVisible();
  }

  async expectSuccessOverlay() {
    await expect(this.successHeading).toBeVisible({ timeout: 10000 });
    await expect(this.signingInText).toBeVisible();
  }

  async expectSuccessToast(message: string) {
    const toast = this.page.locator('li').filter({ hasText: message });
    await expect(toast).toBeVisible({ timeout: 10000 });
  }

  async expectErrorToast(message: string) {
    const toast = this.page.locator('li').filter({ hasText: message });
    await expect(toast).toBeVisible({ timeout: 10000 });
  }

  async expectFormDisabledDuringLoading() {
    await expect(this.emailInput).toBeDisabled();
    await expect(this.passwordInput).toBeDisabled();
    await expect(this.phoneInput).toBeDisabled();
    await expect(this.countryCodeSelect).toBeDisabled();
  }

  async expectRedirectToDashboard() {
    await expect(this.page).toHaveURL(/\.io\/$/, { timeout: 15000 });
  }
}