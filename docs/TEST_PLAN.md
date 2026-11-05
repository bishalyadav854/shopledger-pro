# Test plan

This plan defines the checks needed before ShopLedger Pro is treated as reliable. Mark each scenario only after it has been executed and its result recorded.

## 1. Environment and smoke checks

- [ ] A clean `npm ci` succeeds in `server/` and `client/`.
- [ ] Backend starts with valid environment configuration and fails clearly with missing production secrets.
- [ ] `GET /api/health` returns HTTP 200 without exposing configuration or secrets.
- [ ] Frontend starts at the configured Vite URL and `/api` requests reach the backend.
- [ ] Production frontend build succeeds.
- [ ] Backend lint succeeds.

## 2. Authentication and authorization

- [ ] Registration rejects missing/invalid fields and duplicate emails.
- [ ] Passwords are stored only as secure hashes.
- [ ] Login rejects wrong credentials with a safe error.
- [ ] Access tokens expire as configured; refresh works only with a valid refresh cookie.
- [ ] Logout invalidates/revokes refresh credentials and clears the cookie.
- [ ] Expired or malformed tokens cannot access protected endpoints.
- [ ] User A cannot read or mutate User B's customers, products, invoices, payments, or settings.
- [ ] Password reset tokens expire and cannot be reused.
- [ ] Login, registration, and reset endpoints are rate-limited appropriately.

## 3. Customers and products

- [ ] Create, view, update, search, paginate, and delete a customer.
- [ ] Validate required fields, phone/email formats, and duplicate rules where applicable.
- [ ] Create, view, update, search, and archive/delete a product.
- [ ] Validate price, quantity, SKU, category, and low-stock threshold.
- [ ] Negative stock and invalid numeric values are rejected.
- [ ] Product/category references must belong to the authenticated shop.

## 4. Invoice and inventory accounting

- [ ] Create an invoice with one item and multiple items.
- [ ] Verify subtotal, item discounts, invoice discount, tax, grand total, paid amount, pending amount, and status.
- [ ] Verify documented currency precision and rounding at each step.
- [ ] Reject an empty invoice, invalid quantity, invalid price, and overpayment according to the chosen policy.
- [ ] Creating an invoice decreases stock exactly once and increases customer totals exactly once.
- [ ] Insufficient stock rejects the entire invoice without partial writes.
- [ ] A failed write rolls back invoice, stock, and customer ledger changes.
- [ ] Search/filter/pagination and invoice detail use shop-scoped queries.
- [ ] Delete/void behavior is explicit and restores inventory/ledger exactly once.
- [ ] Concurrent invoice creation cannot oversell stock or duplicate invoice numbers.

## 5. Payments

- [ ] Record full and partial payments using each supported method.
- [ ] Reject zero, negative, invalid, and excessive amounts or apply a documented alternative policy.
- [ ] Payment, invoice balance/status, and customer ledger remain consistent if any write fails.
- [ ] Concurrent payments cannot over-collect an invoice.
- [ ] Payment history is scoped to the authenticated shop and paginates correctly.

## 6. Dashboard, reports, settings

- [ ] Dashboard totals match invoice and payment source records for the selected time range.
- [ ] Date boundaries and time zones are tested (midnight, month/year change).
- [ ] Reports handle empty datasets and large result sets.
- [ ] Settings validation prevents invalid currency, tax, invoice prefix, and contact details.
- [ ] PDF/print output, if enabled, matches saved invoice totals.

## 7. Frontend UX and accessibility

- [ ] Every page has loading, empty, error, and success states.
- [ ] Forms show field-level errors and prevent duplicate submissions.
- [ ] Destructive actions require confirmation and show failure feedback.
- [ ] Sidebar works on mobile; overlay closes it and navigation closes after selection.
- [ ] No horizontal overflow at 320px, 375px, 768px, 1024px, and desktop widths.
- [ ] Keyboard users can reach all controls and see focus indicators.
- [ ] Icon-only controls have accessible labels; modals support Escape and focus management.
- [ ] Color contrast and reduced-motion preferences are checked.

## 8. Release gate

A release should not be called production-ready until the security and accounting tests pass, automated tests run in CI, the production build succeeds, secrets are rotated and absent from the artifact, and a database backup/restore drill has been completed.


## Implemented enhancement checks

- [ ] Update profile name and avatar; refresh the page and sign in again to confirm persistence.
- [ ] USB scanner types a barcode and Enter submits it; camera scan works on localhost/HTTPS with camera permission.
- [ ] Existing barcode fills local product data; unknown barcode checks Open Food Facts and leaves price/stock for manual confirmation.
- [ ] Unknown barcode can be manually registered; duplicate barcodes are rejected per shop.
- [ ] Scanning into a draft invoice does not change stock; saving a valid invoice deducts stock exactly once. Test concurrent invoice submissions for the same low-stock item before production.
- [ ] Notification panel lists low-stock items and pending invoices and links to the relevant pages.
- [ ] Browser print supports A4 and thermal paper through printer driver/page settings. Validate physical printer model before claiming direct hardware integration.
- [ ] Run `npm test` in server and `npm run build` in client.
