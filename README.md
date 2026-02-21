# BuddyStudio

Full-stack web application for a photography studio. Handles bookings, availability, team management, expense tracking, equipment availability, revenue, and profit.

**Current Phase**: Phase 2 -- Dynamic Packages, Homepage, and Appointments

## Tech Stack

- **Backend**: Ruby on Rails 8.1 (API-only mode), Ruby >= 3.2.0
- **Frontend**: React 18 with React Router DOM
- **Database**: SQLite3 (development)
- **Authentication**: JWT (JSON Web Tokens) + bcrypt password hashing
- **Email**: Gmail SMTP for live OTP delivery

## What's Built So Far

### Phase 1 -- Authentication and User Management
- Signup with email OTP verification (live Gmail SMTP)
- Login with JWT token-based authentication
- Three roles: Admin, Staff, User (Customer)
- Staff approval workflow (admin approves before staff can access dashboard)
- Admin panel with Staff and Customers management

### Phase 2 -- Dynamic Packages, Homepage, and Appointments
- **Public homepage** with hero, category grid, featured packages, appointment form
- **Equipment master list** -- admin creates studio equipment (cameras, drones, albums, etc.)
- **Categories** -- Wedding, Birthday, Single Event, Personal Wedding Shoot (admin-managed)
- **Dynamic packages** -- admin creates packages with equipment items, pricing, discounts
- **Auto-calculated offer price** -- set discount %, offer price calculates automatically
- **Package detail page** -- full breakdown of included equipment with "Book Now" flow
- **Appointment booking** -- visitors submit inquiries (no login required for homepage form)
- **Admin panel** restructured with sidebar navigation: Staff, Customers, Equipment, Categories, Packages, Appointments

## Architecture

```
React Frontend (port 3000)          Rails API Backend (port 3001)
┌──────────────────────┐            ┌──────────────────────────────┐
│  Navbar              │            │  Public Endpoints            │
│  ├── Home (/)        │   HTTP     │  ├── GET /categories         │
│  ├── Packages        │ ─────────> │  ├── GET /packages           │
│  ├── PackageDetail   │  Bearer    │  ├── GET /packages/:id       │
│  ├── Auth pages      │  Token     │  ├── POST /appointments      │
│  ├── Dashboard       │            │  ├── Auth endpoints          │
│  └── Admin (sidebar) │            │  └── Admin endpoints (CRUD)  │
│      ├── Staff       │            │                              │
│      ├── Customers   │            │  Models                      │
│      ├── Equipment   │            │  ├── User (auth + roles)     │
│      ├── Categories  │            │  ├── Equipment (master list) │
│      ├── Packages    │            │  ├── Category                │
│      └── Appointments│            │  ├── Package (with items)    │
└──────────────────────┘            │  └── Appointment             │
                                    └──────────────────────────────┘
```

## Quick Start

### Backend

```bash
cd backend
rbenv install 3.4.7        # or whichever 3.2+ version you have
bundle install
cp .env.example .env       # then fill in SMTP credentials
bin/rails db:create db:migrate db:seed
bin/rails server -p 3001
```

### Frontend

```bash
cd frontend
npm install
npm start                   # runs on port 3000
```

### Default Admin

- Email: `admin@buddystudio.com`
- Password: `admin123`

## User Flow

1. **Visitor** lands on homepage, browses categories and featured packages
2. **Visitor** clicks a package, sees full detail with equipment breakdown
3. **Visitor** clicks "Book Now" -- redirected to signup if not logged in
4. **Logged-in user** fills inquiry form, appointment is created
5. **Visitor** can also submit appointment from homepage form (no login needed)
6. **Admin** manages everything: equipment, categories, packages (with pricing/discounts), appointment status

## API Endpoints

### Public (no auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List active categories |
| GET | `/packages` | List active packages (optional `?category_id=X`) |
| GET | `/packages/:id` | Package detail with item breakdown |
| POST | `/appointments` | Create appointment inquiry |
| POST | `/auth/signup` | Create account, sends OTP |
| POST | `/auth/login` | Authenticate, returns JWT |
| POST | `/auth/verify_otp` | Verify email OTP |
| POST | `/auth/resend_otp` | Resend OTP |
| GET | `/auth/me` | Current user (requires JWT) |

