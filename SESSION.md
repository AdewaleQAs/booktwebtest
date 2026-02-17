# Session Notes - Bookt E2E Test Suite

**Date:** 2026-02-01 — 2026-02-17
**Project:** bookt-e2e (Standalone QA Project)
**Related App:** JTL_BIZ_WEB
**Staging URL:** https://staging.organizer.getbookt.io

---

## Work Completed

### 1. Sign-In Page Tests (43 tests, 4 skipped)

Built comprehensive sign-in test coverage across three spec files:

| Spec File | Tests | Skipped | Coverage |
|-----------|-------|---------|----------|
| `sign-in.spec.ts` | 13 | 0 | Page elements, form validation, phone formatting, navigation |
| `email-sign-in.spec.ts` | 6 | 0 | Password validation, invalid email (HTML5), invalid credentials, success overlay, dashboard redirect, form disabled during loading |
| `phone-verification.spec.ts` | 3 | 4 | Unverified phone errors (US & Nigerian); skipped tests require a verified phone number |

**Key findings:**
- Sign-in page uses HTML5 email validation (no inline error for invalid email format)
- Success flow: credentials → "Success!" overlay → "Signing you in..." → redirect to dashboard (`/`)
- Unverified phone numbers receive toast: "You are not verified please signUp"
- Toast notifications render as `li` elements (not `[data-state="open"][role="status"]`)

### 2. Sign-Up Page Tests (23 tests, 0 skipped)

Full sign-up flow coverage with real staging API integration:

| Category | Tests | Details |
|----------|-------|---------|
| Page Elements | 3 | Heading, inputs, sign-up button |
| Form Validation | 7 | Required fields, email format, password length, password mismatch, terms checkbox |
| Phone Formatting | 3 | US format, Nigerian format, country code switch |
| Button Behavior | 2 | Dynamic text change to "Send Verification Code" for phone |
| Navigation | 1 | Link to sign-in page |
| Email Sign-Up Flow | 3 | Success toast "Registration complete!", redirect to /sign-in, duplicate email error |
| Phone Sign-Up Flow | 4 | Verification view with "Confirm Number", OTP inputs, countdown, back button |

**Key findings:**
- Email sign-up: success toast → redirect to `/sign-in`
- Phone sign-up: shows verification view with "Confirm Number" heading, 4 OTP inputs, countdown timer, "Submit" button, "Back to Sign Up" link
- Duplicate email returns toast: "This email is already attached to an account"
- Button text dynamically changes from "Sign Up" to "Send Verification Code" when phone is entered

### 3. Dashboard & Module Tests (21 tests, 0 skipped)

Authenticated tests verifying all 6 dashboard modules load correctly:

| Module | URL | Key Elements Verified |
|--------|-----|-----------------------|
| Events | `/events` | H1 heading, "All Events" & "Active Events" tabs, "Create Event" link |
| Check-In | `/check-in` | H1 heading, "Check in available live events" text, "Guest List" heading |
| Activities | `/activities` | H1 heading, "Insights" heading, All/Paid/Free filter radio buttons |
| Earnings | `/earnings` | H1 heading, "Available Balance" text, "TAP TO CASH OUT" button |
| Promotions | `/promotions` | H1 heading, "Generate Promo Code" button |
| Communications | `/communications` | H1 heading, Push/SMS/Email channel tabs |

Also tests: dashboard elements (heading, subtitle, logo, user menu), logo navigation back to dashboard.

**Authentication approach:** Uses Playwright `storageState` — a setup project logs in once and saves auth state to `.auth/user.json`, which authenticated test projects reuse.

### 4. Event Creation Wizard Tests (48 tests, 0 skipped)

Comprehensive coverage of the 3-step event creation wizard at `/events/new`:

| Category | Tests | Details |
|----------|-------|---------|
| Happy Path — Publish | 4 | Full wizard with Free, Paid, Donation, Pay Anything tickets |
| Step 1 — Page Elements | 4 | Form elements, In Person default, timezone, Prompts/Poll buttons |
| Step 1 — Image Upload | 4 | Crop modal: appears, Skip Crop, Apply Crop, Cancel |
| Step 1 — Next Validation | 9 | Next disabled for each missing field, enabled when all filled |
| Step 1 — Other Features | 4 | Private event warning, rich text editor, Save Draft button, toggles |
| Step 2 — Organizer | 7 | Form elements, validation errors, advance to Step 3, toggle defaults |
| Step 3 — Tickets | 10 | Ticket elements, sell toggle default, type switching (Free→Paid→Donation→Pay Anything), option toggles, terms link |
| Known Bug — Publish | 3 | Publish enabled with empty ticket name/quantity (documented bug) |
| Known Bug — Save Draft | 1 | Save Draft from Step 1 fails with JS error (documented bug) |
| Save Draft | 2 | Save Draft from Step 2 and Step 3 redirects correctly |

