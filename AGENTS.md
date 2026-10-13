# AGENTS.md — TU TIENDA A LA MANO

Vite + React 19 + TypeScript + Tailwind CSS v4 e-commerce estilo marketplace (Spanish UI, COP pricing). Express backend (`server/`) for Wompi signing/webhook, admin auth and WhatsApp; Supabase persistence with local mock fallback.

## Commands

- `npm run dev` — Vite on port 3000 (`--host=0.0.0.0`). Needs backend alongside for payments.
- `npm run server` — Express backend on port 4001 (`tsx --watch server/index.ts`, auto-frees stale :4001 via `scripts/free-port.mjs`). Vite proxies `/api` → it.
- `npm start` — production: `tsx server/index.ts` serves `dist/` + `/api` (run `npm run build` first). Deploy command for VPS/Render/Docker. En red local expone tienda+API en `http://<IP-LAN>:4001` (verificado). On Render do NOT set `PORT` (server uses `process.env.PORT`); health check is `/api/health`.
- `npm run build` — production build only (`vite build`, no typecheck). `npm run publish:xampp` — clean + build with relative paths for XAMPP (`http://localhost/opuskartel/dist/`).
- `npm run lint` — actually typecheck (`tsc --noEmit`, covers `src/` + `server/`). No ESLint/Prettier. Run before finishing.
- No test runner. Real diagnostics live in admin → `system-testing` tab (executes live checks, not canned passes).
- `npm run clean` removes `dist/` (cross-platform Node one-liner).

## Architecture (not obvious from filenames)

- View switching replaces react-router: `src/App.tsx` renders by `activeView` (`login | home | product-detail | checkout | admin`) from `src/context/StoreContext.tsx`. Hash/query deep-links (`#admin`, `#checkout`, `#rastreo`, `?view=checkout`, `?admin=1`) are parsed there. Home renders either `StorefrontBlockRenderer` (if `pageLayout.enabledInStorefront`) or the fixed `HeroBanner → FlashDeals → CategoriesGrid → CommunityLooks → CustomerReviewsStrip → PaymentTrustBanner` stack.
- Global state: `StoreContext` is the only store. It hydrates from `localStorage` (`opus_*` keys, kept as-is after the rebrand to preserve carts/sessions) first, then tries Supabase fetches with silent fallback to `src/data/mockDatabase.ts` (`INITIAL_*`).
- Brand: `TU TIENDA A LA MANO` (defaults in `DEFAULT_STORE_PREFERENCES`; old `OPUS*` values auto-migrate when the saved value contains "opus"). SKUs/order refs (`OPUS-*`, `#OPUS-*`) and `opus_*` storage keys are intentionally unchanged (inventory codes + history).
- Money: all amounts in integer COP **cents** (`priceInCents`, `totalAmountInCents`; e.g. `17990000` = $179.900 COP). Format only via `formatCOP` in `src/lib/wompi.ts`.
- Path alias `@` maps to repo **root** (not `src`): `vite.config.ts` + `tsconfig.json` (`@/*` → `./*`). Import as `@/src/lib/...`.
- Theme: default preset is `theme-tienda-mano` (`src/data/themes.ts`, green `#16a34a`, light, marketplace copy). Saved themes carry a `themeSchema` stamp (`THEME_SCHEMA`); stored/remote themes without it are discarded so the rebrand reaches every visitor. `setThemeConfig`/`updateThemeConfig`/`saveThemeToCloud` stamp automatically.
- Maquetador: registry en `src/types/builder.ts` (`BuilderBlockType` + campos) → paleta en `WordPressVisualBuilder.tsx` (`PALETTE_ITEMS` + rama de inspector por tipo) → render en `StorefrontBlockRenderer.tsx` (cases por tipo; el canvas del editor reusa `BlockItem`). Nuevos bloques deben tocar los tres.

## Integrations & gotchas

