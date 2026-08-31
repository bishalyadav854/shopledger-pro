# ShopLedger Pro — Shop Billing & Customer Due Management System

A MERN-stack app for shopkeepers: customers, products, invoices, payments,
ledgers, reports, and PDF/print-ready billing.

## Status: Phase 1–3 (partial) complete

This is being built in phases (see `docs/DATABASE_SCHEMA.md` for the full
list). What's included **right now**:

- ✅ Phase 1 — full `client/` + `server/` folder structure
- ✅ Phase 2 — database schema doc + `User`, `Customer`, `Counter` models
- 🔶 Phase 3 (in progress) — backend auth API is complete and working:
  register, login, refresh token, logout, forgot/reset password,
  change password, get/update profile — with JWT + refresh tokens,
  bcrypt hashing, express-validator input validation, role field
  (admin/manager/staff) ready for authorization, rate limiting, helmet,
  CORS, mongo-sanitize, xss-clean.

Everything else in the spec (products, invoices, payments, dashboard,
reports, PDF/print, frontend, Docker) is **not built yet** — it's a lot of
surface area, and I want to build each module against a running/tested
backend rather than dump untested code for all of it at once.

## Running what's here

```bash
cd server
cp .env.example .env   # fill in MONGO_URI, JWT secrets, etc.
npm install
npm run dev
```

Then:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Shop","email":"demo@shop.com","password":"secret123"}'
```

## Next phase

Category → Product module (model, service, controller, routes, CRUD +
search + low-stock alert), then Invoice + Payment (the core billing engine).
Say the word and I'll continue straight into that.
