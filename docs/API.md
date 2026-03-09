# BiCycleL API Reference

All API requests are prefixed with `/api`.

- **Base URL (production)**: `https://bicyclel.nl/api`
- **Authentication**: JWT stored in an `httpOnly` secure cookie, set on login.
- **Access levels**: `Public` — no auth required. `Private` — valid session required. `Owner` — authenticated + resource owner. `Admin` — admin role required.

---

## Users

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/users` | Register a new account | Public |
| POST | `/users/login` | Log in and receive session cookie | Public |
| POST | `/users/google` | Authenticate via Google OAuth | Public |
| POST | `/users/verify` | Verify email address with 6-digit code | Public |
| POST | `/users/resend-code` | Resend email verification code | Public |
| POST | `/users/request-reset` | Request a password reset code by email | Public |
| POST | `/users/reset-password` | Submit reset code and new password | Public |
| GET | `/users/me` | Get the currently authenticated user | Private |
| POST | `/users/logout` | Clear session cookie | Private |
| PUT | `/users/profile` | Update profile (name, avatar, city, etc.) | Private |
| POST | `/users/request-security-code` | Request a code before a sensitive change | Private |
| PUT | `/users/password` | Change password (requires security code) | Private |
| POST | `/users/request-email-change` | Request email change (sends code to new address) | Private |
| POST | `/users/verify-email-change` | Confirm new email with verification code | Private |
| DELETE | `/users/account` | Permanently delete account | Private |
| PATCH | `/users/notification-settings` | Update notification preferences | Private |
| GET | `/users/:id/profile` | Get a user's public profile | Public |

---

## Listings

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/listings` | Get listings with filters (location, price, brand, category, search) | Public |
| GET | `/listings/facets` | Get filter facets — price range, brand list, category list | Public |
| GET | `/listings/:id` | Get a single listing | Public |
| POST | `/listings` | Create a new listing | Private |
| PUT | `/listings/:id` | Update a listing | Owner |
| DELETE | `/listings/:id` | Delete a listing | Owner |
| PATCH | `/listings/:id/status` | Mark as active, sold (with buyer selection), or cancelled | Owner |
| PATCH | `/listings/:id/view` | Increment view count | Public |
| GET | `/listings/:id/candidates` | Get users who chatted about this listing (for Mark as Sold modal) | Owner |

---

## Messages

Chat rooms are identified by a string in the format `{listingId}_{userId1}_{userId2}`.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/messages/inbox` | Get all conversations for the current user | Private |
| GET | `/messages/unread-total` | Get total unread message count | Private |
| GET | `/messages/:room` | Get message history for a room | Private |
| PUT | `/messages/:messageId` | Edit a sent message | Private |
| POST | `/messages/read-all` | Mark all messages as read | Private |
| POST | `/messages/archive/:room` | Hide a conversation from inbox | Private |
| POST | `/messages/unread/:room` | Mark a conversation as unread | Private |
| DELETE | `/messages/:room` | Delete a conversation | Private |

---

## Reviews

Reviews are tied to completed transactions. Only the recorded buyer of a sold listing can review that seller.

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/reviews` | Submit a review for a completed transaction | Private |
| GET | `/reviews/user/:userId` | Get paginated reviews for a user (public profile) | Public |
| GET | `/reviews/check?listingId=` | Check if the current user has already reviewed a listing | Private |
| PUT | `/reviews/:id` | Edit a review | Owner |
| DELETE | `/reviews/:id` | Delete a review | Owner |

---

## Favorites

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/favorites` | Get all favorited listings | Private |
| GET | `/favorites/ids` | Get just the IDs of favorited listings (for button state) | Private |
| POST | `/favorites/:listingId/toggle` | Add or remove a listing from favorites | Private |

---

## Notifications

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/notifications` | Get all notifications for the current user | Private |
| GET | `/notifications/unread-count` | Get total unread notification count | Private |
| PATCH | `/notifications/read-all` | Mark all notifications as read | Private |
| PATCH | `/notifications/:id/read` | Mark a single notification as read | Private |

---

## Reports

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/reports` | Report a listing or user | Private |

---

## Admin

All admin endpoints require an account with `role: "admin"`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Platform usage statistics |
| GET | `/admin/users` | List all users |
| PATCH | `/admin/users/:id/role` | Toggle user role between `user` and `admin` |
| PATCH | `/admin/users/:id/block` | Block or unblock a user account |
| PATCH | `/admin/users/:id/verify` | Manually toggle email verification status |
| POST | `/admin/users/:id/warn` | Send an admin warning to a user via chat |
| GET | `/admin/users/:id/warnings` | Get warnings sent by admin to a user |
| GET | `/admin/listings` | List all listings |
| PATCH | `/admin/listings/:id/featured` | Toggle featured status on a listing |
| DELETE | `/admin/listings/:id` | Force delete a listing |
| GET | `/admin/reports` | Get all submitted reports |
| PATCH | `/admin/reports/:id` | Update report status |

---

## Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Database Schema](./DATABASE.md)
- [Tech Stack Details](./TECH_STACK.md)