**Known bugs documented:**
1. **Publish button not disabled** — Ticket name and quantity are required fields, but the Publish button remains enabled when they're empty. Events can be created with missing ticket info.
2. **Save Draft from Step 1 fails** — Clicking Save Draft from Step 1 triggers a JavaScript error: `"Cannot use 'in' operator to search for 'file' in undefined"`. Save Draft from Steps 2 and 3 works correctly.

**Key technical findings:**
- **Radix RadioGroup** renders TWO elements per option: a visual `button[role="radio"]` and a hidden `input[type="radio"]`. Click on the visual button doesn't always trigger React state change — requires retry with `force: true`.
- **Custom toggle buttons** have NO `role="switch"`, `data-state`, or `aria-checked`. They use Tailwind CSS classes: `bg-gradient-to-r from-purple-500` when ON, `bg-gray` when OFF. Toggle identified by `id="has_tickets"`.
- **Organizer fields are pre-populated** from user profile data — must clear before validation tests.
- **Event type dropdown** is a Radix Combobox, not a native `<select>`.
- **Plan selection cards** (Base fee / Take on the cost) — headings resolve to multiple elements; click parent container for selection.

### 5. Clone Event Flow Tests (17 tests, 0 skipped)

Tests the clone event feature at `/events/clone-event/{eventId}`:

| Category | Tests | Details |
|----------|-------|---------|
| Visibility | 3 | Clone Event link on ended events only, View Ticket(s) link, not on active events |
| Pre-filled State | 5 | Clone Event heading, event name, type, address, about pre-filled |
| Empty Fields | 3 | Image, start date, end date NOT pre-filled |
| Next Button | 2 | Disabled on load, enabled after image + dates |
| Step 3 Tickets | 2 | Existing tickets carry over, Publish button available |
| Happy Path | 1 | Full clone-to-publish with existing tickets |
| Save Draft | 1 | From Step 2 of cloned event |

**Key findings:**
- Clone is only available on ended event detail pages (`/events/{id}?published=true`)
- Active events show "Edit Ticket(s)" instead of "Clone Event"
- Clone wizard reuses the same 3-step wizard as Create Event, heading says "Clone Event"
- **Step 3 carries over existing tickets** from the source event as ticket cards — no empty ticket creation form. "Add new ticket category" button available for new tickets.
- Pre-filled fields require data hydration wait — `eventNameInput` and other fields populate after the heading appears
- `CloneEventPage` extends `CreateEventPage` (class inheritance) to reuse all wizard methods
- Calendar day picker can match trailing days from next month — `.first()` required to avoid strict mode violations

### 6. Ticket Management Tests (27 tests, 0 skipped)

Tests the ticket CRUD flow at `/events/ticketsToEdit/{eventId}`:

| Category | Tests | Details |
|----------|-------|---------|
| Ticket List Page | 4 | Heading, Add button, ticket cards with name/type, three-dot menu (Edit/Duplicate/Delete) |
| Create Ticket Form | 5 | Heading, Go back button, ticket type radios (Free default), form fields, action buttons |
| Ticket Type Switching | 4 | Free (no price), Paid (price), Donation (min donation), Pay Anything (suggested amount) |
| Edit Ticket Form | 7 | Heading, pre-filled name/quantity, Cancel/Save buttons, ticket type radio state, save bug |
| CRUD Operations | 5 | Create free ticket, verify on list, duplicate, delete with toast, cleanup |
| Navigation | 2 | Cancel from create/edit returns to ticket list |

**Key findings:**
- Ticket list page at `/events/ticketsToEdit/{eventId}` shows ticket cards with three-dot menu (Radix DropdownMenu)
- Create ticket page at `/events/{eventId}/ticket/create` with ticket type radios (Free/Paid/Donation/Pay Anything)
- Edit ticket page at `/events/{eventId}/ticket/edit/{ticketId}` pre-fills name, quantity, and ticket type
- **Delete is immediate** — no confirmation dialog, shows toast "Ticket deleted successfully"
- **Known bug: Save Changes API broken** — returns 400 `"Unexpected end of JSON input"` on staging. The test documents this bug.
- Ticket name input placeholder is `"Enter ticket name"` (the label `"Ticket Name e.g General Admission, VIP"` is above the input)
- Description placeholder varies by ticket type: `"Enter ticket description (optional)"` for Free/Pay Anything, `"Enter ticket description"` for Donation
- Three-dot menu trigger is a nested button inside the ticket card button (Radix DropdownMenu pattern)
- `EditTicketPage` is a standalone page object (not extending CreateEventPage — different page layout)

