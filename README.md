# ShopLedger Pro

A shop-management application for customer records, product inventory, invoicing, payment collection, reporting, and shop settings.

## Technology

- **Frontend:** React 18, Vite, React Router, Redux Toolkit, Tailwind CSS, Axios
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Security foundations:** Helmet, CORS, rate limiting, bcrypt password hashing, JWT access tokens, HTTP-only refresh-token cookies, request validation

> This repository contains implementation code for the modules listed below. A module existing in source code does not mean it has passed end-to-end or production-readiness testing. See `docs/QUALITY_AUDIT.md` and `docs/TEST_PLAN.md` before deploying.

## Project structure

```text
shopledger-pro/
├── client/
│   ├── public/
│   └── src/
│       ├── layouts/       # Shared application shell
│       ├── pages/         # Route-level screens
│       ├── services/      # API calls
│       ├── store/         # Redux store and slices
│       └── utils/         # Formatting and shared helpers
├── server/
│   └── src/
│       ├── config/        # Environment and database configuration
│       ├── controllers/   # HTTP request/response handling
│       ├── middleware/    # Authentication and error handling
│       ├── models/        # Mongoose schemas
│       ├── routes/        # API route definitions
│       ├── services/      # Business rules and data operations
│       ├── utils/         # Shared server helpers
│       └── validators/    # Request validation rules
├── docs/
│   ├── DATABASE_SCHEMA.md
│   ├── QUALITY_AUDIT.md
│   └── TEST_PLAN.md
└── uploads/               # Runtime uploads; do not commit uploaded files
```

## Requirements

- Node.js 20 LTS or newer
- npm
- MongoDB (local instance or managed MongoDB deployment)

## Setup

### 1. Configure the backend

```bash
cd server
npm ci
```

Copy `.env.example` to `.env` and fill in real values locally. Never commit or share `.env` files.

```bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
```

At minimum, configure `MONGO_URI`, `JWT_ACCESS_SECRET`, and `JWT_REFRESH_SECRET`. Use long, unique, randomly generated JWT secrets; do not reuse example values. Set `CLIENT_URL=http://localhost:5173` for local development.

Start the API:

```bash
npm run dev
```

The API health endpoint is `http://localhost:5000/api/health`.

### 2. Configure the frontend

Open a second terminal:

```bash
cd client
npm ci
npm run dev
```

Open `http://localhost:5173` in your browser. Vite proxies `/api` requests to `http://localhost:5000`; if the backend uses another port, update `client/vite.config.js` accordingly.

## Development workflow

1. Start MongoDB.
2. Start the backend and confirm `/api/health` responds.
3. Start the frontend and sign in using a test account.
4. Verify each change with the relevant checks in `docs/TEST_PLAN.md`.
5. Run the production frontend build before opening a pull request:

   ```bash
   cd client
   npm run build
   ```

6. Run the backend lint command before opening a pull request:

   ```bash
   cd server
   npm run lint
   ```

## Important security and accounting notes

- Never put database credentials, SMTP passwords, JWT secrets, or real customer data in source control, issue reports, screenshots, or ZIP files.
- Rotate credentials immediately if a real `.env` file has been shared.
- Do not use production customer or invoice data for local tests.
- Invoice creation, payment recording, stock changes, and customer ledger changes must be verified as a single consistent workflow before production use. See the quality audit and test plan.
- Confirm refresh-token rotation/revocation, authorization by shop, and password-reset email delivery before deploying publicly.

## Current status

The repository includes UI pages and API modules for authentication, dashboard, customers, categories, products, invoices, payments, reports, and settings. Automated integration coverage and production readiness have not been established by this code review alone. Track verification status in `TODO.md` and `docs/TEST_PLAN.md` rather than marking features complete solely because their files exist.


## Shopkeeper, barcode, notifications, and printing enhancements

- Shopkeeper name, phone, and avatar are editable from Settings. Avatar images are stored as data URLs in the user record; image size is capped at 1.5 MB by the UI. For larger deployments, move images to object storage.
- USB barcode scanners work as keyboard input devices. Camera scanning uses the browser `BarcodeDetector` API when supported and requires camera permission; HTTPS or localhost is required by browsers.
- Barcode lookup checks the shop's MongoDB products first, then Open Food Facts for community catalog metadata. External prices and stock are not treated as authoritative; users must verify and set them manually.
- Barcode values are unique per shop. The database index is declared in the model; for existing databases, ensure index creation completes and resolve any duplicate barcode records first.
- The notification panel aggregates low-stock products and pending invoices on demand. It is not a push-notification service.
- A4 and 80 mm thermal printing use the browser's print dialog and installed printer drivers. Browser-only apps generally cannot silently pair or control arbitrary USB/Bluetooth printers; direct printing needs a model-specific SDK or local bridge.

### Tests

Run `npm test` in `server` for Node's built-in unit tests. Run `npm run build` in `client` to verify the frontend production build. These checks do not replace database-backed API and end-to-end tests.
