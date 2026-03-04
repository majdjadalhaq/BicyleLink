# BiCycleL API Reference

Base URL: `/api` (e.g. `https://bicyclel.nl/api` or `http://localhost:3000/api`)

Authentication: JWT in httpOnly cookies. Include `credentials: "include"` in fetch requests.

## Users (/api/users)

- GET / - List all users (Admin)
- POST / - Create user (signup)
- POST /login - Login
- POST /google - Google OAuth login
- POST /verify - Verify email with code
- POST /resend-code - Resend verification code
- POST /request-reset - Request password reset
- POST /reset-password - Reset password
- GET /me - Get current user (cookie)
- POST /logout - Logout
- PUT /profile - Update profile (auth)
- POST /request-security-code - Request security code (auth)
- PUT /password - Change password (auth)
- DELETE /account - Delete account (auth)
- PATCH /notification-settings - Update notification preferences (auth)
- GET /:id/profile - Get public profile

## Listings (/api/listings)

- GET / - Get listings with filters
- GET /facets - Get filter facets
- GET /:id - Get single listing
- GET /:id/candidates - Get potential buyers (auth)
- POST / - Create listing (auth)
- PUT /:id - Update listing (auth, owner)
- DELETE /:id - Delete listing (auth, owner)
- PATCH /:id/status - Update status (auth, owner)
- PATCH /:id/view - Increment view count

## Favorites (/api/favorites)

- GET / - Get user favorites (auth)
- GET /ids - Get favorite IDs (auth)
- POST /:listingId/toggle - Toggle favorite (auth)

## Messages (/api/messages)

- GET /inbox - Get conversations (auth)
- GET /unread-total - Get unread count (auth)
- GET /:room - Get messages (auth)
- POST /read-all - Mark all read (auth)
- POST /archive/:room - Archive conversation (auth)
- POST /unread/:room - Mark unread (auth)
- DELETE /:room - Delete conversation (auth)
- PUT /:messageId - Edit message (auth)

## Notifications (/api/notifications)

- GET / - Get notifications (auth)
- GET /unread-count - Get unread count (auth)
- PATCH /read-all - Mark all read (auth)
- PATCH /read-by-type?type= - Mark by type (auth)
- PATCH /read-by-listing?listingId= - Mark by listing (auth)
- PATCH /:id/read - Mark single read (auth)

## Reviews (/api/reviews)

- POST / - Create review (auth)
- GET /user/:userId - Get reviews for user
- PUT /:id - Update review (auth)
- DELETE /:id - Delete review (auth)
- GET /check - Check review status (auth)

## Reports (/api/reports)

- POST / - Create report (auth)

## Admin (/api/admin)

All routes require admin role.

- GET /stats - Dashboard stats
- GET /users - List users
- PATCH /users/:id/role - Toggle role
- PATCH /users/:id/block - Block/unblock
- PATCH /users/:id/verify - Verify user
- POST /users/:id/warn - Send warning
- GET /users/:id/warnings - Get sent warnings
- GET /listings - List listings
- PATCH /listings/:id/featured - Toggle featured
- PATCH /listings/:id - Update listing
- DELETE /listings/:id - Delete listing
- GET /reports - List reports
- PATCH /reports/:id - Update report status
