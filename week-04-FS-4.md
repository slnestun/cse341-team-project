# Kizuna Rail Week 04 Spec – Feature Set 4: Protected Booking Admin Page

## Version 1 (Initial Draft)

### 1. Overall Description
Update the existing Booking Admin page so it requires authentication and enforces role-based access control (RBAC). Signed-out users are redirected to the login page. Signed-in admins can view, update, and delete any booking in the system, while signed-in regular users can only view, update, and delete bookings where their email matches one of the passengers. The bookings list is loaded dynamically via client-side JavaScript, and all updates and deletions must refresh the list in the UI without reloading the page. The Admin Dashboard will also be updated to include a link to the protected Booking Admin page.

### 2. Data Model, Session Data, Roles, and Collections
- **Collection:** `bookings`
  - `id` (String): Booking confirmation ID.
  - `scheduleId` (Number/String): Reference to the booked schedule.
  - `travelDate` (String): Date of travel.
  - `passengers` (Array of objects): Each passenger has `name` and `email`.
  - `status` (String): Booking status (e.g., `confirmed`, `cancelled`).
- **Session Data:**
  - `req.session.user` stores the authenticated user's `email` and `role`.
- **Roles:**
  - `admin`: Full access to view, update, and delete all bookings.
  - Standard authenticated user (non-admin): Access restricted to bookings where their `email` appears in `passengers`.

### 3. Page Routes and API Endpoints
- **Page Routes (EJS):**
  - `GET /admin`: Admin Dashboard (add link to `/admin/bookings`).
  - `GET /admin/bookings`: Renders the Booking Admin page if authenticated; redirects to `/login` if not.
- **API Endpoints:**
  - `GET /api/bookings`: Returns all bookings for admins, or only matching passenger bookings for regular users. Returns `200` on success, `401` if not logged in, `500` on server error.
  - `PUT /api/bookings/:id`: Updates a booking. Returns `200` with the updated booking, `401` if not logged in, `403` if unauthorized, `404` if not found.
  - `DELETE /api/bookings/:id`: Deletes a booking. Returns `200` or `204`, `401` if not logged in, `403` if unauthorized, `404` if not found.

### 4. User Experience by Access State
- **Signed-out users:** Redirected to `/login` when visiting `/admin/bookings`; receive `401` on API calls.
- **Signed-in regular users:** See only their own bookings (where they are a passenger) and can edit or delete them.
- **Signed-in admins:** See all bookings and can edit or delete any booking.
- **Unauthorized users:** Blocked from modifying or deleting bookings they do not belong to.

### 5. Test Plan
- Visit `/admin/bookings` while signed out and verify redirect to `/login`.
- Log in as a regular user and verify only their bookings appear.
- Log in as an admin and verify all bookings appear.
- Edit and delete a booking and verify the UI updates without a page reload.
- Verify the Admin Dashboard links to `/admin/bookings`.

---

## Evaluation of Feature Set 4 Spec (Version 1)

### Bugs or Short-Sighted Decisions
- **Inconsistent error format and delete status code:** Version 1 does not define a standard JSON error structure (`{ "error": "descriptive message" }`) and leaves `DELETE /api/bookings/:id` ambiguous (`200` or `204`).
- **Missing request/response schemas:** `PUT /api/bookings/:id` does not specify which fields are editable, whether `id` can be modified, or how invalid payloads (`400 Bad Request`) are handled.
- **Case-sensitive email matching bug:** If a user logs in with `User@Example.com` but the booking stores `user@example.com`, a naive string comparison will fail to match their bookings or wrongly return `403 Forbidden`.
- **Missing empty-state and UI error handling:** Version 1 does not define what the Booking Admin page should render when a user has zero bookings or when an API call fails.

