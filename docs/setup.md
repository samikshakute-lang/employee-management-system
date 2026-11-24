# Setup Guide

The Employee Management System API is an Express + TypeScript service that persists to SQLite
through Drizzle ORM. This guide covers everything needed to run it locally.

## Prerequisites

- Git
- Node.js 20 LTS or newer (includes npm)
- A C toolchain is **not** required: password hashing uses the pure-JS `bcryptjs` package, and the
  SQLite driver ships prebuilt binaries for common platforms.

## Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/samikshakute-lang/employee-management-system.git
   cd employee-management-system
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and set `JWT_SECRET` to a random value of at least 32 characters. The API
   refuses to start without it — there is no default secret.
4. Start the application in watch mode:
   ```bash
   npm run dev
   ```
   The API listens on `http://localhost:3000` by default. Verify it with:
   ```bash
   curl http://localhost:3000/api/v1/health
   # {"status":"ok"}
   ```

## Environment Variables

All variables are read and validated at startup in `src/config/env.ts`; an invalid or missing
required value stops the process with an error naming the offending variable.

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | no | `3000` | TCP port the HTTP server listens on. |
| `DATABASE_URL` | yes | — | SQLite database file, e.g. `./data/ems.db`. Use `:memory:` for an ephemeral database. |
| `JWT_SECRET` | yes | — | Secret used to sign JWT access tokens. At least 32 characters; no default is provided. |
| `JWT_EXPIRES_IN` | no | `1h` | Access token lifetime, e.g. `15m`, `1h`, `7d`. |
| `BCRYPT_ROUNDS` | no | `12` | bcrypt cost factor used when hashing passwords. Tests lower this to `4` for speed. |

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Run the API with `tsx watch` (auto-restart on change). |
| `npm run build` | Type-check and compile `src/` to `dist/` with `tsc`. |
| `npm start` | Run the compiled build from `dist/server.js`. |
| `npm test` | Run the vitest suite once. |

## Testing

The suite uses vitest with supertest against the app factory (`src/app.ts`), so no port is bound.
`vitest.config.ts` supplies its own `DATABASE_URL=:memory:`, a fixed test-only `JWT_SECRET` and
`BCRYPT_ROUNDS=4`, so a bare checkout needs no `.env` file to run the tests.

```bash
npm test                           # whole suite
npx vitest run tests/auth.test.ts  # a single file
```
