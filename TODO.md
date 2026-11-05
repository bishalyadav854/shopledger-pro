# ShopLedger Pro — delivery checklist

Use `[x]` only after a check has actually passed. Source files alone are not proof of completion.

## P0 — Security and safe development
- [ ] Ensure `.env` is ignored and is not tracked by either Git repository/history.
- [ ] Rotate any credentials included in shared archives or commits.
- [ ] Verify secrets fail closed at startup in production; do not log secret values.
- [ ] Confirm every shop-owned resource is scoped to the authenticated shop.
- [ ] Confirm refresh-token rotation, revocation, expiry, and logout behavior.
- [ ] Configure production CORS, secure cookies, HTTPS, and trusted proxy settings.

## P0 — Accounting integrity
- [ ] Reject invalid, zero, negative, non-finite, and overpayment amounts consistently.
- [ ] Use MongoDB transactions (where deployment supports them) for invoice/payment/stock/ledger updates.
- [ ] Prevent invoice status edits from creating status/balance mismatches.
- [ ] Verify invoice deletion/voiding restores inventory and customer balances exactly once.
- [ ] Use a documented currency and rounding policy for all calculations.
- [ ] Add concurrency tests for simultaneous payment and stock updates.

## P1 — Automated verification
- [ ] Add a repeatable backend unit/integration test command.
- [ ] Add frontend component and form tests.
- [ ] Add end-to-end tests for registration/login, customer/product CRUD, invoice creation, payment, and logout.
- [ ] Test loading, empty, error, validation, and success states for every page.
- [ ] Test responsive layouts at mobile, tablet, and desktop breakpoints.
- [ ] Run `npm run build` in `client` and `npm run lint` in `server` in CI.

## P1 — UX and accessibility
- [ ] Standardize page headings, action placement, spacing, and form validation.
- [ ] Ensure all icon-only controls have accessible names and keyboard focus styles.
- [ ] Add confirmation for destructive actions and clear recovery/error messages.
- [ ] Add pagination and server-side search consistently to large tables.
- [ ] Ensure modals manage focus, Escape-to-close, and focus restoration.
- [ ] Check contrast and reduced-motion behavior.

## P2 — Maintainability and delivery
- [ ] Remove duplicated route/layout boilerplate only after route tests exist.
- [ ] Add structured request logging and request IDs without logging sensitive data.
- [ ] Add CI for lint, tests, and build.
- [ ] Document environment variables, API response shapes, and backup/restore procedure.
- [ ] Add production deployment, monitoring, and database backup instructions.
