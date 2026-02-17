# Bookt E2E Tests

End-to-end testing suite for the [Bookt](https://staging.organizer.getbookt.io) event management platform using Playwright.

**Test Coverage:** 161 passing tests, 4 skipped | Auth flows, sign-up, sign-in, dashboard modules, event creation wizard, clone event flow, ticket management

## Setup

```bash
# Install dependencies
yarn install

# Install Playwright browsers
yarn playwright install
```

## Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Update `.env` with your environment settings:
```env
BASE_URL=https://staging.organizer.getbookt.io
TEST_USER_EMAIL=your-test@email.com
TEST_USER_PASSWORD=your-test-password
```

## Running Tests

```bash
# Run all tests (auth + dashboard + event creation + clone + tickets)
yarn test

# Run tests with browser visible
yarn test:headed

# Run with Playwright UI
yarn test:ui

# Run in debug mode
yarn test:debug

# Run auth tests only (sign-in, sign-up, phone verification)
yarn test:auth

# Run dashboard tests only (requires auth setup)
yarn test:dashboard

# Run event creation tests only (requires auth setup)
yarn test:events

# Run clone event tests only (requires auth setup)
yarn test:clone

# Run ticket management tests only (requires auth setup)
yarn test:tickets

# Run specific browser
yarn test:chrome
yarn test:firefox
yarn test:safari

# Run mobile tests (Pixel 5 & iPhone 12)
yarn test:mobile

# View HTML report
yarn report
```

## Recording Tests

Use Playwright codegen to record new tests:

```bash
yarn codegen https://staging.organizer.getbookt.io/sign-in
```

## Project Structure

```
bookt-e2e/
├── .auth/                        # Generated auth state (gitignored)
│   └── user.json
├── fixtures/
│   ├── pages/                    # Page Object Models
│   │   ├── CloneEventPage.ts     # Clone event wizard (extends CreateEventPage)
│   │   ├── CreateEventPage.ts    # 3-step event creation wizard
│   │   ├── DashboardPage.ts      # Dashboard & module navigation
│   │   ├── EditTicketPage.ts     # Ticket list, create, edit, delete flows
│   │   ├── SignInPage.ts         # Sign-in form & auth flows
│   │   ├── SignUpPage.ts         # Sign-up form & verification
│   │   └── VerificationModal.ts  # Phone OTP verification modal
│   ├── test-assets/              # Test data files
│   │   └── test-event-image.png  # Valid PNG for image upload tests
│   ├── auth.setup.ts             # Auth setup (login + save storageState)
│   └── index.ts                  # Fixture exports
├── tests/
│   ├── auth/                     # Unauthenticated tests
│   │   ├── sign-in.spec.ts       # Sign-in page elements & validation
│   │   ├── email-sign-in.spec.ts # Email sign-in flows (success, error)
│   │   ├── phone-verification.spec.ts  # Phone sign-in & OTP
│   │   └── sign-up.spec.ts       # Sign-up page & registration flows
│   └── dashboard/                # Authenticated tests
│       ├── clone-event.spec.ts   # Clone event flow (17 tests)
│       ├── create-event.spec.ts  # Event creation wizard (48 tests)
│       ├── dashboard.spec.ts     # Dashboard & all 6 module loading
│       └── edit-ticket.spec.ts   # Ticket management CRUD (27 tests)
├── utils/
│   ├── date-helpers.ts           # Date utilities for calendar tests
│   └── test-helpers.ts           # Shared test utilities
├── playwright.config.ts
├── .env.example
└── package.json
```

## Test Architecture

### Page Object Model (POM)

Tests use page object fixtures for cleaner, reusable code:

```typescript
import { test, expect } from '../../fixtures';

test('should sign in with email', async ({ signInPage }) => {
  await signInPage.goto();
  await signInPage.signInWithEmail('user@example.com', 'password');
  await signInPage.expectSuccessOverlay();
  await signInPage.expectRedirectToDashboard();
});
```

### Authenticated Tests

Dashboard tests use Playwright's `storageState` pattern:

1. The `setup` project runs `auth.setup.ts` which logs in and saves the browser state to `.auth/user.json`
2. The `chromium-authenticated` project loads this saved state, skipping login for every test
3. Project dependencies ensure setup runs before any dashboard tests

### Playwright Projects

| Project | Auth | Tests |
|---------|------|-------|
| `chromium` | No | Auth tests (sign-in, sign-up) |
| `firefox` | No | Auth tests |
| `webkit` | No | Auth tests |
| `Mobile Chrome` | No | Auth tests |
| `Mobile Safari` | No | Auth tests |
| `setup` | — | Runs `auth.setup.ts` to create session |
| `chromium-authenticated` | Yes | Dashboard & module tests |

## Test Coverage

| Suite | Tests | Skipped | Description |
|-------|-------|---------|-------------|
| Sign-In | 22 | 4 | Page elements, validation, email/phone flows |
| Sign-Up | 23 | 0 | Registration, verification, duplicate detection |
| Dashboard | 21 | 0 | All 6 modules load with key elements |
| Event Creation | 48 | 0 | 3-step wizard, 4 ticket types, validations, known bugs |
| Clone Event | 17 | 0 | Clone visibility, pre-filled state, publish, save draft |
| Ticket Management | 27 | 0 | Ticket list, create, edit form, CRUD operations, navigation |
| Auth Setup | 1 | 0 | Session creation |
| **Total** | **161** | **4** | |

### Dashboard Modules Tested

| Module | Route | Verified Elements |
|--------|-------|-------------------|
| Events | `/events` | Heading, event tabs, create event link |
| Check-In | `/check-in` | Heading, live events text, guest list |
| Activities | `/activities` | Heading, insights, All/Paid/Free filters |
| Earnings | `/earnings` | Heading, available balance, cashout button |
| Promotions | `/promotions` | Heading, generate promo code button |
| Communications | `/communications` | Heading, Push/SMS/Email channel tabs |

### Event Creation Wizard (48 tests)

Tests the 3-step wizard at `/events/new`:

| Step | Coverage |
|------|----------|
| Step 1: Basic Info | Image upload/crop modal, form elements, Next button validation (each field), private event warning, rich text editor |
| Step 2: Organizer | Form elements, organizer validation errors, toggle defaults, advance to Step 3 |
| Step 3: Tickets | Ticket type switching (Free/Paid/Donation/Pay Anything), field visibility, toggles, terms link |
| Happy Paths | Full publish flow for all 4 ticket types |
| Save Draft | From Steps 1, 2, and 3 |
| Known Bugs | 3 publish validation bugs + 1 save draft bug (documented with actual behavior) |

### Clone Event Flow (17 tests)

Tests the clone feature at `/events/clone-event/{id}`:

| Category | Coverage |
|----------|----------|
| Visibility | Clone Event link on ended events only, View Ticket(s) link, not on active events |
| Pre-filled State | Event name, type, address, about are pre-filled from source event |
| Empty Fields | Image, start date, end date are NOT pre-filled |
| Next Button | Disabled on load, enabled after image + dates |
| Step 3 Tickets | Existing tickets carry over from source event, Add new ticket category button |
| Happy Path | Full clone-to-publish flow with existing tickets |
| Save Draft | From Step 2 of cloned event |

### Ticket Management (27 tests)

Tests ticket CRUD at `/events/ticketsToEdit/{id}`, `/events/{id}/ticket/create`, `/events/{id}/ticket/edit/{ticketId}`:

| Category | Coverage |
|----------|----------|
| Ticket List Page | Heading, Add button, ticket cards with name/type, three-dot menu (Edit/Duplicate/Delete) |
| Create Ticket Form | Heading, Go back button, ticket type radios (Free default), form fields, action buttons |
| Ticket Type Switching | Free (no price), Paid (price field), Donation (minimum donation), Pay Anything (suggested amount) |
| Edit Ticket Form | Heading, pre-filled name/quantity, Cancel/Save Changes buttons, ticket type radio state |
| CRUD Operations | Create free ticket, verify on list, duplicate, delete with success toast, cleanup |
| Navigation | Cancel from create/edit returns to ticket list |
| Known Bug | Save Changes API returns 400 "Unexpected end of JSON input" (documented) |

## CI/CD Integration

For GitHub Actions, add to your workflow:

```yaml
- name: Run Playwright tests
  env:
    BASE_URL: ${{ secrets.STAGING_URL }}
    TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
    TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
  run: |
    cd bookt-e2e
    yarn install
    yarn playwright install --with-deps
    yarn test
```

## Notes

- **Staging environment** — Tests target `https://staging.organizer.getbookt.io` by default
- **Toast selectors** — The app renders toasts as `li` elements; use `page.locator('li').filter({ hasText: message })`
- **Strict mode** — Use `exact: true` when Playwright locators match multiple elements
- **Skipped tests** — 4 phone verification tests require a verified phone number to enable
- **Radix UI quirks** — RadioGroup requires retry clicks with `force: true`; custom toggles use Tailwind CSS classes (not ARIA attributes) for state
- **Known bugs** — 5 tests document application bugs (publish validation + save draft + ticket edit save API) with actual behavior assertions. Update when fixed
- **Event cleanup** — Happy path tests create real events on staging. Periodic cleanup may be needed
- **Ticket cleanup** — CRUD tests create and delete tickets on event 1868. Cleanup test removes leftover E2E tickets
