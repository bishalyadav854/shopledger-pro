# ShopLedger Pro

A full-stack MERN application for shop management, customer ledgers, product inventory, invoicing, payment collection, reporting, and shop settings.

## 🚀 Live Demo & Links

- **Backend API (Render):** [https://shopledger-backend-c9xb.onrender.com](https://shopledger-backend-c9xb.onrender.com)
- **API Health Check:** [https://shopledger-backend-c9xb.onrender.com/api/health](https://shopledger-backend-c9xb.onrender.com/api/health)
- **GitHub Repository:** [https://github.com/bishalyadav854/shopledger-pro](https://github.com/bishalyadav854/shopledger-pro)
- **Live Frontend Application:** Deploying on Vercel (https://shopledger-pro.vercel.app)

---

## Technology Stack

- **Frontend:** React 18, Vite, React Router, Redux Toolkit, Tailwind CSS, Axios
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB Atlas (Cloud)
- **Security Foundations:** Helmet, CORS, Rate Limiting, bcrypt password hashing, JWT access tokens, HTTP-only refresh-token cookies, request validation

---

## Project Structure

```text
shopledger-pro/
├── client/
│   ├── public/
│   └── src/
│       ├── layouts/       # Shared application shell
│       ├── pages/         # Route-level screens
│       ├── services/      # Axios API instances & service calls
│       ├── store/         # Redux store and slices
│       └── utils/         # Formatting and shared helpers
├── server/
│   └── src/
│       ├── config/        # Environment and MongoDB Atlas configuration
│       ├── controllers/   # HTTP request/response handlers
│       ├── middleware/    # Auth, security, and error handling
│       ├── models/        # Mongoose schemas
│       ├── routes/        # API route definitions
│       ├── services/      # Business logic & transaction operations
│       ├── utils/         # Shared server helpers
│       └── validators/    # Request validation rules
├── docs/
│   ├── DATABASE_SCHEMA.md
│   ├── QUALITY_AUDIT.md
│   └── TEST_PLAN.md
└── uploads/               # Runtime uploads (excluded from Git)


## Environment Variables Configuration
->>Backend (server/.env & Render Dashboard)
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.3emdl8a.mongodb.net/shopledger?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=[https://shopledger-pro.vercel.app](https://shopledger-pro.vercel.app)

##Local Setup
1. Configure the Backend
Bash
cd server
npm install
Copy .env.example to .env and fill in your MongoDB connection string and secrets:

Bash
# Windows PowerShell
Copy-Item .env.example .env

# macOS/Linux
cp .env.example .env
Start the API in development mode:

Bash
npm run dev
The API health check will be accessible at: http://localhost:5000/api/health.

2. Configure the Frontend
Open a second terminal window:

Bash
cd client
npm install
npm run dev
Open http://localhost:5173 in your browser. Vite proxies /api requests to http://localhost:5000.

Features & Enhancements
Shopkeeper Settings: Editable shopkeeper name, phone, and avatar (stored as data URLs up to 1.5 MB).

Barcode Scanner Support: Supports physical USB barcode scanners (keyboard input mode) and camera-based barcode scanning using the browser BarcodeDetector API.

Barcode Catalog Lookup: Checks local MongoDB inventory first; falls back to the Open Food Facts API for metadata.

Live Notifications: On-demand aggregation for low-stock items and pending invoices.

Receipt & Invoice Printing: Direct browser-based printing supporting standard A4 invoices and 80 mm thermal receipt rolls.

Testing & Build Verification
Run backend tests & linter:

Bash
cd server
npm test
npm run lint
Verify production build of frontend:

Bash
cd client
npm run build
