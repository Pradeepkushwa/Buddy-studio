# BuddyStudio API (Rails 8.1)

Backend API for BuddyStudio photography studio: auth, bookings, equipment, and admin.

## Versions

- **Ruby** 3.2+ (recommended: 3.4.x). Set via `.ruby-version` or `rbenv install 3.4.7`
- **Rails** 8.1
- **Database** SQLite3 (development); use PostgreSQL for production if you prefer.

## Setup

1. **Install Ruby 3.4** (if using rbenv):

   ```bash
   rbenv install 3.4.7
   cd backend && rbenv local 3.4.7
   ```

2. **Install dependencies**

   ```bash
   cd backend
   bundle install
   ```

3. **Database**

   ```bash
   bin/rails db:create db:migrate db:seed
   ```

4. **Run the server**

   ```bash
   bin/rails server -p 3001
   ```

   API base URL: `http://localhost:3001`

## Auth endpoints

- `POST /auth/signup` – sign up (body: `email`, `password`, `password_confirmation`, `name`, optional `role`: user | staff)
- `POST /auth/verify_otp` – verify email OTP (body: `email`, `otp_code`)
- `POST /auth/resend_otp` – resend OTP (body: `email`)
- `POST /auth/login` – login (body: `email`, `password`)
- `GET /auth/me` – current user (header: `Authorization: Bearer <token>`)

## Admin (requires admin token)

- `GET /admin/staff` – list staff
- `PATCH /admin/staff/:id/approve` – approve staff
- `PATCH /admin/staff/:id/reject` – set staff back to pending

## Default admin (after seed)

- Email: `admin@buddystudio.com`
- Password: `admin123` (change in production)

## Email (development)

Emails (e.g. OTP) are written to `tmp/mails`. Configure SMTP in production.