- Backend (`server/index.ts` + `server/wompi.ts`): Express serves `dist/` + `/api`. Secrets live ONLY in server env (`.env.local` gitignored, or VPS/Render env vars) — never `VITE_` prefixed. Endpoints: `POST /api/wompi/checkout-session` (signs Widget URL), `POST /api/wompi/confirm` (re-verifies via Wompi API, checks reference+amount, marks order), `GET /api/wompi/transaction/:id` (public, rate-limited) + `GET /api/wompi/transactions` (requires admin Bearer), `POST /api/wompi/webhook` (always 200, only mutates Supabase when checksum verifies), `POST /api/whatsapp/send` (Meta Cloud API or SIMULATED, requires admin), `GET /api/health` (key presence, no values).
- Wompi flow: checkout creates order PENDING (synced to Supabase, cart NOT cleared) → redirect to Widget URL → return `?view=checkout&id=<txId>` → frontend tries `POST /api/wompi/confirm` first, falls back to `GET /api/wompi/transaction/:id` in static mode (no backend), checks reference+amount match, marks APPROVED, clears cart. Webhook covers async confirmation. `opus_pending_ref` in localStorage tracks the in-flight order.
- Wompi webhook checksum (`verifyEventChecksum` in `server/wompi.ts`: SHA256 `id+status+amount_in_cents+eventsSecret` vs `signature.checksum`): unverified events are logged with NO db mutation — confirmation then relies on `/api/wompi/confirm`.
- Supabase: CONECTADO al proyecto propio (URL en `VITE_SUPABASE_URL`). Solo conecta si hay credenciales; sin ellas `fetch*` devuelve `null` = "usa mock". Catálogo en la nube se carga con `npx tsx scripts/push-catalog.ts` (lee `.env.local`, prefiere service_role); limpieza demo con `node scripts/wipe-demo.cjs`; password cloud con `node scripts/set-cloud-password.cjs <email> <pass>`; diagnóstico con `node scripts/check-supabase.cjs`. `SUPABASE_SERVICE_ROLE_KEY` vive SOLO en `.env.local` (gitignored). Schema de referencia en `supabase_schema.sql`; NO aplicar `supabase_hardening.sql` sin backend con service_role (revoca escrituras anónimas).
- `POST /api/wompi/checkout-session` rejects non-https `redirectUrl` (http allowed only for localhost) and amounts over $5.000.000 COP (`MAX_AMOUNT_CENTS = 500000000`); public `/api` endpoints share a 120 req/min per-IP limit.
- Admin auth: `POST /api/admin/login` verifies bcrypt hash in `admin_users.password_hash`, returns HMAC-signed 12h token (session/localStorage), validated via `GET /api/admin/me`. Rate-limited 8/10min per IP. `ADMIN_SESSION_SECRET` needs ≥32 chars; production fails closed without it, dev falls back to an ephemeral secret (sessions die on restart). Sensitive endpoints (`/api/wompi/transactions`, `/api/whatsapp/send`, `/api/admin/sync`) require Bearer token. Static mode (no backend) uses a local per-email password gate (10+ chars, `opus_admin_local_hashes`) mapped to `adminUsers` by exact email — deterrent only, never production. Module permissions (`assignedModules` + `hasModulePermission`) are enforced in sidebar AND layout; only SUPER_ADMIN can switch users or manage employees. Seed users: `admin-1` (super) + `admin-operativo` (business-only CUSTOM).
- Tailwind v4 CSS-first: no `tailwind.config.*`; theme via `@import "tailwindcss"` in `src/index.css`.
- Do not touch the `server.hmr` / `server.watch` + `DISABLE_HMR` block in `vite.config.ts` (AI Studio requirement).

## Env & secrets

- `.env*` is gitignored (except `.env.example`). Copy `.env.example` → `.env.local` for local work; never commit real keys.
- `GEMINI_API_KEY` is injected at runtime by AI Studio — do not add it to files.
- `VITE_WOMPI_PUBLIC_KEY` / `VITE_WOMPI_ENV` + `VITE_SUPABASE_*` have code fallbacks (public values by design). Private/integrity/events secrets exist ONLY in server env — never commit them, never put them in `VITE_*`.
