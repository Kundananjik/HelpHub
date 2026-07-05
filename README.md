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
- [Demo Accounts](#demo-accounts)
- [Scripts](#scripts)
- [API Reference](#api-reference)
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
- **Zod** — request/schema validation
- **bcryptjs** — password hashing
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
  creator, assignee, department, `createdAt` / `updatedAt` / `resolvedAt`
- **Comment** — body, `isInternal` flag, author, ticket
- **Attachment** — filename, content type, base64 data, ticket
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
| `PATCH`| `/api/profile`                  | Any authenticated    | Update the current user's profile                 |
| `POST` | `/api/departments`              | Admin                | Create a department                               |
| `PATCH`| `/api/departments/:id`          | Admin                | Rename / edit a department                        |
| `DELETE`| `/api/departments/:id`         | Admin                | Delete a department                               |
| `PATCH`| `/api/users/:id`                | Admin                | Change a user's role / department                 |
| `DELETE`| `/api/users/:id`               | Admin                | Delete a user                                     |

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

## Notes & Limitations

- Attachments are stored as base64 data URLs in the database for simplicity
  (2 MB per file limit). For a production deployment, swap this for object
  storage (e.g. Vercel Blob or S3).
- Password reset links are surfaced in the UI for demo purposes; wire up an email
  provider to send them in production.
- Priority SLAs on the admin *Priorities* page are presented as response-time
  targets for reference; they are not enforced by background automation.