### 7. Page Objects Created

| Page Object | File | Purpose |
|-------------|------|---------|
| `SignInPage` | `fixtures/pages/SignInPage.ts` | Sign-in form, email/phone flows, success overlay, toast assertions |
| `SignUpPage` | `fixtures/pages/SignUpPage.ts` | Sign-up form, verification view, toast assertions, OTP inputs |
| `VerificationModal` | `fixtures/pages/VerificationModal.ts` | Sign-in phone OTP modal |
| `DashboardPage` | `fixtures/pages/DashboardPage.ts` | Dashboard heading, 6 module links, navigation methods |
| `CreateEventPage` | `fixtures/pages/CreateEventPage.ts` | 3-step wizard: image upload/crop, form fields, ticket types, publish |
| `CloneEventPage` | `fixtures/pages/CloneEventPage.ts` | Clone wizard extending CreateEventPage: event detail nav, pre-filled assertions |
| `EditTicketPage` | `fixtures/pages/EditTicketPage.ts` | Ticket list, create, edit, delete flows with three-dot menu interactions |

### 8. Utilities Created

| Utility | File | Purpose |
|---------|------|---------|
| `date-helpers.ts` | `utils/date-helpers.ts` | `getFutureDate()` and `getEndDate()` for calendar date selection |

### 9. Infrastructure Setup

- Configured Playwright for multi-browser testing (Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari)
- Set up authenticated test project with `storageState` and project dependencies
- Created auth setup fixture (`fixtures/auth.setup.ts`) for one-time login
- Added `.auth/` to `.gitignore`
- Connected to staging environment APIs for real E2E testing

---

## Project Structure

```
bookt-e2e/
├── .auth/                    # Generated auth state (gitignored)
│   └── user.json
├── fixtures/
│   ├── pages/
│   │   ├── CloneEventPage.ts     # Clone event wizard (extends CreateEventPage)
│   │   ├── CreateEventPage.ts    # 3-step event creation wizard
│   │   ├── DashboardPage.ts      # Dashboard & module navigation
│   │   ├── SignInPage.ts         # Sign-in form & flows
│   │   ├── SignUpPage.ts         # Sign-up form & verification
│   │   └── VerificationModal.ts  # Phone OTP verification
│   ├── test-assets/
│   │   └── test-event-image.png  # Valid 200x200 PNG for image upload tests
│   ├── auth.setup.ts             # Auth state setup (login + save storageState)
│   └── index.ts                  # Fixture exports
├── tests/
│   ├── auth/
│   │   ├── sign-in.spec.ts          # Sign-in page elements & validation (13 tests)
│   │   ├── email-sign-in.spec.ts    # Email sign-in flows (6 tests)
│   │   ├── phone-verification.spec.ts  # Phone sign-in flows (3+4 skipped)
│   │   └── sign-up.spec.ts          # Sign-up page & flows (23 tests)
│   └── dashboard/
│       ├── clone-event.spec.ts      # Clone event flow (17 tests)
│       ├── create-event.spec.ts     # Event creation wizard (48 tests)
│       ├── dashboard.spec.ts        # Dashboard & module loading (21 tests)
│       └── edit-ticket.spec.ts      # Ticket management CRUD (27 tests)
├── utils/
│   ├── date-helpers.ts       # Date utility functions for calendar tests
│   └── test-helpers.ts       # Shared test utilities
├── playwright.config.ts
├── .env.example
├── .gitignore
├── package.json
├── SESSION.md
└── README.md
```

---

## Test Summary

| Suite | Passed | Skipped | Total |
|-------|--------|---------|-------|
| Sign-In (3 spec files) | 22 | 4 | 26 |
| Sign-Up | 23 | 0 | 23 |
| Dashboard | 21 | 0 | 21 |
| Event Creation | 48 | 0 | 48 |
| Clone Event | 17 | 0 | 17 |
| Ticket Management | 27 | 0 | 27 |
| Auth Setup | 1 | 0 | 1 |
| **Total** | **161** | **4** | **165** |

