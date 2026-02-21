# BuddyStudio API (Rails 8.1)

Backend API for BuddyStudio photography studio. Handles authentication, role-based access, dynamic packages with pricing/discounts, equipment management, and appointment bookings.

## Versions

- **Ruby** 3.2+ (recommended: 3.4.x via rbenv)
- **Rails** 8.1 (API-only mode)
- **Database** SQLite3 (development)

## Setup

```bash
rbenv install 3.4.7
cd backend && rbenv local 3.4.7
bundle install
cp .env.example .env          # fill in SMTP credentials
bin/rails db:create db:migrate db:seed
bin/rails server -p 3001
```

## Database Schema

### users
| Column | Type | Description |
|--------|------|-------------|
| email | string | Unique login identifier |
| password_digest | string | bcrypt hash |
| name | string | Display name |
| mobile_number | string | Optional phone |
| role | string | admin / staff / user |
| verification_status | string | pending / approved / verified |
| otp_code / otp_sent_at | string/datetime | Email OTP |
| email_verified | boolean | OTP verified? |

### equipment
| Column | Type | Description |
|--------|------|-------------|
| name | string | e.g. "Canon EOS R5" |
| equipment_type | string | photography_camera, videography_camera, drone, lighting, album, video, other |
| description | text | Optional details |
| active | boolean | Soft delete toggle |

### categories
| Column | Type | Description |
|--------|------|-------------|
| name | string | e.g. "Wedding Package" |
| description | text | Short description |
| image_url | string | Optional cover image |
| position | integer | Display order |
| active | boolean | Visibility toggle |

### packages
| Column | Type | Description |
|--------|------|-------------|
| category_id | FK | Belongs to category |
| name | string | Package name |
| description | text | Full description |
| price | decimal | Original price (INR) |
| discount_percentage | decimal | e.g. 10 = 10% off |
| offer_price | decimal | Auto-calculated |
| active | boolean | Visibility toggle |
| featured | boolean | Show on homepage |

### package_items
| Column | Type | Description |
|--------|------|-------------|
| package_id | FK | Belongs to package |
| equipment_id | FK | Equipment from master list |
| quantity | integer | e.g. 2 cameras |
| notes | string | e.g. "with umbrella lighting" |

### appointments
| Column | Type | Description |
|--------|------|-------------|
| name / email / mobile_number | string | Visitor contact info |
| package_id | FK | Optional, selected package |
| preferred_date | date | Event date |
| event_type | string | e.g. "Wedding Package" |
| message | text | Additional details |
| status | string | new / contacted / completed / cancelled |

## API Endpoints

### Auth (public)
| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/auth/signup` | email, password, password_confirmation, name, mobile_number, role |
| POST | `/auth/login` | email, password |
| POST | `/auth/verify_otp` | email, otp_code |
| POST | `/auth/resend_otp` | email |
| GET | `/auth/me` | Header: `Authorization: Bearer <token>` |

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Active categories ordered by position |
| GET | `/packages` | Active packages (optional `?category_id=X`) |
| GET | `/packages/:id` | Package detail with items |
| POST | `/appointments` | Create inquiry (body: `appointment: {name, email, ...}`) |

### Admin (requires admin JWT)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/admin/equipments` | List / create equipment |
| PATCH/DELETE | `/admin/equipments/:id` | Update / deactivate equipment |
| GET/POST | `/admin/categories` | List / create category |
| PATCH/DELETE | `/admin/categories/:id` | Update / deactivate category |
| GET/POST | `/admin/packages` | List / create package (with `package_items_attributes`) |
| PATCH/DELETE | `/admin/packages/:id` | Update / deactivate package |
| GET | `/admin/appointments` | List all appointments |
| PATCH | `/admin/appointments/:id` | Update appointment status |
| GET | `/admin/staff` | List staff |
| PATCH | `/admin/staff/:id/approve` | Approve staff |
| PATCH | `/admin/staff/:id/reject` | Reject staff |
| GET | `/admin/customers` | List customers |

## Default Admin (after seed)

- Email: `admin@buddystudio.com`
- Password: `admin123`

## Seeded Data

The seed file creates:
- 1 admin user
- 4 categories (Wedding, Birthday, Single Event, Personal Wedding Shoot)
- 11 equipment items (cameras, drones, lighting, albums, video types)
- 1 sample "Premium Wedding Coverage" package at 25,000 INR with 10% discount (offer: 22,500)

## Offer Price Calculation

In the `Package` model, a `before_save` callback auto-calculates:

```
offer_price = price - (price * discount_percentage / 100)
```

Admin only needs to set `price` and `discount_percentage`.

## Phase 2 Changes

| Change | Why |
|--------|-----|
| Added Equipment model + admin CRUD | Master list of cameras, drones, albums reusable across packages |
| Added Category model + admin CRUD | Group packages by event type for browsing |
| Added Package model with nested PackageItems | Dynamic packages with equipment, pricing, auto-discount |
| Added Appointment model + public create + admin list | Capture visitor inquiries without login |
| Added public controllers (categories, packages, appointments) | Homepage and package browsing endpoints |
| Updated routes.rb with RESTful resources | Clean CRUD routing for admin and public endpoints |
| Updated seeds.rb | Sample data for categories, equipment, and a demo package |
