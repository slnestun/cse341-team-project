# User Dashboard and Navigation Feature Specification

## 1. Overview

The User Dashboard and Navigation feature provides a protected standard user dashboard and role-aware header navigation across the Kizuna Rail application.

Signed-out visitors see authentication links (`Login` and `Register`) in the header, while signed-in users see a role-appropriate `Dashboard` link and a `Logout` action. Post-login redirects automatically route administrators to the Admin Dashboard (`/admin`) and all other authenticated users to the Standard User Dashboard (`/dashboard`).

## 2. Objectives

- Create a protected Standard User Dashboard page (`/dashboard`) for authenticated users.
- Display a personalized welcome message using the user's `displayName`.
- Dynamically hydrate a list of bookings where the signed-in user's email matches a passenger's email via a client-side API request.
- Provide navigation links to the Booking Admin (`/bookings-admin`) and User Admin (`/users-admin`) pages on the dashboard.
- Update the shared header navigation to conditionally display `Login` and `Register` links only when signed out.
- Update the shared header navigation to conditionally display `Dashboard` and `Logout` only when signed in.
- Point the header `Dashboard` link to `/admin` for administrators and `/dashboard` for standard users.
- Update the login workflow to redirect administrators to `/admin` and all other authenticated users to `/dashboard`.

## 3. User Roles and Permissions

### Signed-out Visitor

A signed-out visitor:
- Sees `Login` (`/login`) and `Register` (`/register`) links in the shared header.
- Does not see `Dashboard` or `Logout` in the shared header.
- Is redirected (`302`) to `/login` when attempting to access `/dashboard`.

### Standard User (`customer`)

A signed-in standard user:
- Is redirected (`302`) to `/dashboard` immediately after logging in.
- Sees `Dashboard` (pointing to `/dashboard`) and `Logout` (`POST /logout`) in the shared header, with `Login` and `Register` hidden.
- Can access `GET /dashboard` and view their personalized welcome message, bookings matching their email, and links to `/bookings-admin` and `/users-admin`.
- Receives `403 Forbidden` if attempting to access `/admin`.

### Administrator (`admin`)

A signed-in administrator:
- Is redirected (`302`) to `/admin` immediately after logging in.
- Sees `Dashboard` (pointing to `/admin`) and `Logout` (`POST /logout`) in the shared header, with `Login` and `Register` hidden.
- Can access both `/admin` and `/dashboard`.

## 4. Page & Header Requirements

### Standard User Dashboard Route

`GET /dashboard`

- Protected by `requirePageLogin` middleware (`src/middleware/auth.js`).
- Renders `src/views/auth/dashboard.ejs` (`200 OK`) displaying:
  - Welcome heading containing `user.displayName`.
  - Links to `/bookings-admin` and `/users-admin`.
  - Bookings container populated dynamically via client-side JavaScript calling `GET /api/bookings` and filtering case-insensitively where a passenger's `email` matches `user.email` (with an empty-state message when no bookings match).

### Shared Header Partial

`src/views/partials/header.ejs` & `public/css/layout/header.css`

- Relies on `loadSessionUser` middleware populating `res.locals.user`.
- When `user` is falsy/null: renders `Login` (`/login`) and `Register` (`/register`).
- When `user` is truthy: renders `Dashboard` (`user.role === 'admin' ? '/admin' : '/dashboard'`) and an inline `POST /logout` form button styled consistently with navigation links across desktop and mobile viewports.

### Post-Login Redirect

`POST /login` (`src/controllers/auth.js`)

- Upon valid authentication and session creation (`req.session.user`), redirects (`302`) to `/admin` when `user.role.name === 'admin'`, and `/dashboard` for all other roles.

## 5. Implementation Structure

- **Controllers (`src/controllers/auth.js`):**
  - Update `login` to redirect based on `user.role.name === 'admin'`.
  - Add `userDashboardPage` to render `auth/dashboard`.
- **Routes (`src/routes/ejs-routes.js`):**
  - Register `GET /dashboard` protected by `requirePageLogin` while preserving existing trip, auth, and booking routes.
- **Views (`src/views/auth/dashboard.ejs`, `src/views/partials/header.ejs`):**
  - Create `dashboard.ejs` with welcome message, admin links, and client-side booking hydration.
  - Update `header.ejs` with conditional auth and role-aware dashboard navigation.
- **Styles (`public/css/layout/header.css`):**
  - Style `.inline-logout-form button` to match header navigation links on mobile and desktop.

## 6. Acceptance Criteria

- Signed-out users see `Login` and `Register` in the header and are redirected to `/login` when visiting `/dashboard`.
- Standard users are redirected to `/dashboard` on login and see `Dashboard` (`/dashboard`) and `Logout` in the header.
- Administrators are redirected to `/admin` on login and see `Dashboard` (`/admin`) and `Logout` in the header.
- `/dashboard` displays the user's `displayName`, links to `/bookings-admin` and `/users-admin`, and dynamically filtered passenger bookings from `/api/bookings`.
- Existing booking and authentication routes remain intact, and `npm run lint` and `npm test` pass without errors.