All 161 active tests pass against the staging environment.

---

## Completed Tasks

- [x] Configure `.env` — Set `BASE_URL` for staging environment
- [x] Get test credentials — Working test account configured
- [x] Add sign-up tests — Full coverage with real API integration
- [x] Add sign-in tests — Full coverage with success/error flows
- [x] Add dashboard tests — All 6 modules verified with authenticated sessions
- [x] Set up authenticated test infrastructure — storageState pattern with setup project
- [x] **Add event creation tests** — 48 tests covering full 3-step wizard, 4 ticket types, validations, bugs
- [x] **Add clone event tests** — 17 tests covering clone visibility, pre-filled state, publish, save draft
- [x] **Add ticket management tests** — 27 tests covering ticket list, create, edit form, CRUD, navigation

## Next Tasks

### High Priority

- [ ] **Unskip phone verification tests** — Need a verified phone number in the system for sign-in OTP flow
- [ ] **Add forgot password tests** — Create `tests/auth/forgot-password.spec.ts`
- [ ] **Add event editing tests** — Edit existing events, verify changes persist
- [ ] **Fix Save Changes API bug** — Ticket edit save returns 400 "Unexpected end of JSON input" — update test when fixed

### Medium Priority

- [ ] **Set up CI/CD** — GitHub Actions workflow for automated testing against staging
- [ ] **Add more dashboard module tests** — Test CRUD operations within each module
- [ ] **Add sign-out tests** — Verify user menu sign-out functionality

### Low Priority

- [ ] **Install remaining browsers** — Firefox and WebKit for cross-browser testing
- [ ] **Add visual regression** — Screenshot comparison tests
- [ ] **Create test data fixtures** — Mock data for consistent testing
- [ ] **Add accessibility tests** — WCAG compliance checks

---

## Commands Reference

```bash
# Run all tests
yarn test

# Run tests with browser visible
yarn test:headed

# Run with Playwright UI
yarn test:ui

# Run in debug mode
yarn test:debug

# Run auth tests only
yarn test:auth

# Run dashboard tests only
yarn test:dashboard

# Run event creation tests only
yarn test:events

# Run clone event tests only
yarn test:clone

# Run ticket management tests only
yarn test:tickets

# Run specific browser
yarn test:chrome
yarn test:firefox
yarn test:safari

# Run mobile tests
yarn test:mobile

# Generate tests by recording
yarn codegen https://staging.organizer.getbookt.io/sign-in

# View HTML report
yarn report
```

---

## Notes for QA Team

1. **Staging environment** — Tests run against `https://staging.organizer.getbookt.io` by default
2. **Authenticated tests** — Dashboard and event creation tests auto-login via `auth.setup.ts` and reuse session state
3. **Skipped tests** — 4 phone verification tests need a verified phone number to activate
4. **Toast testing** — App uses `li` elements for toast notifications (filter with `page.locator('li').filter({ hasText: message })`)
5. **Strict mode** — Use `exact: true` when locators match multiple elements (common with buttons/links)
6. **API mocking** — Use `mockApiResponse()` from `utils/test-helpers.ts` for isolated tests
7. **Mobile testing** — Run `yarn test:mobile` to test on Pixel 5 and iPhone 12 viewports
8. **Radix UI components** — RadioGroup requires retry clicks with `force: true`; toggles use CSS classes not ARIA attributes for state
9. **Known bugs** — 5 tests document known bugs (3 publish validation, 1 save draft, 1 ticket edit save API) — update assertions when bugs are fixed
10. **Event test data** — Tests create real events on staging; periodic cleanup of test events may be needed
11. **Clone event flow** — Clone only available on ended events; Step 3 carries over existing tickets (no empty form); `CloneEventPage` extends `CreateEventPage`
12. **Calendar day picker** — Day buttons in the calendar can match trailing days from next month; use `.first()` to avoid strict mode violations
13. **Ticket management** — Three-dot menu is a nested button inside ticket card button; delete is immediate with no confirmation; `EditTicketPage` is standalone (not extending CreateEventPage)
14. **Ticket CRUD cleanup** — Serial CRUD tests create and delete test tickets; cleanup test handles leftover tickets gracefully

---

## Related Documentation

- [Playwright Docs](https://playwright.dev/docs/intro)
- [Page Object Model](https://playwright.dev/docs/pom)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
- [Authentication](https://playwright.dev/docs/auth)
