# BiCycleL Tech Stack

## Core

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 7 |
| Backend | Node.js 20, Express 5 |
| Database | MongoDB, Mongoose 9 |
| Real-time | Socket.IO 4 |

## Client Libraries

| Purpose | Library |
|---------|---------|
| Routing | react-router-dom 7 |
| Styling | Tailwind CSS 3 |
| State | React Context |
| HTTP | Fetch (custom api.js + useApi) |
| Maps | react-leaflet, leaflet |
| Image crop | react-easy-crop |
| Charts | recharts |
| OAuth | @react-oauth/google |
| Location data | country-state-city (code-split via dynamic import) |
| Utils | date-fns, lodash, clsx, tailwind-merge |

## Server Libraries

| Purpose | Library |
|---------|---------|
| Auth | jsonwebtoken, bcrypt |
| Validation | express-validator |
| Security | helmet, cors, express-rate-limit |
| Email | nodemailer, resend |
| Logging | morgan, winston |

## Development

| Purpose | Tool |
|---------|------|
| Lint | ESLint 9 |
| Format | Prettier |
| Tests | Jest, React Testing Library |
| E2E | Cypress 13 |
| Hooks | Husky (pre-commit) |

## Infrastructure

| Purpose | Service |
|---------|---------|
| Hosting | Heroku |
| Database | MongoDB Atlas |
| Images | Cloudinary |
| Email | Resend |
| Maps | OpenStreetMap (Nominatim, tiles) |

## Related

- [Architecture](./ARCHITECTURE.md)
- [API](./API.md)
- [Database](./DATABASE.md)
