# BiCycleL Deployment Strategy

## Production Checklist

- [ ] `npm audit` shows no vulnerabilities (run `npm audit fix` in root, client, server)
- [ ] All environment variables set (no secrets in repo)
- [ ] `npm run code-style-check` passes
- [ ] `npm run build:client` succeeds
- [ ] `npm run test` passes (client and server)
- [ ] No `.env` or log files committed
- [ ] Documentation is up to date

## Heroku Deployment

1. **Config vars** (Heroku Dashboard or CLI):
   - `MONGODB_URL` - MongoDB Atlas connection string
   - `JWT_SECRET` - Strong random secret
   - `RESEND_API_KEY` - For email verification
   - `RESEND_SENDER_EMAIL` - Verified sender
   - `RESEND_SENDER_NAME` - e.g. "BiCycleL"
   - `NODE_ENV=production`
   - `GOOGLE_CLIENT_ID` (optional)
   - `CLIENT_URL` - e.g. https://bicyclel.nl

2. **Build**:
   - Heroku runs `heroku-postbuild`: `npm run setup && npm run build:client`
   - Static files served from `client/dist`

3. **Verify**:
   ```bash
   heroku run npm run build:client
   heroku logs --tail
   ```

## Custom Domain (bicyclel.nl)

1. Add domain in Heroku: Settings > Domains
2. Configure DNS (CNAME or A record) as per Heroku instructions
3. Ensure SSL is enabled (Heroku provides it for app domains)

## Related

- [README](../README.md) - Setup and run locally
- [DEV.md](../DEV.md) - Development guide
