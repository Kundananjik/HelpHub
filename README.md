# HelpHub — IT Service Desk

<p>
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white" />
  <img alt="Auth.js" src="https://img.shields.io/badge/Auth.js-v5-000000?logo=auth0&logoColor=white" />
</p>

A lightweight IT service desk (think ServiceNow / Jira Service Management) where
**employees** submit IT issues, **technicians** manage and resolve tickets, and
**administrators** oversee users, departments, and analytics.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Roles & Permissions](#roles--permissions)
- [Data Model](#data-model)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Accounts](#demo-accounts)
- [Scripts](#scripts)
- [Testing](#testing)
- [API Reference](#api-reference)
- [Background Jobs (SLA)](#background-jobs-sla)
- [Deploying to Vercel](#deploying-to-vercel)
- [Project Structure](#project-structure)
- [Notes & Limitations](#notes--limitations)

## Tech Stack

- **Next.js 15** — App Router, React Server Components, Route Handlers
- **TypeScript** — end-to-end type safety
- **Tailwind CSS v4** — utility-first styling
- **Prisma ORM** with **PostgreSQL** (Neon-ready)
- **Auth.js / NextAuth v5** — credentials provider + JWT sessions, role-based access
- **Recharts** — analytics charts
- **Zod** — request/schema & environment validation
- **bcryptjs** — password hashing
- **Vitest** — unit tests
- Optional: **Resend** (email), **Vercel Blob** (attachment storage),
  **Upstash Redis** (rate limiting), **Vercel Cron** (SLA checks)
- Deployable to **Vercel**

## Features

### Authentication
- Email/password **login** & **registration**
- **Forgot / reset password** flow — emailed via Resend when configured, otherwise
  the reset link is surfaced in-app so the flow still works locally
- **Role-based access control** — Employee, Technician, Administrator
- Edge **middleware** protects authenticated routes at a single choke point
- **Rate limiting** on registration, password reset, ticket creation, and comments

### Notifications & activity
- **Real-time in-app notifications** (bell with unread count) via Server-Sent
  Events, for assignments, replies, resolutions, role changes, and SLA breaches —
  with optional email delivery
- A dedicated `/notifications` page listing all updates
- **Audit trail** of key events, surfaced in the admin "recent activity" feed

### SLA tracking
- **Business-hours-aware** first-response *and* resolution targets per priority
  (Mon–Fri, 09:00–17:00 UTC — evenings/weekends aren't counted)
- **Live SLA countdown** on each ticket ("due in 3h" / "overdue by 1h")
- A scheduled job flags breached tickets, **auto-escalates** the priority one
  level on a first-response breach, and notifies the assignee + admins

### Ticket productivity
- **Edit** a ticket's title/description (creator or staff, until closed)
- **Satisfaction rating (CSAT)** — requesters rate resolved tickets 1–5 with feedback
- **Tags/labels** — color-coded, admin-managed, assignable per ticket
- **Bulk actions** for staff — select multiple tickets to set status, assign to
  self, add a tag, or delete (admin)
- **Canned responses** — reusable reply snippets technicians insert into comments
- **CSV export** of the (filtered) ticket list
- **Auto-assignment** — optionally load-balance new tickets to the technician
  with the fewest active tickets (admin toggle)

### Knowledge base
- Searchable help articles at `/kb`; technicians/admins create, edit, publish,
  and delete articles (drafts are staff-only)

### Experience
- **Dark mode** with a toggle (respects system preference, no flash on load)
- **Loading skeletons**, an error boundary, and a custom 404
- Pagination, sorting, and search on ticket lists
- Accessibility: skip link, keyboard/Escape handling, ARIA labels

### Employee
- Submit tickets (title, description, category, priority, department, attachments)
- View own tickets with search & filters
- Dashboard: open / pending / resolved counts + recent tickets
- Reply to technician comments
- Close resolved tickets (and reopen closed ones)
- Edit profile (name, job title, phone, department)

### Technician
- Dashboard: assigned & open, high-priority, resolved today, performance stats
- Unassigned queue
- Assign tickets to themselves
- Update status / priority / category / assignee / department
- Add public replies and **internal troubleshooting notes** (hidden from requester)
- Search & filter across all tickets

### Administrator
- Dashboard: total users, tickets by status, tickets by department, recent activity
- Manage users — assign technician/admin roles, set departments, delete users
- Create / edit / delete departments
- Analytics with charts (status, priority, category, department)
- Priority configuration with response-time targets (SLAs)
- View all tickets

## Roles & Permissions

| Capability                              | Employee | Technician | Admin |
| --------------------------------------- | :------: | :--------: | :---: |
| Register / login / edit own profile     |    ✅    |     ✅     |  ✅   |
| Submit a ticket                         |    ✅    |     ✅     |  ✅   |
| View own tickets                        |    ✅    |     ✅     |  ✅   |
| View **all** tickets                    |    —     |     ✅     |  ✅   |
| Comment / reply on a ticket             |    ✅    |     ✅     |  ✅   |
| Add internal troubleshooting notes      |    —     |     ✅     |  ✅   |
| Close own **resolved** ticket           |    ✅    |     ✅     |  ✅   |
| Assign ticket to self                   |    —     |     ✅     |  ✅   |
| Update status / priority / category     |    —     |     ✅     |  ✅   |
| Manage users & roles                    |    —     |     —      |  ✅   |
| Create / edit / delete departments      |    —     |     —      |  ✅   |
| View analytics & priority configuration |    —     |     —      |  ✅   |

Employees only ever see their own tickets, and internal notes are stripped from
their view. Route access is enforced server-side via guards, and every API
route handler re-checks the caller's role.

## Data Model

Managed with Prisma (`prisma/schema.prisma`):

- **User** — name, email, hashed password, `role` (EMPLOYEE / TECHNICIAN / ADMIN),
  job title, phone, department
- **Department** — name, description; has members and tickets
- **Ticket** — human-friendly auto-increment `number`, title, description,
  `status` (OPEN / IN_PROGRESS / PENDING / RESOLVED / CLOSED),
  `priority` (LOW / MEDIUM / HIGH / URGENT),
  `category` (HARDWARE / SOFTWARE / NETWORK / ACCOUNT / EMAIL / SECURITY / OTHER),
  creator, assignee, department, `createdAt` / `updatedAt` / `resolvedAt`,
  plus SLA fields `firstResponseAt` and `slaBreached`
- **Comment** — body, `isInternal` flag, author, ticket
- **Attachment** — filename, content type, data (blob URL or base64), ticket
- **AuditLog** — action, summary, actor, ticket, timestamp
- **Notification** — user, type, message, ticket, read flag
- **PasswordResetToken** — token, expiry, used flag
- NextAuth tables — `Account`, `Session`, `VerificationToken`

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://"
AUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_SECRET="<same value>"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"
```

For production, create a free PostgreSQL database on [Neon](https://neon.tech)
and use its connection string.

### 3. Set up the database

```bash
npm run db:push   # create tables from the Prisma schema
npm run db:seed   # load demo departments, users, and tickets
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Validated at startup with Zod (see `src/lib/env.ts`) so misconfiguration fails
fast with a clear message.

| Variable                   | Required | Purpose                                                        |
| -------------------------- | :------: | ------------------------------------------------------------- |
| `DATABASE_URL`             |    ✅    | PostgreSQL connection string                                  |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | ✅ | Session/JWT signing secret (at least one required)         |
| `NEXTAUTH_URL`             |    –     | Base URL of the deployment                                    |
| `AUTH_TRUST_HOST`          |    –     | Set to `true` behind a proxy / on Vercel                     |
| `APP_URL`                  |    –     | Public URL for links in emails (falls back to `NEXTAUTH_URL`) |
| `RESEND_API_KEY`           |    –     | Enables real email delivery (else emails log to console)      |
| `EMAIL_FROM`               |    –     | From address for outgoing email                               |
| `BLOB_READ_WRITE_TOKEN`    |    –     | Enables Vercel Blob attachment storage (else base64 in DB)    |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | – | Distributed rate limiting (else in-memory) |
| `CRON_SECRET`              |    –     | Bearer token required to call the SLA cron endpoint           |

Every optional integration **degrades gracefully** when unset, so the app runs
fully with just the required variables.

## Demo Accounts

All seeded accounts use the password **`password123`**:

| Role       | Email                    |
| ---------- | ------------------------ |
| Admin      | `admin@helphub.dev`      |
| Technician | `tech@helphub.dev`       |
| Technician | `morgan@helphub.dev`     |
| Employee   | `employee@helphub.dev`   |
| Employee   | `jordan@helphub.dev`     |

## Scripts

| Script              | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Start the dev server               |
| `npm run build`     | Generate Prisma client + build     |
| `npm run start`     | Start the production server        |
| `npm run lint`      | Run ESLint                         |
| `npm run db:push`   | Push the Prisma schema to the DB   |
| `npm run db:seed`   | Seed demo data                     |
| `npm run db:studio` | Open Prisma Studio                 |
| `npm test`          | Run unit tests (Vitest)            |
| `npm run test:watch`| Run tests in watch mode            |

## Testing

Unit tests cover the security-critical and pure logic with **Vitest**:

- `src/lib/permissions.test.ts` — role checks and the employee ticket-update rules
- `src/lib/sla.test.ts` — SLA due-time and breach calculations
- `src/lib/tickets.test.ts` — role-scoped query building and sort ordering
- `src/lib/validation.test.ts` — Zod input schemas

```bash
npm test
```

The GitHub Actions workflow (`.github/workflows/ci.yml`) spins up a PostgreSQL
service and runs lint, tests, and build on every push and pull request.

## API Reference

All routes are Next.js Route Handlers under `src/app/api`. They require an
authenticated session (except NextAuth's own endpoints) and enforce role checks.

| Method | Endpoint                        | Roles                | Description                                        |
| ------ | ------------------------------- | -------------------- | ------------------------------------------------- |
| `*`    | `/api/auth/[...nextauth]`       | Public               | NextAuth sign-in / session / callback endpoints   |
| `POST` | `/api/tickets`                  | Any authenticated    | Create a ticket (with optional attachments)       |
| `PATCH`| `/api/tickets/:id`              | Owner / Tech / Admin | Update status (owner: close/reopen only) or fields|
| `POST` | `/api/tickets/:id/assign`       | Tech / Admin         | Assign the ticket to the current user             |
| `POST` | `/api/tickets/:id/comments`     | Owner / Tech / Admin | Add a comment or internal note                    |
| `POST` | `/api/tickets/:id/rate`         | Owner                | Submit a satisfaction rating (CSAT)               |
| `PUT`  | `/api/tickets/:id/tags`         | Tech / Admin         | Set the ticket's tags                             |
| `POST` | `/api/tickets/bulk`             | Tech / Admin         | Bulk status/assign/tag/delete                     |
| `GET`  | `/api/tickets/export`           | Any authenticated    | CSV export of the filtered ticket list            |
| `GET`/`POST` | `/api/tags` · `/api/tags/:id` | Admin           | Manage tags                                       |
| `GET`/`POST` | `/api/canned` · `/api/canned/:id` | Admin       | Manage canned responses                           |
| `POST`/`PATCH`/`DELETE` | `/api/kb` · `/api/kb/:id` | Tech / Admin | Manage knowledge-base articles              |
| `PATCH`| `/api/admin/settings`           | Admin                | Toggle auto-assignment                            |
| `GET`  | `/api/notifications/stream`     | Any authenticated    | Server-Sent Events stream of unread count         |
| `PATCH`| `/api/profile`                  | Any authenticated    | Update the current user's profile                 |
| `POST` | `/api/departments`              | Admin                | Create a department                               |
| `PATCH`| `/api/departments/:id`          | Admin                | Rename / edit a department                        |
| `DELETE`| `/api/departments/:id`         | Admin                | Delete a department                               |
| `PATCH`| `/api/users/:id`                | Admin                | Change a user's role / department                 |
| `DELETE`| `/api/users/:id`               | Admin                | Delete a user                                     |
| `GET`  | `/api/notifications`            | Any authenticated    | List recent notifications + unread count          |
| `PATCH`| `/api/notifications`            | Any authenticated    | Mark all notifications read                        |
| `PATCH`| `/api/notifications/:id`        | Owner                | Mark a single notification read                    |
| `GET`  | `/api/cron/sla`                 | Cron (Bearer token)  | Flag SLA-breached tickets and notify owners        |

## Background Jobs (SLA)

`GET /api/cron/sla` scans active (unresolved) tickets, marks any that have missed
their first-response SLA target as breached, and notifies the assignee + admins.

On Vercel it runs on the schedule in `vercel.json` (daily by default, which the
Hobby plan supports — upgrade to Pro for more frequent runs, e.g. `*/15 * * * *`).
Protect it by setting `CRON_SECRET`; the endpoint then requires an
`Authorization: Bearer <CRON_SECRET>` header (Vercel Cron sends this
automatically). You can trigger it manually for testing:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/sla
```

## Deploying to Vercel

1. Push this repo to GitHub and import it into Vercel.
2. Add the environment variables (`DATABASE_URL`, `AUTH_SECRET`,
   `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_TRUST_HOST`) in the Vercel project
   settings. Use a Neon PostgreSQL connection string for `DATABASE_URL`.
3. The `build` script runs `prisma generate` automatically. Run
   `npm run db:push` against your production database once (locally or via a CI
   step) to create the schema, then optionally `npm run db:seed`.

## Project Structure

```
prisma/
  schema.prisma        # data models (User, Ticket, Comment, Attachment, Department, AuditLog, Notification, …)
  seed.ts              # demo data
prisma.config.ts       # Prisma config (schema + seed)
vercel.json            # Vercel Cron schedule for SLA checks
.github/workflows/     # CI (lint + test + build with a Postgres service)
src/
  auth.ts              # NextAuth v5 server instance (Credentials + Prisma)
  auth.config.ts       # Edge-safe base auth config (used by middleware)
  middleware.ts        # Route protection via the authorized callback
  app/
    (auth)/            # login, register, forgot/reset password
    (app)/             # authenticated area (dashboards, tickets, admin, profile, notifications)
    api/               # route handlers (tickets, comments, users, departments, profile, notifications, cron)
  components/          # UI primitives, app shell, charts, icons, theme toggle
  lib/                 # prisma, env, guards, permissions, validation, sla,
                       # email, notifications, audit, ratelimit, storage, helpers
  lib/*.test.ts        # Vitest unit tests
```

## Notes & Limitations

- Attachments fall back to base64 data URLs in the database (2 MB per file) when
  `BLOB_READ_WRITE_TOKEN` is not set. Configure Vercel Blob for production so
  files are stored in object storage instead.
- Without `RESEND_API_KEY`, emails are logged to the server console and password
  reset links are surfaced in-app so flows still work locally.
- The in-memory rate limiter is per-instance; set the Upstash variables for
  correct limiting across multiple serverless instances.
- Session role is captured at login. When an admin changes a user's role, the
  affected user is notified and the new role takes effect on their next sign-in.