### Security Considerations
- **Mass assignment risk on `PUT /api/bookings/:id`:** Without a strict allowlist of editable fields, a malicious user could overwrite immutable fields like `id`, `_id`, `createdAt`, or `totalPrice`.
- **Privilege escalation via passenger email spoofing:** If a regular user edits `passengers` on their own booking and removes their own email, or tries to query/update another booking by guessing its `id`, the server must strictly validate ownership *before* applying changes and never trust client-side role flags.
- **Session/API separation:** Page routes should redirect (`302`) to `/login`, while API routes must **never** redirect to HTML—they must return `401 Unauthorized` JSON so `fetch()` calls handle auth failures cleanly.

### Efficiency Considerations
- **Missing database index on `passengers.email`:** Every time a non-admin loads `/api/bookings`, MongoDB must query `passengers.email`. Without a multikey index on `passengers.email` (and a unique index on `id`), MongoDB will perform a full collection scan.
- **Redundant full-list re-fetching:** Updating or deleting a single booking can either update the DOM directly from the API response or re-fetch cleanly, avoiding full page reloads.

### Clarifications Added for Version 2
1. Standardized all API error responses to `{ "error": "descriptive message" }`.
2. Defined exact request/response JSON formats, strict field allowlists for `PUT /api/bookings/:id`, and `200 OK` with confirmation JSON for `DELETE /api/bookings/:id`.
3. Enforced case-insensitive, trimmed email comparison for passenger matching.
4. Added database index requirements (`id` unique index, `passengers.email` index).
5. Expanded the Test Plan with specific negative/security test cases (`400`, `401`, `403`, `404`), Swagger documentation checks, and automated test/lint checks.

---

## Version 2 (Final Spec)

### Global API & Security Standards
- **Standardized Errors:** All API error responses must return JSON in the exact format: `{ "error": "descriptive message" }`.
- **Auth Separation:**
  - Protected **page routes** redirect unauthenticated users with `302 Found` to `/login`.
  - Protected **API routes** return `401 Unauthorized` with `{ "error": "Authentication required" }` (never an HTML redirect).
- **Strict Validation & Allowlisting:** `PUT /api/bookings/:id` validates all inputs before touching the database and only accepts documented editable fields. Immutable fields (`id`, `_id`, `createdAt`) cannot be modified.
- **Case-Insensitive Ownership Check:** Passenger email matching must normalize emails (`trim().toLowerCase()`) before comparing `req.session.user.email` against `booking.passengers[].email`.

---

### 1. Overall Description
Feature Set 4 secures the Booking Admin page and Bookings API with authentication and role-based access control (RBAC), and adds full update and delete capabilities to the Booking Admin UI. Unauthenticated visitors are redirected to `/login`. Authenticated `admin` users can view, update, and delete all bookings in the system, while authenticated standard users can only view, update, and delete bookings where their email address matches at least one passenger. The bookings list is dynamically populated via client-side `fetch()` calls, and both update and delete actions update the DOM immediately without a page refresh. The Admin Dashboard is also updated with a navigation link to the protected Booking Admin page.

---

### 2. Data Model, Session Data, Roles, and Collections

#### Target Collection: `bookings`
| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `String` | Required, unique index, immutable custom booking/confirmation ID (used in `:id` route params). |
| `scheduleId` | `Number` / `String` | Required, references the booked schedule. |
| `travelDate` | `String` | Required, valid `YYYY-MM-DD` date string. |
| `passengers` | `Array<Object>` | Required, non-empty array. Each item: `{ name: String (required, trimmed), email: String (required, valid email, trimmed/lowercased) }`. |
| `status` | `String` | Required, enum: `'confirmed'`, `'pending'`, `'cancelled'`. |
| `createdAt` / `updatedAt` | `Date` | Managed automatically by Mongoose `timestamps: true`. |

* **Indexes:**
  * Unique index on `id`.
  * Multikey index on `passengers.email` to optimize non-admin booking queries.

#### Session Data (`req.session.user`)
```json
{
  "id": "user-123",
  "email": "traveler@example.com",
  "role": "user"
}
```
* **Roles:**
  * `'admin'`: Full read, update, and delete permissions across all bookings.
  * `'user'` (or any non-admin authenticated role): Read, update, and delete permissions restricted strictly to bookings where `passengers.email` matches `req.session.user.email`.

