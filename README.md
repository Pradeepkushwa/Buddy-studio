# BuddyStudio

Full-stack web application for a photography studio. Handles bookings, availability, team management, equipment, packages, gallery, reviews, and customer management.

**Current Phase**: Phase 4 -- Profile Management, Forgot Password, Approval Workflows

## Tech Stack

- **Backend**: Ruby on Rails 8.1 (API-only mode), Ruby >= 3.2.0
- **Frontend**: React 18 with React Router DOM
- **Database**: SQLite3 (development), PostgreSQL (production)
- **Authentication**: JWT (JSON Web Tokens) + bcrypt password hashing
- **Email**: Gmail SMTP for live OTP delivery (signup, password reset, email change)
- **Styling**: Custom CSS with black & gold theme, fully responsive (320px+)

## Quick Start

### Backend

```bash
cd backend
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

- Email: `...........`
- Password: `..........`

### SMTP Configuration (.env)

```
MAILER_FROM=.........
SMTP_USERNAME=.......
SMTP_PASSWORD=<app-password>
```

---

## Features by Phase

### Phase 1 -- Authentication & User Management

- **Signup** with email OTP verification (live Gmail SMTP, 6-digit code, 10-min expiry)
- **Login** with JWT token-based authentication
- **Three roles**: Admin, Staff, User (Customer)
- **Staff approval workflow**: Staff signup -> email OTP verified -> status = "pending" -> Admin approves -> Staff can login
- **Admin panel** with Staff list (approve/reject) and Customers list
- **Mobile number** field for all users

### Phase 2 -- Dynamic Packages, Homepage & Appointments

- **Public homepage** with hero section, category grid, featured packages, appointment form
- **Equipment master list**: Admin creates studio equipment (cameras, drones, albums, lighting, etc.)
- **Categories**: Wedding, Birthday, Single Event, Personal Wedding Shoot (admin-managed, with position ordering)
- **Dynamic packages**: Admin creates packages with equipment items, pricing, discounts
- **Auto-calculated offer price**: Set discount %, offer price = `price - (price * discount% / 100)`
- **Package detail page**: Full equipment breakdown with "Book Now" flow
- **Appointment booking**: Visitors submit inquiries from homepage (no login required)
- **Admin sidebar navigation**: Staff, Customers, Equipment, Categories, Packages, Appointments

### Phase 3 -- Bookings, Staff Panel, Gallery, Reviews & Dashboard

- **Booking system**:
  - User selects package -> logs in (redirected back) -> fills booking form (event dates, address, phone, email, alternate contact, notes) -> static payment page
  - Booking statuses: `pending` -> `confirmed` -> `upcoming` -> `completed` | `cancelled`
  - Admin manages bookings with tabbed status view
  - User dashboard shows pending/recent bookings
- **Staff panel** (separate sidebar layout):
  - Staff can add equipment and create packages
  - Staff-created packages require admin approval (`pending_approval` status)
  - **If staff edits an approved package, it automatically resets to `pending_approval`**
  - Staff cannot delete equipment
- **Gallery / Demo section**:
  - Admin/staff upload photos & videos via external URLs
  - Categories: Love Moments, Happy Clients, Events, etc.
  - Public gallery page with category filter
  - Homepage shows top 6 gallery items preview
- **Ratings & feedback system**:
  - Anyone can submit a review (name, email, 1-5 stars, feedback)
  - Reviews require admin approval before showing publicly
  - Homepage shows top 3 approved reviews with scrollable section
  - Average rating displayed in hero section
- **Admin dashboard** with aggregate stats:
  - Customers count, staff count, gallery items, active packages
  - Bookings by status (pending, confirmed, upcoming, completed)
  - Appointments by status (new, contacted, total)
  - Packages & reviews (pending approval, featured, approved reviews, avg rating)
- **Featured packages display**: Sorted by highest discount percentage, shows top 3
- **Black & gold theme** across the entire homepage
- **Full responsiveness**: 4 breakpoints (1024px, 768px, 480px, 360px), mobile hamburger menu, works down to 320px

### Phase 4 -- Profile Management, Forgot Password & Approval Workflows

- **Forgot password** (3-step flow):
  1. Enter email -> OTP sent to email
  2. Verify 6-digit OTP
  3. Enter new password + confirm -> password updated, redirected to login
  - Uses separate `reset_otp` / `reset_otp_sent_at` fields (doesn't conflict with signup OTP)
- **Profile page** (accessible by all roles at `/profile`):
  - **View profile**: Name, email, mobile, role, member since, verification status
  - **Edit details**: Update name and mobile number
  - **Upload avatar**: Click profile picture to upload (jpg/png/gif/webp, max 5MB), saved to `public/uploads/avatars/`
  - **Change email** with OTP verification: Sends code to new email -> verify -> email updated
  - **Staff email change triggers re-approval**: If a staff member changes email, their `verification_status` resets to `pending` and requires admin re-approval
  - Quick action buttons based on role
- **Dashboard improvements**:
  - Welcome bar with avatar, name, email, and "Edit Profile" button
  - Stats row for users: Total Bookings, Active, Completed
  - "My Profile" quick action for all roles
- **Staff layout**: "Home" button replaced with "Profile" button
- **Admin layout**: "Dashboard" button replaced with "Profile" button
- **Package re-approval**: If staff edits an already-approved package, status auto-resets to `pending_approval`

---

## Architecture

```
React Frontend (port 3000)              Rails API Backend (port 3001)
┌───────────────────────────┐           ┌─────────────────────────────────┐
│  Public Pages             │           │  Public Endpoints               │
│  ├── Home (/)             │   HTTP    │  ├── GET /categories            │
│  ├── Packages (/packages) │ ───────>  │  ├── GET /packages             │
│  ├── PackageDetail        │  Bearer   │  ├── GET /packages/:id          │
│  ├── Gallery (/gallery)   │  Token    │  ├── POST /appointments         │
│  ├── Signup / Login       │           │  ├── GET /gallery               │
│  ├── Forgot Password      │           │  ├── GET/POST /reviews          │
│  └── Verify OTP           │           │  ├── Auth endpoints             │
│                           │           │  ├── Password reset endpoints   │
│  Authenticated Pages      │           │  └── Profile endpoints          │
│  ├── Dashboard            │           │                                 │
│  ├── Profile              │           │  Staff Endpoints                │
│  ├── Booking Form         │           │  ├── GET/POST/PATCH equipments  │
│  ├── Payment Page         │           │  └── CRUD packages (w/ approval)│
│  └── My Bookings          │           │                                 │
│                           │           │  Admin Endpoints                │
│  Staff Panel (/staff)     │           │  ├── Dashboard stats            │
│  ├── Equipment            │           │  ├── Staff approve/reject       │
│  ├── My Packages          │           │  ├── CRUD: equipment, categories│
│  └── Profile              │           │  ├── CRUD: packages (approve)   │
│                           │           │  ├── Bookings, appointments     │
│  Admin Panel (/admin)     │           │  ├── Gallery items              │
│  ├── Dashboard (stats)    │           │  └── Reviews (approve/delete)   │
│  ├── Staff management     │           │                                 │
│  ├── Customers            │           │  Models                         │
│  ├── Equipment CRUD       │           │  ├── User (auth + roles + OTP)  │
│  ├── Categories CRUD      │           │  ├── Equipment (master list)    │
│  ├── Packages CRUD        │           │  ├── Category                   │
│  ├── Bookings management  │           │  ├── Package (items + approval) │
│  ├── Appointments         │           │  ├── PackageItem (join table)   │
│  ├── Gallery management   │           │  ├── Appointment                │
│  └── Reviews management   │           │  ├── Booking                    │
└───────────────────────────┘           │  ├── GalleryItem                │
                                        │  └── Review                     │
                                        └─────────────────────────────────┘
