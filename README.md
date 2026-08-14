# 40158958_CSC7057

# Loop - MSc Software Development Dissertation

Loop is a web-based query management platform that supports two-way communication between community pharmacies and GP
surgeries in NI. It acts as a replacement to telephone lines and emails with the ability to track status and resolution
of routine queries across an entire organisation.

--

## Tech Stack

Backend - Node.js, Express, TypeScript
Database - PostgreSQL
Frontend - React, Vite, TypeScript, Tailwind CSS
Testing - Vitest, Supertest
Email - Nodemailer, Mailpit
CI - GitHub Actions

--

## Project Structure

App folder contains server and client which are two independently run applications:

```
app/
  server/           Express + TypeScript API
    src/
      config/       DB connection, schema + seed SQL
      controllers/  Request/response handling per
                     each group of routes
      services/     Business logic -> all DB queries
      routes/       Express routes
      middleware/    authenticate, authorise,
                     + error_handler
      types/        TypeScript type definitions
      utils/        Helper functions (ref number
                     generation, etc.)
    __tests__/      Vitest + Supertest integration
                     tests

  client/           React + Vite frontend
    src/
      api/          One file per backend route group
      components/   UI components(layout, route guards,
                     badges, query cards)
      context/      AuthContext / AuthProvider
      hooks/        useAuth, useTimeout
      pages/        One folder per route group (auth,
                     dashboard, queries, admin, staff)
      types/        Frontend types - match backend
                     response
      utils/        Helper functions
```

--

## Setup

1. Clone repository
   git clone https://github.com/mcnamee-j/40158958_CSC7057.git

2. Install dependencies
   cd app

   cd server && npm install
   cd ../client && npm install

3. Environment variables
   Add server/.env ...

   SERVER_PORT = 3000
   CLIENT_URL = 'http://localhost:5173'

   DB_HOST = 'localhost'
   DB_PORT = 5432
   DB_NAME = '40158958_project'
   DB_USER = jamesmcnamee
   DB_PASSWORD = ''

   ACCESS_SECRET = 52d48d32dbefd3943ce5b86a7acf0443d8459937c42c2eeaa40f44bee1fa6fda

   MAIL_HOST = 'localhost'
   MAIL_PORT = 1025
   MAIL_USER =
   MAIL_PASS =
   MAIL_FROM = 'noreply@loop.com'
   APP_URL = 'http://localhost:5173'

Then add client/.env ...

VITE_API_URL=http://localhost:3000

4. Database Setup
   Create PostgreSQL database, then load the schema and seed the data:

createdb 40158958_project
psql -d 40158958_project -f server/src/config/40158958_project.sql
psql -d 40158958_project -f server/src/config/db.sql

The schema file (40158958_project.sql) defines each table and any ENUM types.
The seed file (db.sql) seeds some test data:

ALL SEEDED USERS SHARE SAME PASSWORD - Password123!

- 5 users:
  Pharmacy-based users:
  - Jane Doe (Pharmacy Staff): Login - email: jane@pharmacy.com
  - Mark Reid (Pharmacy Manager): Login - email: mark@pharmacy.com

  GP Practice-based users:
  - Sarah Conn (Practice staff): Login - email: sarah@surgery.com
  - Tom Walsh (Practice manager): Login - email: tom@surgery.com

  Admin user:
  - email: admin@loop.com

- 3 organisations
  2 Pharmacies:
  - City Pharmacy Belfast
  - Riverside Pharmacy (unlinked to test access-control)

  1 Surgery:
  - Hillview Surgery

- 1 link
  Hillview Surgery is linked to City Pharmacy Belfast

5. Email (development) Setup
   Password reset and staff invitation emails are sent via a local SMTP
   catcher rather than a real mail provider being used in development.

Download Mailpit from brew:
brew install mailpit

Now run Mailpit:
mailpit

View sent emails at `http://localhost:8025`.

6. Running the app
   Two terminals requried

   Terminal 1:
   cd server && npm run dev

   Terminal 2:
   cd client && npm run dev

   The client runs on `http://localhost:5173`, the API on `http://localhost:3000`.

--

## API

Refer to API.md for a fully documented overview of the system API.

--

## Testing

Backend Testing - Vitest & Supertest

- Tests run against mock database (loop_test) by default
- This is configured in server/vite/config.ts
- Tests are NEVER run against core database

Commands (in server directory):

1. Run tests once:
   npm test

2. Watch mode (i.e. run everytime a change is saved - used for development)
   npm run test:watch

3. Generate coverage report
   npm run test:coverage

Test files are run sequentially (fileParallelism: false) - as they share a real database. Each test file truncates tables using - beforeall - so each test run starts from a clean starting point.

Frontend Testing - Vitest

Commands (in client directory)
npm test

--

## CI

GitHub Actions runs on every push to main, develop, and sprint\*
branches: installs dependencies, loads a fresh schema + seed into a
throwaway Postgres container, type-checks, runs the full Vitest
suite, and builds the server.

--

## Design Decisions

- Access Tokens
  Live in memory only (not in localStorage).
  Refresh tokens are stored in localStorage, however these can be
  revoked server-side through account deactivation
- 20 minute inactivity timeout, auto-logout
  User activity is tracked client-side using interaction events (ACTIVE_EVENTS constant in useTimeout hook).
  This includes "mousmove", "scroll", "click" or "keydown"
- Audit log and Queries are APPEND-ONLY!
  There are no endpoints in the system which delete one of the following:
  - a query
  - a query reply
  - an audit log entry
  - a user or organsiation (can only be deactivated i.e., access blocked)
    This is because traceability is key when patient safety is at stake. If incidents occur,
    the audit log shall show a complete history surrounding a query and who was involved.
    This cannot be edited or deleted for this reason.
- Admin accounts sit in their own dedicated "system" organisation in the database.
  This ensured they do not access pharmacy or GP practice workflows and are never included in reporting statistics.
