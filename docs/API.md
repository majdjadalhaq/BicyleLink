# BiCycleL API Reference

The BiCycleL platform provides a RESTful API for client-server communication. All requests are prefixed with `/api`.

- **Base URL**: `https://bicyclel.nl/api`
- **Authentication**: JWT-based via `httpOnly` secure cookies.
- **Protocol**: HTTPS (Production) / HTTP (Development)

---

## User Authentication & Management

| Endpoint         | Method | Description                         | Access  |
| ---------------- | ------ | ----------------------------------- | ------- |
| `/users/`        | GET    | List all users                      | Admin   |
| `/users/`        | POST   | Register a new account              | Public  |
| `/users/login`   | POST   | Authenticate user and set cookie    | Public  |
| `/users/google`  | POST   | Authenticate via Google OAuth       | Public  |
| `/users/verify`  | POST   | Verify email with code              | Public  |
| `/users/me`      | GET    | Retrieve current authenticated user | Private |
| `/users/profile` | PUT    | Update user profile data            | Private |

## Listings & Marketplace

| Endpoint        | Method | Description                       | Access  |
| --------------- | ------ | --------------------------------- | ------- |
| `/listings/`    | GET    | Retrieve listings with filters    | Public  |
| `/listings/:id` | GET    | Detailed view of a single listing | Public  |
| `/listings/`    | POST   | Create a new bicycle listing      | Private |
| `/listings/:id` | PUT    | Update an existing listing        | Owner   |
| `/listings/:id` | DELETE | Remove a listing from market      | Owner   |

## Real-time Messaging

| Endpoint                 | Method | Description                      | Access  |
| ------------------------ | ------ | -------------------------------- | ------- |
| `/messages/inbox`        | GET    | Retrieve conversation list       | Private |
| `/messages/:room`        | GET    | Retrieve chat history for a room | Private |
| `/messages/unread-total` | GET    | Global unread message count      | Private |
| `/messages/read-all`     | POST   | Mark all messages as read        | Private |

## Notifications

| Endpoint                      | Method | Description                          | Access  |
| ----------------------------- | ------ | ------------------------------------ | ------- |
| `/notifications/`             | GET    | List all user notifications          | Private |
| `/notifications/unread-count` | GET    | Total unread notification count      | Private |
| `/notifications/read-all`     | PATCH  | Mark all notifications as read       | Private |
| `/notifications/:id/read`     | PATCH  | Mark a specific notification as read | Private |

## Admin Features

| Endpoint                 | Method | Description                     | Access |
| ------------------------ | ------ | ------------------------------- | ------ |
| `/admin/stats`           | GET    | Retrieve platform usage metrics | Admin  |
| `/admin/users/:id/block` | PATCH  | Suspend or restore user account | Admin  |
| `/admin/listings/:id`    | DELETE | Force remove a listing          | Admin  |
| `/admin/reports`         | GET    | List reported content           | Admin  |

---

## Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Database Schema](./DATABASE.md)
- [Tech Stack Details](./TECH_STACK.md)
