# 40158958_CSC7057

# Loop - MSc Software Development Dissertation

Loop is a web-based query management platform that supports two-way communication between community pharmacies and GP surgeries in NI. It acts as a replacement to telephone lines and emails with the ability to track status and resolution of routine queries across an entire organisation.

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

server/
src/
config/
controllers/
services/
routes/
middleware/
types/
utils/
_tests_/

client/
src/
api/
components/
context/
hooks/
pages/
types/
utils/

--

## Setup

1. Clone repository
   git clone https://github.com/mcnamee-j/40158958_CSC7057.git

2. Install dependencies
   cd app

cd server && npm install
cd ../client && npm install

3. Environment variables
   Add .env for server...

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

Then add client .env ...

VITE_API_URL=http://localhost:3000

4. Database Setup

5. Email (development) Setup
   Password reset and staff invitation emails are sent via a local SMTP
   catcher rather than a real mail provider in development.

Download Mailpit from brew
brew install mailpit

Now run Mailpit
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

## Testing

--

## CI

GitHub Actions runs on every push to main, develop, and sprint\*
branches: installs dependencies, loads a fresh schema + seed into a
throwaway Postgres container, type-checks, runs the full Vitest suite, and
builds the server.

--

## Design Decisions
