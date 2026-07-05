# HelpHub — IT Service Desk

A lightweight IT service desk (think ServiceNow / Jira Service Management) where
**employees** submit IT issues, **technicians** manage and resolve tickets, and
**administrators** oversee users, departments, and analytics.

## Tech Stack

- **Next.js 15** (App Router, Server Components, Route Handlers)
- **TypeScript**
- **Tailwind CSS v4**
- **Prisma ORM** with **PostgreSQL** (Neon-ready)
- **Auth.js / NextAuth v5** (credentials + JWT sessions, role-based access)
- **Recharts** for analytics
- Deployable to **Vercel**

## Features

### Authentication
- Email/password **login** & **registration**
- **Forgot / reset password** flow (token-based; the demo surfaces the reset link
  in-app instead of sending an email)
- **Role-based access control** — Employee, Technician, Administrator

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

### Ticket model
Each ticket has: ID + human-friendly number, title, description, department,
priority, status, category, assigned technician, attachments, comments,
created/updated timestamps, and a resolved timestamp.

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
DATABASE_URL="postgresql://user:password@host:5432/helphub?schema=public&sslmode=require"
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

## Demo accounts

All seeded accounts use the password **`password123`**:

| Role       | Email                    |
| ---------- | ------------------------ |
| Admin      | `admin@helphub.dev`      |
| Technician | `tech@helphub.dev`       |
| Technician | `morgan@helphub.dev`     |
| Employee   | `employee@helphub.dev`   |
| Employee   | `jordan@helphub.dev`     |

## Scripts

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server                 |
| `npm run build`   | Generate Prisma client + build       |
| `npm run start`   | Start the production server          |
| `npm run lint`    | Run ESLint                           |
| `npm run db:push` | Push the Prisma schema to the DB     |
| `npm run db:seed` | Seed demo data                       |
| `npm run db:studio` | Open Prisma Studio                 |

## Deploying to Vercel

1. Push this repo to GitHub and import it into Vercel.
2. Add the environment variables (`DATABASE_URL`, `AUTH_SECRET`,
   `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_TRUST_HOST`) in the Vercel project
   settings. Use a Neon PostgreSQL connection string for `DATABASE_URL`.
3. The `build` script runs `prisma generate` automatically. Run
   `npm run db:push` against your production database once (locally or via a CI
   step) to create the schema, then optionally `npm run db:seed`.

## Project structure

```
prisma/
  schema.prisma        # data models (User, Ticket, Comment, Attachment, Department, …)
  seed.ts              # demo data
src/
  auth.ts              # NextAuth v5 configuration
  app/
    (auth)/            # login, register, forgot/reset password
    (app)/             # authenticated area (dashboards, tickets, admin, profile)
    api/               # route handlers (tickets, comments, users, departments, profile)
  components/          # UI primitives, app shell, charts, icons
  lib/                 # prisma client, guards, validation, helpers, constants
```

## Notes

- Attachments are stored as base64 data URLs in the database for simplicity
  (2 MB per file limit). For a production deployment, swap this for object
  storage (e.g. Vercel Blob or S3).
- Password reset links are surfaced in the UI for demo purposes; wire up an email
  provider to send them in production.
