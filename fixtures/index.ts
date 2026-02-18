import { test as base } from '@playwright/test';
import { CheckInPage } from './pages/CheckInPage';
import { CloneEventPage } from './pages/CloneEventPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { DashboardPage } from './pages/DashboardPage';
import { EditTicketPage } from './pages/EditTicketPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { VerificationModal } from './pages/VerificationModal';

type Fixtures = {
  checkInPage: CheckInPage;
  cloneEventPage: CloneEventPage;
  createEventPage: CreateEventPage;
  dashboardPage: DashboardPage;
  editTicketPage: EditTicketPage;
  signInPage: SignInPage;
  signUpPage: SignUpPage;
  verificationModal: VerificationModal;
};

export const test = base.extend<Fixtures>({
  checkInPage: async ({ page }, use) => {
    const checkInPage = new CheckInPage(page);
    await use(checkInPage);
  },
  cloneEventPage: async ({ page }, use) => {
    const cloneEventPage = new CloneEventPage(page);
    await use(cloneEventPage);
  },
  createEventPage: async ({ page }, use) => {
    const createEventPage = new CreateEventPage(page);
    await use(createEventPage);
  },
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
  editTicketPage: async ({ page }, use) => {
    const editTicketPage = new EditTicketPage(page);
    await use(editTicketPage);
  },
  signInPage: async ({ page }, use) => {
    const signInPage = new SignInPage(page);
    await use(signInPage);
  },
  signUpPage: async ({ page }, use) => {
    const signUpPage = new SignUpPage(page);
    await use(signUpPage);
  },
  verificationModal: async ({ page }, use) => {
    const verificationModal = new VerificationModal(page);
    await use(verificationModal);
  },
});

export { expect } from '@playwright/test';