# User Admin Feature Specification

## 1. Overview

The User Admin feature provides a protected interface for viewing and managing user accounts in the Kizuna Rail application.

The page is available to authenticated users. Administrators can view and manage all user accounts, while standard customers can only view and manage their own accounts.

## 2. Objectives

- Create a protected User Admin page.
- Redirect signed-out visitors to the login page.
- Display all registered users to administrators.
- Display only the signed-in user's information to standard customers.
- Retrieve user information dynamically through client-side API requests.
- Allow authorized users to update account information.
- Allow authorized users to delete accounts.
- Reflect updates and deletions without reloading the page.
- Add a link to the User Admin page on the Admin Dashboard.

## 3. User Roles and Permissions

### Administrator

An administrator can:
- View all registered users.
- View individual user information.
- Update any user's profile information.
- Delete any user account.

### Standard Customer

A standard customer can:
- View only their own account information.
- Update their own profile information.
- Delete their own account.

A standard customer cannot:
- View other users' information.
- Update another user's information.
- Delete another user's account.
- Change their own role or grant themselves administrator privileges.

### Signed-out Visitor

A signed-out visitor:
- Is redirected to `/login` when accessing the User Admin page.
- Receives HTTP 401 when attempting to access protected user API endpoints.

## 4. Page Requirements

### Route

`GET /users-admin`

### Access Control

- The page must use the existing `requirePageLogin` middleware.
- Signed-out visitors must be redirected to `/login`.
- Both administrators and standard customers can access the page.

### Dynamic Content

- The page must load user information through a client-side request to `GET /api/users`.
- Administrators see a list of all users.
- Standard customers see only their own profile.
- The page must not expose password hashes or other sensitive authentication information.

### User Actions

- Authorized users can edit profile information.
- Authorized users can delete accounts.
- A confirmation step must appear before account deletion.
- Successful updates and deletions must update the displayed content without a full page reload.
- Appropriate success and error messages must be displayed.

## 5. API Requirements

All user API endpoints must require authentication through the existing `requireApiLogin` middleware.

### GET /api/users

Purpose: Retrieve user information based on the authenticated user's role.

- Administrator: Returns all users.
- Customer: Returns only their own account.
- Signed-out visitor: Returns HTTP 401.

### GET /api/users/:id

Purpose: Retrieve a specific user account.

- Administrator: Can retrieve any user.
- Customer: Can retrieve only their own account.
- Unauthorized access: Returns HTTP 403.
- Nonexistent user: Returns HTTP 404.

### PUT /api/users/:id

Purpose: Update an existing user account.

Editable fields:
- displayName
- username
- email

Authorization:
- Administrator: Can update any user's editable profile information.
- Customer: Can update only their own profile.

Validation:
- Required fields must be validated.
- Email and username must remain unique.
- Duplicate values must return HTTP 409.
- Invalid input must return HTTP 400.
- Role and passwordHash must never be accepted as editable profile fields.

### DELETE /api/users/:id

Purpose: Delete a user account.

Authorization:
- Administrator: Can delete any user account.
- Customer: Can delete only their own account.

Expected responses:
- Successful deletion: HTTP 200.
- Unauthorized access: HTTP 403.
- Nonexistent user: HTTP 404.
- Signed-out visitor: HTTP 401.

When users delete their own accounts, their current session must be destroyed and the session cookie cleared.

## 6. Security Requirements

- Reuse the existing authentication middleware and session system.
- Determine user identity from the authenticated session.
- Never trust client-submitted user IDs for ownership verification.
- Never expose passwordHash in API responses.
- Do not allow customers to change their role.
- Validate and sanitize editable profile fields.
- Handle duplicate email and username errors safely.
- Ensure unauthorized API requests cannot modify user records.

## 7. Implementation Structure

Expected files:

### Models
- Update `src/models/users.js` with user retrieval, update, and deletion methods.

### Controllers
- Create `src/controllers/users.js` for user administration logic.

### Routes
- Update `src/routes/api-routes.js` with protected user API endpoints.
- Update `src/routes/ejs-routes.js` with the protected User Admin page route.

### Views
- Create `src/views/auth/users-admin.ejs`.
- Update `src/views/auth/admin.ejs` with a Manage Users link.

### Client-side JavaScript
- Create `public/js/users-admin.js` to retrieve users and handle update and delete actions.

### API Documentation
- Update `src/docs/openapi.js` with the Users tag, endpoints, response descriptions, and User schema.

### Tests
- Create `tests/users.test.js` for user API and authorization tests.
- Add page-access tests where appropriate.

## 8. Testing Requirements

The implementation must be tested for:

1. Signed-out visitors accessing the User Admin page.
2. Signed-in administrators viewing all users.
3. Signed-in customers viewing only their own information.
4. Administrators updating another user's profile.
5. Customers updating their own profile.
6. Customers attempting to update another user's profile.
7. Administrators deleting user accounts.
8. Customers deleting their own accounts.
9. Customers attempting to delete another user's account.
10. Duplicate email and username validation.
11. Invalid user IDs and nonexistent users.
12. API responses excluding passwordHash.
13. Client-side updates without a full page reload.

All existing project tests must continue passing.

## 9. Acceptance Criteria

The feature is complete when:

- The User Admin page is protected.
- Administrators can view and manage all users.
- Customers can view and manage only their own accounts.
- User information is loaded dynamically through the API.
- Updates and deletions are reflected without reloading the page.
- Unauthorized operations are rejected.
- Sensitive authentication information is never exposed.
- The Admin Dashboard contains a working Manage Users link.
- API documentation is updated.
- Automated tests pass.
- ESLint reports no new errors.

## 10. Out of Scope

The following are not included in this feature:

- User registration and login implementation.
- Password reset functionality.
- Password changes.
- Role creation or role assignment.
- Changes to the shared navigation system.
- Walkthrough video production.
