# Quick POS implementation

## What it adds
- `/pos` page after Dashboard in the sidebar.
- USB scanner input (scanner types barcode and Enter), local barcode lookup, Open Food Facts fallback for product-name suggestions, and manual item entry.
- Fully paid walk-in invoices do not require customer details. If an amount remains due, name and mobile are required and a customer ledger entry is created/found.
- Stock-backed items are deducted by the existing invoice service only when the invoice is saved; manual lines are not stock-tracked.
- Invoice print view includes shop name/address/GST/logo from Settings where available, item rows, subtotal, tax, total, paid and due. Browser print dialog can target A4 or thermal printers.

## Important caveats
- External Open Food Facts results are suggestions only; shop price and quantity must be maintained locally.
- Tax is currently one percentage applied to subtotal. If you need split CGST/SGST or item-level GST slabs, extend the invoice schema and totals calculator before using this for statutory GST invoices.
- Invoice deletion restores stock. Deleting historical invoices affects accounting; restrict deletion and prefer void/refund workflows in production.
- MongoDB writes are compensated on failure but not wrapped in a multi-document transaction. For production, use a replica set and MongoDB transactions for invoice, customer ledger and inventory updates.

## Debug checklist
1. `cd server; npm test; npm run dev`
2. `cd client; npm run dev`
3. Login and open `/pos`.
4. Test a known barcode with quantity available, save a paid invoice, and verify stock decremented once.
5. Test unknown barcode then manual item; confirm no stock is changed for manual lines.
6. Enter partial payment; verify customer name/mobile are required and customer appears in Customers/Pending list.
7. Allow pop-ups and test browser printing.
8. Check browser Network tab if POST `/api/invoices` returns an error.

## ShopLedger brand mark
A simple editable SVG brand mark is included at `client/public/assets/shopledger-mark.svg`. Use `/assets/shopledger-mark.svg` in the app header or invoice template. This is an original vector mark, not an AI-generated raster image, so it stays crisp at any size and can be replaced with a commissioned/AI-generated brand asset later.
