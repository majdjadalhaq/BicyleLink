# BiCycleL Architecture

## Overview

BiCycleL is a MERN-stack marketplace for buying and selling bicycles. The application follows a client-server architecture with a React SPA, Express REST API, and MongoDB database. Real-time features use Socket.IO.

## High-Level Diagram

```
[Client - React/Vite]  <--HTTP/REST-->  [Server - Express]
        |                                      |
        |<-------- Socket.IO ----------------->|
        |                                      |
        v                                      v
   [Local Storage]                      [MongoDB]
```

## Client Architecture

- **Entry**: `client/src/main.jsx` mounts the app with providers (Theme, Auth, Toast, Socket, Notification)
- **Routing**: React Router v7 with public, protected, and admin routes
- **State**: Context for auth, theme, notifications, toast; local state elsewhere
- **API**: Centralized `useApi` hook and `api.js` service for HTTP requests
- **Real-time**: Socket.IO client via `SocketProvider`; used for chat, notifications, online status

### Key Directories

| Path | Purpose |
|------|---------|
| `src/components` | Shared UI components, Nav, forms, modals |
| `src/pages` | Route-level pages with page-specific components |
| `src/contexts` | Auth, Theme, Toast, Socket, Notification providers |
| `src/hooks` | useAuth, useApi, useFetch, useCountryStateCity, useNotifications, useUnreadCount |
| `src/services` | API client (fetch wrapper with credentials) |
| `src/utils` | Config, formatDate, formatPrice, cloudinary helpers |

## Server Architecture

- **Entry**: `server/src/index.js` creates HTTP server, attaches Socket.IO, connects DB, serves client in production
- **Routing**: Express routers mounted under `/api/*`
- **Auth**: JWT in httpOnly cookies; `authenticate` middleware
- **Real-time**: Socket.IO handler for chat, typing, read status, online status

### Key Directories

| Path | Purpose |
|------|---------|
| `src/controllers` | Business logic per domain (user split into authHandlers, profileHandlers, accountHandlers) |
| `src/models` | Mongoose schemas |
| `src/routes` | Route definitions and middleware wiring |
| `src/middleware` | Auth, admin, validation, rate limiting |
| `src/socket` | Socket.IO event handlers |

## Deployment

- **Production**: Node serves built client from `client/dist`; API at `/api/*`
- **Heroku**: Uses `heroku-postbuild` to run setup and client build
- **Environment**: `NODE_ENV=production`, `PORT` from Heroku, `MONGODB_URL`, `JWT_SECRET`, etc.

## Related

- [API Reference](./API.md)
- [Database Structure](./DATABASE.md)
- [Tech Stack](./TECH_STACK.md)