### Admin (requires admin JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PATCH/DELETE | `/admin/equipments` | Equipment CRUD |
| GET/POST/PATCH/DELETE | `/admin/categories` | Category CRUD |
| GET/POST/PATCH/DELETE | `/admin/packages` | Package CRUD (with nested items) |
| GET/PATCH | `/admin/appointments` | Appointment list + status update |
| GET | `/admin/staff` | List staff |
| PATCH | `/admin/staff/:id/approve` | Approve staff |
| PATCH | `/admin/staff/:id/reject` | Reject staff |
| GET | `/admin/customers` | List customers |

## Database Schema

### users
Auth and roles (email, password, name, mobile, role, OTP fields, verification status)

### equipment
Master list of studio gear (name, equipment_type, description, active)

Types: `photography_camera`, `videography_camera`, `drone`, `lighting`, `album`, `video`, `other`

### categories
Package groupings (name, description, image_url, position, active)

### packages
Photography offerings (name, description, category_id, price, discount_percentage, offer_price, active, featured)

Offer price auto-calculates: `price - (price * discount% / 100)`

### package_items
Equipment included in a package (package_id, equipment_id, quantity, notes)

### appointments
Booking inquiries (name, email, mobile, package_id, preferred_date, event_type, message, status)

Status: `new` -> `contacted` -> `completed` | `cancelled`

## Project Structure

```
Buddy-studio/
├── backend/                         # Rails 8.1 API
│   ├── app/
│   │   ├── controllers/
│   │   │   ├── auth_controller.rb
│   │   │   ├── categories_controller.rb    (public)
│   │   │   ├── packages_controller.rb      (public)
│   │   │   ├── appointments_controller.rb  (public)
│   │   │   ├── admin/
│   │   │   │   ├── staff_controller.rb
│   │   │   │   ├── customers_controller.rb
│   │   │   │   ├── equipments_controller.rb
│   │   │   │   ├── categories_controller.rb
│   │   │   │   ├── packages_controller.rb
│   │   │   │   └── appointments_controller.rb
│   │   │   └── concerns/
│   │   │       └── jwt_authenticatable.rb
│   │   ├── models/
│   │   │   ├── user.rb
│   │   │   ├── equipment.rb
│   │   │   ├── category.rb
│   │   │   ├── package.rb
│   │   │   ├── package_item.rb
│   │   │   └── appointment.rb
│   │   └── mailers/
│   ├── config/
│   │   ├── routes.rb
│   │   └── initializers/cors.rb
│   ├── db/
│   │   ├── migrate/
│   │   └── seeds.rb
│   └── .env.example
├── frontend/                        # React 18
│   └── src/
│       ├── api.js
│       ├── context/AuthContext.js
│       ├── components/
│       │   ├── Navbar.js
│       │   └── ProtectedRoute.js
│       ├── pages/
│       │   ├── Home.js              (public homepage)
│       │   ├── Packages.js          (package listing)
│       │   ├── PackageDetail.js     (package detail + book now)
│       │   ├── Signup.js
│       │   ├── Login.js
│       │   ├── VerifyOtp.js
│       │   ├── PendingApproval.js
│       │   ├── Dashboard.js
│       │   └── admin/
│       │       ├── AdminLayout.js   (sidebar layout)
│       │       ├── AdminStaffPage.js
│       │       ├── AdminCustomersPage.js
│       │       ├── AdminEquipment.js
│       │       ├── AdminCategories.js
│       │       ├── AdminPackages.js
│       │       └── AdminAppointments.js
│       ├── App.js
│       └── App.css
└── README.md
```

## Phase 2 Changes -- Why We Added What

| What | Why |
|------|-----|
| Equipment model + admin CRUD | Admin needs a master list of cameras, drones, albums, etc. to reuse across packages |
| Category model | Group packages by event type (wedding, birthday, etc.) for easy browsing |
| Package model with `before_save :calculate_offer_price` | Auto-calculate discounted price so admin only enters price + discount % |
| PackageItem join table | Link equipment to packages with quantity and notes (e.g., "2x Canon R5 with lighting") |
| Appointment model | Capture visitor inquiries without requiring login |
| Public homepage with Navbar | Landing page with hero, categories, featured packages, appointment form |
| Package listing with category filter | Browse and filter all active packages |
| Package detail + Book Now | Show full equipment breakdown, redirect to signup or inquiry form |
| Admin sidebar layout | Replace tabs with sidebar navigation as admin sections grew from 2 to 6 |
| `accepts_nested_attributes_for` on Package | Create/update package items in a single API call |
