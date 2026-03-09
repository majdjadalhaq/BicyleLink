# BiCycleL Tech Stack

## Core

| Layer | Technology | Version |
|---|---|---|
| Frontend | ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) React | 19.0 |
| Build Tool | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white) Vite | 7.x |
| Backend | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white) Node.js | 20 LTS |
| Framework | ![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white) Express | 5.1 |
| Database | ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white) MongoDB Atlas + Mongoose | 9.x |
| Real-time | ![Socket.io](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socket.io&logoColor=white) Socket.IO | 4.8 |
| Styling | ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) Tailwind CSS | 3.4 |

---

## Client

**Routing & State**
- React Router 7 — file-based routing with `ProtectedRoute`, `PublicOnlyRoute`, and `AdminRoute` guards
- React Context API — separate providers for Auth, Theme, Toast, Socket, and Notifications

**Data Fetching**
- `useFetch` — callback-based hook wrapping native `fetch`, used for data that loads on mount
- `useApi` — promise-based hook for imperative actions (form submits, status updates, etc.)

**Maps**
- Leaflet 1.9 + React Leaflet 5 — interactive map component with draggable marker for location picking
- Nominatim (OpenStreetMap) — reverse geocoding for address display

**Media**
- Cloudinary — image upload and transformation (up to 5 images per listing, with crop UI)
- `react-easy-crop` — in-browser image cropping before upload

**Other**
- `date-fns` 4 — date formatting
- `react-icons` — icon library
- `@react-oauth/google` — Google One Tap / OAuth integration
- `recharts` — charts in admin dashboard

---

## Server

**Auth & Security**
- `jsonwebtoken` 9 — JWT signing and verification
- `bcrypt` 6 — password hashing
- `helmet` 8 — secure HTTP headers
- `cors` 2.8 — CORS enforcement with shared origin list
- `express-rate-limit` 8 — global and per-route rate limiting
- `express-validator` 7 — request body validation with middleware rules

**Email**
- `resend` 6.9 — transactional email for verification codes, password resets

**Logging**
- `winston` 3 — structured application logging
- `morgan` 1 — HTTP request logging

---

## Infrastructure

| Service | Purpose |
|---|---|
| Heroku | Application hosting (PaaS) |
| MongoDB Atlas | Managed database (DBaaS) |
| Cloudinary | Image storage and CDN delivery |
| Resend | Transactional email |
| Nominatim | Geocoding (OpenStreetMap) |

---

## Tooling

| Tool | Purpose |
|---|---|
| Jest + React Testing Library | Unit and integration tests |
| Cypress | End-to-end test suite |
| ESLint 9 (flat config) | Linting |
| Prettier | Code formatting |
| Husky | Pre-commit hooks |
| Concurrently | Run client + server together in dev |
| MongoDB Memory Server | In-memory DB for server unit tests |

---

## Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [Database Schema](./DATABASE.md)