---

### 3. Page Routes and API Endpoints

#### Page Routes (`src/routes/ejs-routes.js`)
1. **`GET /admin`** (Admin Dashboard)
   - **Purpose:** Renders the Admin Dashboard with a navigation link pointing to `/admin/bookings`.
   - **Auth:** Requires authentication (`302` redirect to `/login` if signed out).
2. **`GET /admin/bookings`** (Protected Booking Admin Page)
   - **Purpose:** Renders the Booking Admin EJS view. Bookings are not embedded statically; client-side JS fetches them from `/api/bookings`.
   - **Auth:** Protected by page-level auth middleware.
   - **Responses:**
     - `200 OK`: Renders the page for any authenticated user (`admin` or standard user).
     - `302 Found`: Redirects to `/login` if unauthenticated.

#### API Endpoints (`src/routes/api-routes.js`)

1. **`GET /api/bookings`**
   - **Purpose:** Retrieve bookings scoped to the authenticated user's role.
   - **Auth:** Required (`401` if signed out).
   - **Behavior:**
     - If `req.session.user.role === 'admin'`: returns all bookings.
     - Otherwise: returns only bookings where `passengers.email` matches `req.session.user.email` (case-insensitive).
   - **Success (`200 OK`):**
     ```json
     [
       {
         "id": "BK-2026-001",
         "scheduleId": 1,
         "travelDate": "2026-12-10",
         "passengers": [
           { "name": "Erika Nonato", "email": "erika@example.com" }
         ],
         "status": "confirmed"
       }
     ]
     ```
   - **Errors:**
     - `401 Unauthorized`: `{ "error": "Authentication required" }`
     - `500 Internal Server Error`: `{ "error": "Failed to fetch bookings" }`

2. **`PUT /api/bookings/:id`**
   - **Purpose:** Update an existing booking's editable fields (`travelDate`, `passengers`, `status`). The URL `:id` is authoritative and cannot be changed.
   - **Auth & Authorization:** Required. Allowed only if `role === 'admin'` OR `req.session.user.email` is listed in the existing booking's `passengers`.
   - **Request Body:**
     ```json
     {
       "travelDate": "2026-12-15",
       "status": "confirmed",
       "passengers": [
         { "name": "Erika Nonato", "email": "erika@example.com" }
       ]
     }
     ```
   - **Success (`200 OK`):** Returns the updated booking JSON object.
   - **Errors:**
     - `400 Bad Request`: `{ "error": "Invalid booking update data" }` (missing/invalid fields, empty `passengers` array, invalid date/status, or attempt to modify `id`).
     - `401 Unauthorized`: `{ "error": "Authentication required" }`
     - `403 Forbidden`: `{ "error": "You are not authorized to update this booking" }`
     - `404 Not Found`: `{ "error": "Booking not found" }`
     - `500 Internal Server Error`: `{ "error": "Failed to update booking" }`

3. **`DELETE /api/bookings/:id`**
   - **Purpose:** Permanently delete a booking by its confirmation `id`.
   - **Auth & Authorization:** Required. Allowed only if `role === 'admin'` OR `req.session.user.email` is listed in the existing booking's `passengers`.
   - **Success (`200 OK`):**
     ```json
     {
       "message": "Booking deleted successfully",
       "id": "BK-2026-001"
     }
     ```
   - **Errors:**
     - `401 Unauthorized`: `{ "error": "Authentication required" }`
     - `403 Forbidden`: `{ "error": "You are not authorized to delete this booking" }`
     - `404 Not Found`: `{ "error": "Booking not found" }`
     - `500 Internal Server Error`: `{ "error": "Failed to delete booking" }`

#### OpenAPI Documentation (`src/docs/openapi.js`)
- Document `GET /api/bookings`, `PUT /api/bookings/:id`, and `DELETE /api/bookings/:id`, including the `Booking` schema, request body examples, and `200`, `400`, `401`, `403`, `404`, and `500` responses.

