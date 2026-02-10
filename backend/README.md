# SaveQuietly Backend (Phase 1)

NestJS + Prisma + PostgreSQL backend for the SaveQuietly mobile app. Tracks savings goals, monthly installments, and generates UPI deep links. No bank credentials or UPI PINs are stored.

## Stack

- **Framework:** NestJS (TypeScript)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth:** JWT (OTP-based login via phone, mock OTP for now)

## Local run

```bash
# 1. Install dependencies
npm install

# 2. Set environment (copy and edit)
cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET

# 3. Run migrations
npx prisma migrate dev

# 4. Start dev server
npm run start:dev
```

API base: `http://localhost:3000`

## Example request/response payloads

### Auth

**POST /auth/send-otp**

Request:
```json
{ "phone": "+919876543210", "name": "John Doe" }
```
Response:
```json
{ "message": "OTP sent successfully" }
```

**POST /auth/verify-otp**

Request:
```json
{ "phone": "+919876543210", "otp": "123456" }
```
Response:
```json
{ "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

*(In development, mock OTP is `123456` for any phone; check server logs for the code.)*

### Goals

**POST /goals** (Header: `Authorization: Bearer <access_token>`)

Request:
```json
{ "title": "Trip to Goa", "targetAmount": 50000, "totalMonths": 12, "upiId": "user@paytm" }
```
Response: Goal object with `monthlyAmount` auto-calculated and `installments` array.

**GET /goals** – List user's goals with installments and progress.

**GET /goals/:id** – Single goal with progress stats.

### Installments

**POST /installments/:id/mark-paid** – Mark installment as PAID and set `paidAt`.

### Payments (UPI)

**POST /payments/upi-intent**

Request:
```json
{ "installmentId": "uuid-of-installment" }
```
Response:
```json
{
  "id": "...",
  "installmentId": "...",
  "amount": 4166.67,
  "upiLink": "upi://pay?pa=user%40paytm&am=4166.67&cu=INR&tn=SaveQuietly%20-%20Trip%20to%20Goa",
  "status": "CREATED",
  "createdAt": "..."
}
```

### Dashboard

**GET /dashboard** – Summary: `totalSaved`, `activeGoalsCount`, `goalsProgress` (per-goal stats).

## Project structure

```
src/
  main.ts
  app.module.ts
  auth/           # OTP + JWT
  goals/
  installments/
  payments/       # UPI deep links
  dashboard/
  prisma/
  common/
    guards/       # JwtAuthGuard
    filters/      # HttpExceptionFilter
    decorators/   # @CurrentUser(), @Public()
```

## Scripts

- `npm run start:dev` – Watch mode
- `npm run build` – Build for production
- `npm run start:prod` – Run production build
- `npx prisma migrate dev` – Create/apply migrations
- `npx prisma studio` – DB GUI

## Non-functional

- CORS enabled (configurable via `CORS_ORIGIN`)
- Rate limiting on auth routes (10 req/min)
- Global validation (class-validator) and exception filter
- All secrets from environment variables