```

---

## API Endpoints

### Authentication (no auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Create account, sends OTP email |
| POST | `/auth/login` | Authenticate, returns JWT token |
| POST | `/auth/verify_otp` | Verify email OTP during signup |
| POST | `/auth/resend_otp` | Resend verification OTP |
| GET | `/auth/me` | Current user info (requires JWT) |

### Password Reset (no auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/password/forgot` | Send reset OTP to email |
| POST | `/password/verify_otp` | Verify reset OTP |
| POST | `/password/reset` | Set new password (requires OTP) |

### Profile (requires JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get current user profile |
| PATCH | `/profile` | Update name, mobile number |
| POST | `/profile/avatar` | Upload profile picture (multipart) |
| POST | `/profile/request_email_change` | Send OTP to new email |
| POST | `/profile/verify_email_change` | Verify OTP and update email |

### Public (no auth required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List active categories |
| GET | `/packages` | List active, approved packages |
| GET | `/packages/:id` | Package detail with equipment breakdown |
| POST | `/appointments` | Create appointment inquiry |
| GET | `/gallery` | List active gallery items (optional `?category=X`) |
| GET | `/reviews` | List approved reviews + average rating |
| POST | `/reviews` | Submit a review (name, email, rating, feedback) |

### Authenticated Customer (requires JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bookings` | Create a booking for a package |
| GET | `/bookings/mine` | List current user's bookings |

