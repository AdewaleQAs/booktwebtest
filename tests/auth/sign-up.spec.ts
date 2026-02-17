import { test, expect } from '../../fixtures';
import { testData } from '../../utils/test-helpers';

test.describe('Sign Up Page', () => {
  test.beforeEach(async ({ signUpPage }) => {
    await signUpPage.goto();
  });

  test.describe('Page Elements', () => {
    test('should display all sign-up form elements', async ({ signUpPage }) => {
      await expect(signUpPage.countryCodeSelect).toBeVisible();
      await expect(signUpPage.phoneInput).toBeVisible();
      await expect(signUpPage.emailInput).toBeVisible();
      await expect(signUpPage.passwordInput).toBeVisible();
      await expect(signUpPage.confirmPasswordInput).toBeVisible();
      await expect(signUpPage.signUpButton).toBeVisible();
      await expect(signUpPage.signInLink).toBeVisible();
    });

    test('should have correct default country code', async ({ signUpPage }) => {
      await expect(signUpPage.countryCodeSelect).toHaveValue('+1');
    });

    test('should display page heading', async ({ signUpPage, page }) => {
      await expect(page.getByRole('heading', { name: 'Event - Organizer Sign Up' })).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should show error when submitting empty form', async ({ signUpPage }) => {
      await signUpPage.signUpButton.click();
      await signUpPage.expectErrorMessage('Either phone number or email must be provided');
    });

    test('should show error when only email is provided without password', async ({ signUpPage }) => {
      await signUpPage.emailInput.fill('test@example.com');
      await signUpPage.signUpButton.click();
      await signUpPage.expectErrorMessage('Password is required');
    });

    test('should show error when only password is provided', async ({ signUpPage }) => {
      await signUpPage.passwordInput.fill('Password123!');
      await signUpPage.signUpButton.click();
      await signUpPage.expectErrorMessage('Either phone number or email must be provided');
    });

    test('should show error for invalid email format', async ({ signUpPage }) => {
      await signUpPage.emailInput.fill('invalid-email');
      await signUpPage.passwordInput.fill('Password123!');
      await signUpPage.confirmPasswordInput.fill('Password123!');
      await signUpPage.signUpButton.click();
      await signUpPage.expectErrorMessage('Invalid email address');
    });

    test('should show error for short password', async ({ signUpPage }) => {
      await signUpPage.emailInput.fill('test@example.com');
      await signUpPage.passwordInput.fill('abc');
      await signUpPage.confirmPasswordInput.fill('abc');
      await signUpPage.signUpButton.click();
      await signUpPage.expectErrorMessage('Password must be at least 8 characters');
    });

    test('should show error when passwords do not match', async ({ signUpPage }) => {
      await signUpPage.emailInput.fill('test@example.com');
      await signUpPage.passwordInput.fill('Password123!');
      await signUpPage.confirmPasswordInput.fill('DifferentPassword!');
      await signUpPage.signUpButton.click();
      await signUpPage.expectErrorMessage("Passwords don't match");
    });

    test('should show error when both phone and email are provided', async ({ signUpPage }) => {
      await signUpPage.phoneInput.fill('1234567890');
      await signUpPage.emailInput.fill('test@example.com');
      await signUpPage.passwordInput.fill('Password123!');
      await signUpPage.confirmPasswordInput.fill('Password123!');
      await signUpPage.sendVerificationCodeButton.click();
      await signUpPage.expectErrorMessage('Please provide either phone number or email, not both');
    });
  });

  test.describe('Phone Number Input', () => {
    test('should format US phone number correctly', async ({ signUpPage }) => {
      await signUpPage.countryCodeSelect.selectOption('+1');
      await signUpPage.phoneInput.fill('7204227030');
      await expect(signUpPage.phoneInput).toHaveValue('(720) 422-7030');
    });

    test('should format Nigerian phone number correctly', async ({ signUpPage }) => {
      await signUpPage.countryCodeSelect.selectOption('+234');
      await signUpPage.phoneInput.fill('08031234567');
      await expect(signUpPage.phoneInput).toHaveValue('0803 123 4567');
    });

    test('should only allow numeric input', async ({ signUpPage }) => {
      await signUpPage.phoneInput.fill('abc123def456');
      await expect(signUpPage.phoneInput).toHaveValue('(123) 456');
    });
  });

  test.describe('Button Behavior', () => {
    test('should show "Sign Up" button by default', async ({ signUpPage }) => {
      await expect(signUpPage.signUpButton).toBeVisible();
    });

    test('should change button to "Send Verification Code" when phone is entered', async ({ signUpPage }) => {
      await signUpPage.phoneInput.fill('7204227030');
      await expect(signUpPage.sendVerificationCodeButton).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to sign in page', async ({ signUpPage, page }) => {
      await signUpPage.signInLink.click();
      await expect(page).toHaveURL(/\/sign-in/);
    });
  });

  test.describe('Email Sign Up Flow', () => {
    test('should successfully sign up with valid email and show success toast', async ({ signUpPage, page }) => {
      const uniqueEmail = testData.email();
      await signUpPage.signUpWithEmail(uniqueEmail, 'TestPassword123!', 'TestPassword123!');
      await signUpPage.expectSuccessToast('Registration complete');
    });

    test('should redirect to sign-in page after successful email sign up', async ({ signUpPage, page }) => {
      const uniqueEmail = testData.email();
      await signUpPage.signUpWithEmail(uniqueEmail, 'TestPassword123!', 'TestPassword123!');
      await signUpPage.expectSuccessToast('Registration complete');
      await expect(page).toHaveURL(/\/sign-in/, { timeout: 10000 });
    });

    test('should show error toast when signing up with an already registered email', async ({ signUpPage }) => {
      // Use the known test user email from staging
      await signUpPage.signUpWithEmail('t.adewale@getbookt.io', 'TestPassword123!', 'TestPassword123!');
      await signUpPage.expectErrorToast('already attached to an account');
    });
  });

  test.describe('Phone Sign Up Flow', () => {
    test('should show verification view after submitting valid phone number', async ({ signUpPage }) => {
      await signUpPage.signUpWithPhone('7204227030', '+1');
      await signUpPage.expectSuccessToast('Verification code sent');
      await signUpPage.expectVerificationView();
    });

    test('should display OTP inputs and countdown on verification view', async ({ signUpPage }) => {
      await signUpPage.signUpWithPhone('7204227030', '+1');
      await signUpPage.expectVerificationView();
      await expect(signUpPage.otpInputs).toHaveCount(4);
      await expect(signUpPage.resendCountdown).toBeVisible();
      await expect(signUpPage.submitButton).toBeDisabled();
    });

    test('should navigate back to sign-up form from verification view', async ({ signUpPage }) => {
      await signUpPage.signUpWithPhone('7204227030', '+1');
      await signUpPage.expectVerificationView();
      await signUpPage.goBackToSignUp();
      await expect(signUpPage.signUpButton).toBeVisible();
      await signUpPage.expectToBeOnSignUpPage();
    });

    test('should show verification view with Nigerian phone number', async ({ signUpPage }) => {
      await signUpPage.signUpWithPhone('8031234567', '+234');
      await signUpPage.expectSuccessToast('Verification code sent');
      await signUpPage.expectVerificationView();
    });
  });
});
