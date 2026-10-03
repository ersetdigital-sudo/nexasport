# Base44 development notes — Nexa Sport

Non-obvious findings for running this repo in the Base44 sandbox. Manifests/README already cover the product; this file covers setup quirks only.

## Stack
- Next.js 15 App Router + React 19, TypeScript strict, pnpm (lockfile present), Tailwind 3.
- Database is **remote Supabase** (PostgREST/GoTrue REST API — plain Postgres in compose does NOT work). Tables live in schema `nexa_sport`.
- Login = shared password (`PESANAN_PASSWORD`) → httpOnly cookie `pesanan_auth=true`. No Supabase Auth.

## Env vars
- Required at boot: none strictly — `PESANAN_PASSWORD`, `SETTINGS_ENCRYPTION_KEY`, `TRACK_SESSION_SECRET`, `CRON_SECRET` have dev placeholders in `.env.base44-defaults` (compose lists it FIRST; `/run/base44/app.env` LAST and wins).
- External credentials (user must supply via dashboard): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, Cloudinary set (`CLOUDINARY_*`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`).
- `supabaseConfigured()`/`serviceRoleConfigured()` in `lib/supabase/server.ts` validate the URL is http(s) — a present-but-malformed URL falls back to static data in `lib/data.ts` instead of 500-ing every page. `loadStepOrder` falls back to `CANONICAL_STEP_ORDER` the same way.

## Running / verifying
- `docker compose -f docker-compose.base44.yml up -d` — single `web` service, node:22-slim, bind-mounted source, `pnpm install --frozen-lockfile && pnpm dev` on port 3000. deps live in named volumes (`web_node_modules`, `web_next`) so rebuilds of source hot-reload without reinstalls.
- Verify: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` (expect 200), same for `/login` and `/track`; then `docker compose -f docker-compose.base44.yml ps` shows `(healthy)`.
- Migrations (`supabase/migrations/`) were already applied by the project's own remote Supabase — nothing local to seed. `scripts/seed-maklon-demo.mjs` is optional demo data.
- Dashboard password for the preview: whatever the user sets for `PESANAN_PASSWORD` (dev default in `.env.base44-defaults` is `base44-dev-password`).

## Quirks
- Root middleware rewrites any non-browser UA (incl. the healthcheck's `node` fetch and curl) to `/link-preview` — that's the `GET /` line you see in logs, it's normal.
- `next.config.mjs` gets `allowedDevOrigins: ['3000-' + process.env.BASE44_PUBLIC_HOST_SUFFIX]` for the preview origin; don't hardcode resolved host values.
- After changing secrets in the dashboard, the platform recreates the `web` container itself (~30s); verify with `printenv KEY >/dev/null` inside the container, never print values.
