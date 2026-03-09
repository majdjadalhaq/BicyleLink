 # Project Overview

 This repository is a full-stack marketplace application.

- Frontend: React + Vite (client/)
- Backend: Express.js with Mongoose (server/)
- Database: MongoDB (Mongoose models in `server/src/models`)
- Key features: user authentication, listings, messaging, favorites, reviews, notifications, admin dashboard, geocoding utilities.

---

# Database Collections (models)

Below are the main Mongoose models (collections) and their primary fields.

- **users** (`server/src/models/User.js`)
  - Primary fields: `name`, `email`, `pendingEmail`, `password`, `city`, `country`, `bio`, `role` (user|admin), `isBlocked`, `isVerified`, `avatarUrl`
  - Security & auth: `verificationCode`, `verificationCodeExpiry`, `passwordResetCode`, `passwordResetCodeExpiry`, `googleId`, `authProvider`
  - Ratings: `ratingSum`, `reviewCount`, virtual `averageRating`
  - `notificationSettings`, timestamps

- **listings** (`server/src/models/Listing.js`)
  - Primary fields: `title`, `description`, `images`, `price` (Decimal128), `status` (active|sold|cancelled), `ownerId` (ref users), `buyerId` (ref users), `location`, `coordinates` (GeoJSON Point)
  - Additional: `brand`, `model`, `year`, `category`, `condition`, `views`, `inquiries`, `isFeatured`, timestamps

- **Message** (`server/src/models/Message.js`) — collection name: `Message`
  - `senderId`, `receiverId`, `listingId` (optional), `content`, `room`, `read`, `mediaUrl`, `mediaType` (text|image|location), `location` object, timestamps

- **Review** (`server/src/models/Review.js`) — collection name: `Review`
  - `reviewerId`, `targetId`, `listingId`, `rating` (1-5), `comment`, `createdAt`

- **notifications** (`server/src/models/Notification.js`)
  - `recipientId`, `senderId`, `listingId`, `type` (message|favorite|review|review_permission), `title`, `body`, `link`, `read`, timestamps

- **favorites** (`server/src/models/Favorite.js`)
  - `userId`, `listingId`, timestamps (unique compound index userId+listingId)

- **reports** (`server/src/models/Report.js`)
  - `reporterId`, `targetId`, `targetType` (Listing|User), `reason`, `status` (pending|resolved|dismissed), timestamps

- **ConversationStatus** (`server/src/models/ConversationStatus.js`)
  - `userId`, `room`, `isArchived`, `lastReadAt`, `isDeleted`, timestamps

---

# API Endpoints (routes)

All routes are mounted under the `/api` prefix (see `server/src/app.js`). Below are the routers and their endpoints.

- **User routes** (`/api/users` — `server/src/routes/user.js`)
  - POST `/api/users` — create user (signup)
  - POST `/api/users/login` — login
  - POST `/api/users/google` — Google login
  - POST `/api/users/verify` — verify email (sensitive ops rate-limited)
  - POST `/api/users/resend-code` — resend verification code
  - POST `/api/users/request-reset` — request password reset
  - POST `/api/users/reset-password` — reset password
  - GET `/api/users/me` — get current authenticated user
  - POST `/api/users/logout` — logout
  - PUT `/api/users/profile` — update profile (auth)
  - POST `/api/users/request-security-code` — request security code (auth)
  - PUT `/api/users/password` — change password (auth)
  - DELETE `/api/users/account` — delete account (auth)
  - POST `/api/users/request-email-change` — request email change (auth)
  - POST `/api/users/verify-email-change` — verify email change (auth)
  - PATCH `/api/users/notification-settings` — update notification settings (auth)
  - GET `/api/users/:id/profile` — get public profile

