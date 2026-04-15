# Deployment Guide

## Environment Variables

Copy the example files before starting:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Server (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Port the server listens on (Render sets this automatically) |
| `MONGODB_URL` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs — min 32 characters |
| `JWT_EXPIRES_IN` | No | Token lifetime (default: `7d`) |
| `CLIENT_URL` | Yes | Frontend origin used in email links (e.g. `https://bicyclel.nl`) |
| `NODE_ENV` | Yes | Set to `production` on the server |
| `LOG_LEVEL` | No | Winston log level: `info`, `warn`, `error` (default: `info`) |
| `RESEND_API_KEY` | Yes | API key from resend.com |
| `RESEND_SENDER_EMAIL` | Yes | Verified sender address (e.g. `noreply@bicyclel.nl`) |
| `RESEND_SENDER_NAME` | Yes | Display name for outgoing emails |
| `RESEND_WEBHOOK_SECRET` | No | Signing secret for Resend webhooks |
| `USE_RESEND` | No | Set to `true` to enable email sending (default: `false`) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `TEST_ADMIN_EMAIL` | No | Admin email seeded by Cypress |
| `TEST_ADMIN_PASSWORD` | No | Admin password seeded by Cypress |

### Client (`client/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_BACKEND_URL` | Yes | Backend API URL (e.g. `https://api.bicyclel.nl`) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name for image uploads |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Yes | Cloudinary unsigned upload preset |
| `VITE_GOOGLE_CLIENT_ID` | No | Google OAuth client ID (same as server) |

---

## Production: Vercel + Render

The live site at [bicyclel.nl](https://bicyclel.nl) runs the React frontend on Vercel and the Express API on Render.

### Backend (Render)

1. Create a new **Web Service** and connect the GitHub repository.
2. Set the build and start commands:
   - **Build Command**: `npm run heroku-postbuild`
   - **Start Command**: `cd server && npm start`
3. Add the environment variables from the server section above.
4. (Optional) Add a custom domain under **Settings → Custom Domains**.

### Frontend (Vercel)

1. Import the GitHub repository in Vercel.
2. Set the **Root Directory** to `client`.
3. Add the environment variables from the client section above.
4. Set `VITE_BACKEND_URL` to the Render service URL.

Vercel auto-deploys on every push to `main`. The frontend build command is `npm run build` and the output directory is `dist`.

---

## Local Development

```bash
# Install all dependencies
npm install && npm run setup

# Start both dev servers
npm run dev
```

This runs the Express server (default port 3000) and the Vite dev server (default port 5173) concurrently. Vite proxies `/api` and socket requests to the Express server.

---

## Pre-Deploy Checklist

- [ ] All required environment variables are set
- [ ] `npm run code-style-check` passes with no errors
- [ ] `npm run build:client` succeeds locally
- [ ] `npm run test` passes for both client and server
- [ ] No `.env` files committed to the repository
- [ ] `npm audit` reviewed in root, client, and server

---

## Related

- [README](../README.md) — Local setup and development
- [Architecture Overview](./ARCHITECTURE.md)