---

### 4. User Experience by Access State

- **Signed-Out Users:**
  - Navigating to `/admin/bookings` immediately redirects (`302`) to `/login`.
  - Direct API requests to `GET`, `PUT`, or `DELETE /api/bookings` receive `401 Unauthorized` JSON.
- **Signed-In Standard Users (Non-Admin):**
  - Can access `/admin/bookings` and see a dynamically loaded list containing **only** bookings where their email appears in `passengers`.
  - If they have no bookings, a clear empty-state message (e.g., *"No bookings found."*) is displayed.
  - Clicking **Edit** opens an inline form or modal pre-filled with the booking's details; saving sends `PUT /api/bookings/:id` and updates the list in the DOM without a page reload.
  - Clicking **Delete** asks for confirmation, sends `DELETE /api/bookings/:id`, and removes the booking from the DOM without a page reload.
- **Signed-In Admin Users (`role === 'admin'`):**
  - Can navigate to `/admin/bookings` directly from the Admin Dashboard link.
  - See **all** bookings in the system and can edit or delete any booking with immediate DOM updates (no page refresh).
- **Unauthorized Users (Standard User Targeting Another User's Booking):**
  - Attempting to `PUT` or `DELETE` a booking ID where their email is not a passenger is blocked server-side with `403 Forbidden` and `{ "error": "You are not authorized to update/delete this booking" }`.
  - Any API error displays an accessible status alert (`aria-live="polite"`) in the UI without crashing or losing the current view.

---

### 5. Test Plan

#### Authentication & Navigation Checks
- [ ] **Signed-out page redirect:** Visiting `GET /admin/bookings` while logged out returns `302` and redirects to `/login`.
- [ ] **Admin Dashboard link:** Logged-in admin visits `/admin` and clicks the link to `/admin/bookings`; page loads cleanly.
- [ ] **Signed-out API block:** `GET /api/bookings`, `PUT /api/bookings/:id`, and `DELETE /api/bookings/:id` without a session cookie all return `401 Unauthorized`.

#### Role-Based Access Control (RBAC) Checks
- [ ] **Admin visibility:** Logged-in `admin` calling `GET /api/bookings` receives all bookings in the database.
- [ ] **Passenger visibility:** Logged-in non-admin calling `GET /api/bookings` receives only bookings where their email matches a passenger (verified case-insensitively).
- [ ] **Cross-user protection (`403`):** Logged-in non-admin sending `PUT /api/bookings/:otherId` or `DELETE /api/bookings/:otherId` for another user's booking receives `403 Forbidden`, and the database record remains unchanged.

#### CRUD & Validation Checks
- [ ] **Valid update (`200`):** Authorized user updates `travelDate`, `status`, or `passengers` via `PUT /api/bookings/:id`; returns `200 OK` with updated JSON and persists in MongoDB.
- [ ] **Invalid update (`400`):** Sending an empty `passengers` array, invalid status, or extra/immutable `id` field returns `400 Bad Request`.
- [ ] **Missing booking (`404`):** `PUT` or `DELETE` with a non-existent booking ID returns `404 Not Found`.
- [ ] **Valid delete (`200`):** Authorized user deletes a booking via `DELETE /api/bookings/:id`; returns `200 OK` and removes the document from MongoDB.

#### Client-Side UI & Quality Checks
- [ ] **Dynamic load:** Opening `/admin/bookings` loads bookings via `fetch('/api/bookings')` without server-side booking injection.
- [ ] **No-refresh update:** Editing a booking updates the visible booking card/row immediately without reloading the browser.
- [ ] **No-refresh delete:** Deleting a booking removes it from the DOM immediately without reloading the browser (and shows empty state if it was the last booking).
- [ ] **Swagger & CI:** `/api-docs` documents all booking endpoints; `npm run lint` and `npm test` pass with zero errors.