- **Listing routes** (`/api/listings` — `server/src/routes/listing.js`)
  - GET `/api/listings` — list listings (public, optional auth)
  - GET `/api/listings/facets` — get filter facets/statistics
  - GET `/api/listings/:id/candidates` — get potential buyers (auth+verified)
  - GET `/api/listings/:id` — get single listing
  - POST `/api/listings` — create listing (auth+verified)
  - PUT `/api/listings/:id` — update listing (auth+verified+ownership)
  - DELETE `/api/listings/:id` — delete listing (auth+verified+ownership)
  - PATCH `/api/listings/:id/status` — update listing status (auth+verified+ownership)
  - PATCH `/api/listings/:id/view` — increment view count (optional auth)

- **Favorite routes** (`/api/favorites` — `server/src/routes/favorite.js`)
  - GET `/api/favorites` — get my favorites (auth)
  - GET `/api/favorites/ids` — get my favorite listing ids (auth)
  - POST `/api/favorites/:listingId/toggle` — toggle favorite (auth)

- **Message routes** (`/api/messages` — `server/src/routes/message.js`)
  - GET `/api/messages/inbox` — get inbox (auth)
  - GET `/api/messages/unread-total` — get unread total (auth)
  - POST `/api/messages/archive/:room` — archive room (auth)
  - POST `/api/messages/unread/:room` — mark room unread (auth)
  - DELETE `/api/messages/:room` — delete conversation (auth)
  - PUT `/api/messages/:messageId` — edit message (auth)
  - POST `/api/messages/read-all` — mark all read (auth)
  - GET `/api/messages/:room` — get messages by room (auth)

- **Review routes** (`/api/reviews` — `server/src/routes/review.js`)
  - POST `/api/reviews` — create review (auth, validated)
  - GET `/api/reviews/user/:userId` — get reviews for user
  - PUT `/api/reviews/:id` — update review (auth, validated)
  - DELETE `/api/reviews/:id` — delete review (auth)
  - GET `/api/reviews/check` — check review status (auth)

- **Utils routes** (`/api/utils` — `server/src/routes/utils.js`)
  - GET `/api/utils/geocode?q=...` — geocode address to coordinates
  - GET `/api/utils/reverse-geocode?lat=...&lon=...` — reverse geocode coordinates

- **Admin routes** (`/api/admin` — `server/src/routes/admin.js`) — all require admin
  - GET `/api/admin/stats` — admin dashboard stats
  - GET `/api/admin/users` — list users
  - PATCH `/api/admin/users/:id/role` — toggle user role
  - PATCH `/api/admin/users/:id/block` — block/unblock user
  - PATCH `/api/admin/users/:id/verify` — verify/unverify user
  - POST `/api/admin/users/:id/warn` — send admin warning
  - GET `/api/admin/users/:id/warnings` — get warnings sent by admin
  - GET `/api/admin/listings` — list listings (admin view)
  - PATCH `/api/admin/listings/:id/featured` — toggle featured
  - DELETE `/api/admin/listings/:id` — delete listing as admin
  - GET `/api/admin/reports` — get reports
  - PATCH `/api/admin/reports/:id` — update report status

- **Notification routes** (`/api/notifications` — `server/src/routes/notification.js`)
  - GET `/api/notifications` — get my notifications (auth)
  - GET `/api/notifications/unread-count` — unread count (auth)
  - PATCH `/api/notifications/read-all` — mark all as read (auth)
  - PATCH `/api/notifications/:id/read` — mark one as read (auth)

- **Report routes** (`/api/reports` — `server/src/routes/report.js`)
  - POST `/api/reports` — create a report (auth required)

- **Email routes** (`/api/emails` — `server/src/routes/email.js`)
  - POST `/api/emails/webhook` — incoming email webhook (Resend)
  - POST `/api/emails/test` — admin-only test email trigger

---

# Notes & references

- Route mounting and global API prefix: see [server/src/app.js](server/src/app.js) for route mounts.
- Authentication middleware: many routes require `authenticate`, `requireVerified`, or admin middleware (`authorizeAdmin`). See `server/src/middleware`.
- Database connection: see `server/src/db/connectDB.js` (uses `process.env.MONGODB_URL`).