### Staff (requires staff/admin JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/staff/equipments` | List all equipment |
| POST | `/staff/equipments` | Add new equipment |
| PATCH | `/staff/equipments/:id` | Update equipment |
| GET | `/staff/packages` | List staff's own packages |
| POST | `/staff/packages` | Create package (auto `pending_approval` for staff) |
| PATCH | `/staff/packages/:id` | Update package (resets to `pending_approval` if staff edits) |
| DELETE | `/staff/packages/:id` | Deactivate package |

### Admin (requires admin JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Aggregate stats for admin dashboard |
| GET | `/admin/staff` | List all staff members |
| PATCH | `/admin/staff/:id/approve` | Approve staff member |
| PATCH | `/admin/staff/:id/reject` | Reject staff member |
| GET | `/admin/customers` | List all customers |
| CRUD | `/admin/equipments` | Equipment management |
| CRUD | `/admin/categories` | Category management |
| CRUD | `/admin/packages` | Package management |
| PATCH | `/admin/packages/:id/approve` | Approve staff-created package |
| PATCH | `/admin/packages/:id/reject` | Reject staff-created package |
| GET/PATCH | `/admin/appointments` | Appointment list + status update |
| GET/PATCH | `/admin/bookings` | Booking list + status update |
| CRUD | `/admin/gallery_items` | Gallery management |
| GET/PATCH/DELETE | `/admin/reviews` | Review management (approve/hide/delete) |

---

## Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| email | string | Unique, required |
| password_digest | string | bcrypt hash |
| name | string | |
| mobile_number | string | Validated format |
| role | string | `admin`, `staff`, `user` |
| verification_status | string | `pending`, `approved`, `verified` |
| email_verified | boolean | OTP verified flag |
| otp_code / otp_sent_at | string/datetime | Signup OTP |
| reset_otp / reset_otp_sent_at | string/datetime | Password reset OTP |
| pending_email | string | For email change flow |
| avatar_url | string | Profile picture path |

### equipment
Master list of studio gear: name, equipment_type, description, active

Types: `photography_camera`, `videography_camera`, `drone`, `lighting`, `album`, `video`, `other`

### categories
Package groupings: name, description, image_url, position, active

### packages
| Column | Type | Notes |
|--------|------|-------|
| name | string | Required |
| description | text | |
| category_id | FK | Belongs to category |
| price | decimal | Base price |
| discount_percentage | decimal | 0-100 |
| offer_price | decimal | Auto-calculated: `price - (price * discount% / 100)` |
| active | boolean | Visible to public |
| featured | boolean | Shown on homepage |
| approval_status | string | `approved`, `pending_approval`, `rejected` |
| created_by_id | FK | Staff/admin who created it |

### package_items
Join table: package_id, equipment_id, quantity, notes

### appointments
Inquiry form: name, email, mobile_number, package_id, preferred_date, event_type, message, status

Status: `new` -> `contacted` -> `completed` | `cancelled`

### bookings
| Column | Type | Notes |
|--------|------|-------|
| user_id | FK | Customer who booked |
| package_id | FK | Selected package |
| event_start_date / event_end_date | date | Event duration |
| event_address | text | Venue address |
| phone_number | string | Validated |
| email | string | |
| alternate_contact_number | string | |
| notes | text | Special requests |
| status | string | `pending`, `confirmed`, `upcoming`, `completed`, `cancelled` |
| amount | decimal | Package offer_price at time of booking |

