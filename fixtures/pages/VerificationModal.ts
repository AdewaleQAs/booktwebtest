import { Page, Locator, expect } from '@playwright/test';

export class VerificationModal {
  readonly page: Page;
  readonly heading: Locator;
  readonly otpInputs: Locator;
  readonly verifyButton: Locator;
  readonly resendButton: Locator;
  readonly backButton: Locator;
  readonly cooldownText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Verify Your Phone' });
    this.otpInputs = page.locator('input[inputmode="numeric"]');
    this.verifyButton = page.getByRole('button', { name: 'Verify & Sign In' });
    this.resendButton = page.getByRole('button', { name: 'Resend Code' });
    this.backButton = page.getByRole('button', { name: 'Back to Sign In' });
    this.cooldownText = page.locator('text=/Resend code in/');
  }

  async expectToBeVisible() {
    await expect(this.heading).toBeVisible();
    await expect(this.otpInputs.first()).toBeVisible();
  }

  async enterOtp(code: string) {
    const digits = code.split('');
    for (let i = 0; i < digits.length && i < 4; i++) {
      await this.otpInputs.nth(i).fill(digits[i]);
    }
  }

  async submit() {
    await this.verifyButton.click();
  }

  async goBack() {
    await this.backButton.click();
  }

  async expectCooldownVisible() {
    await expect(this.cooldownText).toBeVisible();
  }

  async expectResendButtonVisible() {
    await expect(this.resendButton).toBeVisible();
  }
}