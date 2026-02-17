import { Page, Locator, expect } from '@playwright/test';

export class SignUpPage {
  readonly page: Page;

  // Sign-up form locators
  readonly phoneInput: Locator;
  readonly countryCodeSelect: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly signUpButton: Locator;
  readonly sendVerificationCodeButton: Locator;
  readonly signInLink: Locator;

  // Verification view locators
  readonly verificationHeading: Locator;
  readonly otpInputs: Locator;
  readonly submitButton: Locator;
  readonly backToSignUpButton: Locator;
  readonly resendCountdown: Locator;

  constructor(page: Page) {
    this.page = page;

    // Sign-up form
    this.countryCodeSelect = page.locator('select[aria-label="Country code"]');
    this.phoneInput = page.locator('input[inputmode="tel"]');
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.getByRole('textbox', { name: 'Enter password' });
    this.confirmPasswordInput = page.getByRole('textbox', { name: 'Confirm password' });
    this.signUpButton = page.getByRole('button', { name: 'Sign Up' });
    this.sendVerificationCodeButton = page.getByRole('button', { name: 'Send Verification Code' });
    this.signInLink = page.getByRole('link', { name: 'Sign In' });

    // Phone verification view
    this.verificationHeading = page.getByRole('heading', { name: 'Confirm Number' });
    this.otpInputs = page.locator('input[inputmode="numeric"]');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.backToSignUpButton = page.getByRole('button', { name: 'Back to Sign Up' });
    this.resendCountdown = page.locator('text=/Resend in/');
  }

  async goto() {
    await this.page.goto('/sign-up');
  }

  async signUpWithEmail(email: string, password: string, confirmPassword: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.signUpButton.click();
  }

  async signUpWithPhone(phone: string, countryCode = '+1') {
    await this.countryCodeSelect.selectOption(countryCode);
    await this.phoneInput.fill(phone);
    await this.sendVerificationCodeButton.click();
  }

  async expectErrorMessage(message: string) {
    const errorMessage = this.page.locator('p', { hasText: message });
    await expect(errorMessage).toBeVisible();
  }

  async expectToBeOnSignUpPage() {
    await expect(this.page).toHaveURL(/\/sign-up/);
  }

  async expectVerificationView() {
    await expect(this.verificationHeading).toBeVisible();
    await expect(this.otpInputs.first()).toBeVisible();
    await expect(this.submitButton).toBeVisible();
    await expect(this.backToSignUpButton).toBeVisible();
  }

  async expectSuccessToast(message: string) {
    const toast = this.page.locator('li').filter({ hasText: message });
    await expect(toast).toBeVisible({ timeout: 10000 });
  }

  async expectErrorToast(message: string) {
    const toast = this.page.locator('li').filter({ hasText: message });
    await expect(toast).toBeVisible({ timeout: 10000 });
  }

  async enterOtp(code: string) {
    const digits = code.split('');
    for (let i = 0; i < digits.length && i < 4; i++) {
      await this.otpInputs.nth(i).fill(digits[i]);
    }
  }

  async goBackToSignUp() {
    await this.backToSignUpButton.click();
  }
}