### gallery_items
| Column | Type | Notes |
|--------|------|-------|
| title | string | Required |
| media_url | string | External URL |
| media_type | string | `photo`, `video` |
| category | string | Love Moments, Happy Clients, Events, etc. |
| position | integer | Display ordering |
| active | boolean | |
| uploaded_by_id | FK | Staff/admin who uploaded |

### reviews
| Column | Type | Notes |
|--------|------|-------|
| name | string | Reviewer name |
| email | string | Reviewer email |
| rating | integer | 1-5 stars |
| feedback | text | |
| approved | boolean | Must be approved by admin to show publicly |
| booking_id | FK | Optional link to booking |

---

## User Flows

### Customer Flow
1. Visitor lands on homepage, browses categories and featured packages
2. Clicks a package -> sees full detail with equipment breakdown
3. Clicks "Book Now" -> redirected to login/signup if not logged in
4. After login -> fills booking form (event dates, address, contacts, notes)
5. Submits -> goes to static payment page (gateway coming soon)
6. Views bookings in dashboard under "My Bookings"

### Staff Flow
1. Staff signs up -> verifies email via OTP -> status = "pending"
2. Admin approves staff -> staff can now login
3. Staff can add equipment and create packages (auto `pending_approval`)
4. Admin approves package -> package goes live
5. If staff edits an approved package -> status resets to `pending_approval`
6. If staff changes email -> account goes back to "pending" for admin re-approval

### Admin Flow
1. Logs in -> admin dashboard shows all stats
2. Manages staff (approve/reject), customers, equipment, categories
3. Creates/edits packages (auto-approved for admin)
4. Approves/rejects staff-created packages
5. Manages bookings (update status), appointments, gallery, reviews
6. Approves reviews before they appear publicly

### Password Reset Flow
1. User clicks "Forgot Password?" on login page
2. Enters email -> 6-digit OTP sent to email
3. Enters OTP -> verified
4. Enters new password + confirm -> password updated
5. Redirected to login

### Email Change Flow
1. User goes to Profile -> Email Settings -> Change Email
2. Enters new email -> OTP sent to new email
3. Enters OTP -> email updated
4. **Staff only**: Account goes back to "pending" for admin re-approval

---

## Project Structure

