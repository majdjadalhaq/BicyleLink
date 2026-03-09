# BiCycleL Deployment Guide

## Environment Variables

Copy `server/.env.example` to `server/.env` and fill in all values before deploying.

### Required

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on (Heroku sets this automatically) |
| `MONGODB_URL` | MongoDB Atlas connection string |
| `JWT_SECRET` | Strong random secret for signing JWTs |
| `RESEND_API_KEY` | API key from resend.com for transactional email |
| `RESEND_SENDER_EMAIL` | Verified sender address (e.g. `noreply@bicyclel.nl`) |
| `RESEND_SENDER_NAME` | Display name for outgoing emails (e.g. `BiCycleL`) |
| `CLIENT_URL` | Frontend origin, used in email links (e.g. `https://bicyclel.nl`) |
| `NODE_ENV` | Set to `production` on Heroku |

### Optional but Recommended

| Variable | Description |
|---|---|
| `JWT_EXPIRES_IN` | Token expiry duration (default: `7d`) |
| `LOG_LEVEL` | Winston log level — `info`, `warn`, `error` (default: `info`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (required if Google login is enabled) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `RESEND_WEBHOOK_SECRET` | Webhook signing secret from Resend dashboard |

### Test / Cypress Only

| Variable | Description |
|---|---|
| `TEST_ADMIN_EMAIL` | Admin account email seeded by Cypress (default: `bicyclel2026@gmail.com`) |
| `TEST_ADMIN_PASSWORD` | Admin account password seeded by Cypress |
| `TEST_EMAIL` | Secondary test email address |

---

## Heroku Deployment

### 1. Set config vars

Either through the Heroku Dashboard (Settings → Config Vars) or via CLI:

```bash
heroku config:set MONGODB_URL="..." JWT_SECRET="..." RESEND_API_KEY="..." NODE_ENV=production
```

### 2. Deploy

Heroku runs `heroku-postbuild` automatically on push:

```
npm run setup && npm run build:client
```

This installs all dependencies and compiles the React app into `client/dist`, which Express serves as static files in production.

### 3. Verify

```bash
heroku logs --tail
heroku run node -e "console.log(process.env.NODE_ENV)"
```

---

## Pre-Deploy Checklist

- [ ] All required environment variables are set
- [ ] `npm run code-style-check` passes
- [ ] `npm run build:client` succeeds locally
- [ ] `npm run test` passes for both client and server
- [ ] No `.env` files or secrets committed to the repo
- [ ] `npm audit` run in root, client, and server

---

## Custom Domain (bicyclel.nl)

1. Add the domain in Heroku: Settings → Domains
2. Point a CNAME record at the Heroku DNS target shown in the dashboard
3. SSL is provisioned automatically by Heroku for verified domains

---

## Related

- [README](../README.md) — Local setup and development
- [Architecture Overview](./ARCHITECTURE.md)
