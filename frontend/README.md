# BuddyStudio Frontend (React)

React frontend for BuddyStudio photography studio. Public homepage with packages, category browsing, appointment booking, and a full admin panel.

## Setup

```bash
cd frontend
npm install
npm start
```

Runs on `http://localhost:3000`. Requires the Rails backend running on port 3001.

## Pages

### Public Pages
| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero, categories grid, featured packages, appointment form |
| Packages | `/packages` | All packages with category filter tabs |
| PackageDetail | `/packages/:id` | Full item breakdown, pricing, "Book Now" |
| Signup | `/signup` | Registration (name, email, mobile, password, role) |
| Login | `/login` | Email + password, routes by role |
| VerifyOtp | `/verify-otp` | 6-digit OTP input |
| PendingApproval | `/pending-approval` | Staff waiting for admin approval |

### Authenticated Pages
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | User profile info, links to homepage and admin |

### Admin Pages (sidebar layout, admin-only)
| Page | Route | Description |
|------|-------|-------------|
| Staff | `/admin/staff` | Staff list with approve/reject |
| Customers | `/admin/customers` | Customer list |
| Equipment | `/admin/equipment` | CRUD for equipment master list |
| Categories | `/admin/categories` | CRUD for package categories |
| Packages | `/admin/packages` | CRUD with equipment item builder, pricing, discounts |
| Appointments | `/admin/appointments` | Inquiry list with status management |

## Key Files

| File | Purpose |
|------|---------|
| `src/App.js` | Root routing with nested admin routes |
| `src/api.js` | Axios instance with JWT interceptors |
| `src/context/AuthContext.js` | Global auth state management |
| `src/components/Navbar.js` | Public site navigation bar |
| `src/components/ProtectedRoute.js` | Auth + role route guard |
| `src/pages/admin/AdminLayout.js` | Admin sidebar layout with `<Outlet>` |

## Package Flow (User Journey)

1. Visitor arrives at `/` -- sees hero, categories, featured packages
2. Clicks a category -- goes to `/packages?category=X`
3. Clicks a package -- goes to `/packages/:id` with full detail
4. Clicks "Book Now":
   - If logged in: shows inline inquiry form (pre-filled from user data)
   - If not logged in: redirects to `/signup` with return URL
5. Submits inquiry -- appointment created, confirmation shown
6. Admin sees appointment in `/admin/appointments`, updates status

## Styling

All styles in `src/App.css`:
- CSS custom properties for consistent theming
- Homepage: gradient hero, category cards with icons, package cards with discount badges
- Package detail: two-column layout (content + sticky price card)
- Admin: dark sidebar with navigation links, white content area
- Responsive at 900px (admin layout) and 600px (mobile)

## Phase 2 Changes

| Change | Why |
|--------|-----|
| Added Navbar component | Consistent navigation across public pages |
| Added Home.js homepage | Landing page with categories, featured packages, appointment form |
| Added Packages.js with category filter | Browse all packages by category |
| Added PackageDetail.js with Book Now | Show what's included, pricing, inquiry form |
| Restructured admin from tabs to sidebar | Grew from 2 to 6 sections, sidebar scales better |
| Added AdminEquipment, AdminCategories, AdminPackages, AdminAppointments | Full CRUD management for admin |
| Default route changed from `/login` to `/` | Homepage is now the entry point |