```
Buddy-studio/
├── backend/                              # Rails 8.1 API
│   ├── app/
│   │   ├── controllers/
│   │   │   ├── auth_controller.rb            # Signup, login, OTP verify
│   │   │   ├── password_resets_controller.rb  # Forgot password flow
│   │   │   ├── profile_controller.rb         # Profile CRUD, avatar upload, email change
│   │   │   ├── categories_controller.rb      # Public: list categories
│   │   │   ├── packages_controller.rb        # Public: list/show packages
│   │   │   ├── appointments_controller.rb    # Public: create inquiry
│   │   │   ├── bookings_controller.rb        # Authenticated: create/list bookings
│   │   │   ├── gallery_items_controller.rb   # Public: list gallery
│   │   │   ├── reviews_controller.rb         # Public: list/create reviews
│   │   │   ├── staff/
│   │   │   │   ├── equipments_controller.rb  # Staff: equipment management
│   │   │   │   └── packages_controller.rb    # Staff: package CRUD (with re-approval)
│   │   │   ├── admin/
│   │   │   │   ├── dashboard_controller.rb   # Admin: aggregate stats
│   │   │   │   ├── staff_controller.rb       # Admin: approve/reject staff
│   │   │   │   ├── customers_controller.rb   # Admin: list customers
│   │   │   │   ├── equipments_controller.rb  # Admin: equipment CRUD
│   │   │   │   ├── categories_controller.rb  # Admin: category CRUD
│   │   │   │   ├── packages_controller.rb    # Admin: package CRUD + approve/reject
│   │   │   │   ├── appointments_controller.rb # Admin: appointment management
│   │   │   │   ├── bookings_controller.rb    # Admin: booking status management
│   │   │   │   ├── gallery_items_controller.rb # Admin: gallery CRUD
│   │   │   │   └── reviews_controller.rb     # Admin: review approve/delete
│   │   │   └── concerns/
│   │   │       └── jwt_authenticatable.rb    # JWT encode/decode, role guards
│   │   ├── models/
│   │   │   ├── user.rb             # Auth, roles, OTP, reset OTP
│   │   │   ├── equipment.rb        # Studio gear master list
│   │   │   ├── category.rb         # Package categories
│   │   │   ├── package.rb          # Packages with auto offer_price
│   │   │   ├── package_item.rb     # Package-Equipment join
│   │   │   ├── appointment.rb      # Inquiry form submissions
│   │   │   ├── booking.rb          # Customer bookings
│   │   │   ├── gallery_item.rb     # Photo/video gallery
│   │   │   └── review.rb           # Ratings & feedback
│   │   ├── mailers/
│   │   │   └── user_mailer.rb      # OTP, password reset, email change emails
│   │   └── views/user_mailer/      # Email templates (HTML + text)
│   ├── config/
│   │   ├── routes.rb
│   │   └── initializers/cors.rb
│   ├── db/
│   │   ├── migrate/                # All migrations
│   │   ├── seeds.rb                # Admin user, sample data
│   │   └── schema.rb
│   ├── public/uploads/avatars/     # Profile picture storage
│   └── .env.example
├── frontend/                        # React 18
│   └── src/
│       ├── api.js                  # Axios instance with JWT interceptor
│       ├── context/AuthContext.js   # Auth state management
│       ├── components/
│       │   ├── Navbar.js           # Public navbar with hamburger menu
│       │   ├── ProtectedRoute.js   # Route guard with role checking
│       │   └── StarRating.js       # Reusable star rating component
│       ├── pages/
│       │   ├── Home.js             # Public homepage (hero, categories, packages, gallery, reviews, appointment)
│       │   ├── Packages.js         # Package listing with category filter
│       │   ├── PackageDetail.js    # Package detail + Book Now
│       │   ├── GalleryPage.js      # Full gallery with category tabs
│       │   ├── BookingForm.js      # Event booking form
│       │   ├── PaymentPage.js      # Static payment page
│       │   ├── MyBookings.js       # User's booking list
│       │   ├── Dashboard.js        # User dashboard (welcome, stats, bookings, quick actions)
│       │   ├── ProfilePage.js      # Profile view/edit/avatar/email change
│       │   ├── Signup.js
│       │   ├── Login.js            # Login + "Forgot Password?" link
│       │   ├── ForgotPassword.js   # 3-step password reset
│       │   ├── VerifyOtp.js
│       │   ├── PendingApproval.js
│       │   ├── staff/
│       │   │   ├── StaffLayout.js  # Staff sidebar (Equipment, Packages, Profile)
│       │   │   ├── StaffEquipment.js
│       │   │   └── StaffPackages.js
│       │   └── admin/
│       │       ├── AdminLayout.js  # Admin sidebar (10 nav items + Profile)
│       │       ├── AdminDashboard.js
│       │       ├── AdminStaffPage.js
│       │       ├── AdminCustomersPage.js
│       │       ├── AdminEquipment.js
│       │       ├── AdminCategories.js
│       │       ├── AdminPackages.js  # Package CRUD + approve/reject
│       │       ├── AdminBookings.js  # Tabbed booking management
│       │       ├── AdminAppointments.js
│       │       ├── AdminGallery.js
│       │       └── AdminReviews.js
│       ├── App.js                  # All routes
│       └── App.css                 # All styles (responsive, black & gold theme)
└── README.md
```

---

## Key Design Decisions

| Decision | Reasoning |
|----------|-----------|
| JWT auth (not sessions) | Stateless API, easy React integration, no cookie/CORS issues |
| Separate `otp_code` and `reset_otp` | Signup OTP and password reset OTP don't conflict |
| `pending_email` column | Email change flow: verify new email before switching |
| Staff re-approval on email change | Security: admin should verify staff identity after email change |
| Package re-approval on staff edit | Quality control: admin reviews changes before they go live |
| `offer_price` auto-calculated | Admin only sets price + discount %, no manual calculation errors |
| Avatar stored in `public/uploads/` | Simple file storage, no Active Storage complexity for MVP |
| Single `App.css` file | All styles co-located, easy to search, CSS variables for theming |
| 4 responsive breakpoints | 1024px (tablet), 768px (small tablet), 480px (phone), 360px (small phone) |
| Featured packages by discount | Homepage shows top 3 packages sorted by highest discount % |
