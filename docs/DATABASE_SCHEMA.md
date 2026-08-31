# ShopLedger Pro — Database Schema

Status legend: ✅ implemented this phase · ⏳ planned for a later phase

## User ✅ (`server/src/models/User.js`)
name, email (unique), password (hashed), role [admin|manager|staff], shopName,
phone, avatarUrl, isActive, refreshToken, passwordResetToken/Expires, lastLoginAt

## Customer ✅ (`server/src/models/Customer.js`)
shop (ref User), name, mobile, email, address, gstNumber, notes, loyaltyPoints,
totalPurchased, totalPaid, totalDue, isActive
- Compound unique index: (shop, mobile)
- Text index: name, mobile, email — powers customer search

## Counter ✅ (`server/src/models/Counter.js`)
key (e.g. `invoice_<shopId>`), seq — used to generate sequential invoice numbers

## Category ⏳
shop (ref User), name, description, isActive

## Product ⏳
shop (ref User), name, category (ref Category), sku (unique per shop), barcode,
sellingPrice, costPrice, quantity, unit, lowStockThreshold, isActive

## Invoice ⏳
shop (ref User), invoiceNumber (auto via Counter), customer (ref Customer),
items: [{ product (ref Product), name, quantity, price, discount }], subtotal,
discountTotal, taxPercent, taxAmount, grandTotal, paidAmount, pendingAmount,
status [paid|partial|pending], notes, createdBy (ref User)

## Payment ⏳
shop (ref User), invoice (ref Invoice), customer (ref Customer), amount,
method [cash|card|upi|bank_transfer|other], paymentDate, notes, recordedBy (ref User)

## Settings ⏳
shop (ref User, unique), shopName, logoUrl, gstNumber, invoicePrefix,
taxPercentDefault, currency, printerType [a4|thermal80mm]

## Notification ⏳
shop (ref User), type [low_stock|overdue_bill|due_today], message, isRead,
relatedInvoice / relatedProduct (optional refs)

## Log (audit trail) ⏳
shop (ref User), user (ref User), action, entityType, entityId, meta, createdAt

---

## Build order for remaining phases
3. Finish backend: Category → Product → Invoice (+ Counter usage) → Payment →
   Settings → Notification → Log, each with model + service + controller + routes
4. Auth is done (this phase) — role guards applied per-route as modules land
5. Frontend scaffold (Vite + Tailwind + Redux Toolkit + Router + Axios client)
6. Dashboard (aggregation endpoints + Chart.js widgets)
7–11. Customer / Product / Invoice / Payment / Reports UI, wired to APIs
12. PDF generation (pdfkit) for invoices + ledger export
13. Print stylesheets (A4 + 80mm thermal)
14–15. Docker Compose (client, server, mongo) + deployment notes
16. Root README consolidating setup for all phases
