# STR11 — Hallmarked Admin-Frontend

## Commands
- `npm run dev` — Vite dev server (`--host` for LAN/Cloudflare Tunnel)
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — ESLint
- `npm run preview` — Vite preview
- `npm run serve` — Express server (port 3001, serves `dist/` + API)
- No test command configured

## Architecture
- **Framework:** React 19, Vite 8, TypeScript 6, Tailwind v4 (via `@tailwindcss/vite` plugin)
- **Tailwind v4:** `@import "tailwindcss"` in `src/index.css` + `@theme` block. No `tailwind.config`. Custom colors/classes in index.css.
- **i18n:** `react-i18next` + `i18next-browser-languagedetector`, fallback `ar`, dir switching in `src/i18n/config.ts`
- **Routing:** `react-router-dom v7`, routes in `src/App.tsx`
- **Server:** Express (`server.cjs`, port 3001) — serves `dist/` + `GET/PUT /api/config` backed by `data.json`
- **Entry:** `src/main.tsx` → renders `<App />`

## Project Structure
```
src/
  store/          - AdminContext (auth + config state), types.ts
  pages/          - React Router page components
    admin/        - Admin sub-pages (standalone layout, no public wrapper)
      AdminLayout.tsx   - Mobile hamburger + sidebar overlay, tab navigation
      Dashboard.tsx     - Config stats summary
      OrdersManager.tsx - Mobile card layout + desktop table, filter tabs, modals
      ServicesManager.tsx - Add/delete/rename services, per-service wallet assignment
      WalletsManager.tsx  - Add/delete wallets, shows which services use each wallet
      BlockedPhones.tsx  - Mobile card layout + desktop table
  components/
    hallmarked/   - Homepage-specific components (Calculator, PriceCard, CountUp, TickerBar, GoldLogo)
    Layout/       - Public site layout (header/footer wraps all public pages)
    ui/           - Reusable UI (Button, Toast)
    icons/        - SVG icon components
  i18n/           - Translation config + locale files (ar, en)
  data/           - Static service data
  test/           - Test utilities
```

## Key Architecture Rules
- **AdminProvider** wraps entire app in `App.tsx`. `useAdmin()` hook available everywhere.
- **Admin page** (`/admin`) renders standalone — NOT wrapped in `<Layout>`. All other routes ARE wrapped in `<Layout>`.
- **Admin state** synced to Express API (`PUT /api/config` on every mutation, `GET /api/config` on mount) with `localStorage` fallback key `str-admin-config`.
- **Admin auth** stored in `sessionStorage` key `str-admin-auth`. Password hardcoded: `str2024`.
- **`loadConfig()`** in AdminContext merges server/stored data with `createDefaultConfig()` defaults — handles missing fields from schema changes.
- **Services are fully dynamic** — admin can add/delete/rename services and assign a list of `allowedWallets` per service.
- **Calculator/Recharge** filter visible wallets by `currentService.allowedWallets`.
- **Ticker bar** hidden on mobile (`hidden md:block`).
- **All public-facing strings** use `t()` via `react-i18next` — no hardcoded Arabic in user-facing pages.

## Admin Context (`useAdmin()`)
```ts
config: AppConfig        // usdtRate, services[], orders[], wallets[], heroTitle, heroSub
isAuthenticated: boolean
createOrder(input)       // type, phone, operator?, amount, usdtAmount, sypAmount, paymentMethod?, paymentProof?, walletAddress?
updateOrderStatus(id, status)  // pending → processing → completed | cancelled
deleteOrder(id)
updateRate(rate)         // auto-saves via API + localStorage
toggleService(id)
toggleMaintenance(id)    // if service has maintenance flag
updateWallet(id, value)
updateWalletLabel(id, label)
updateHeroTitle/sub(title/sub)
addBlockedPhone / removeBlockedPhone
saveConfig / resetConfig
```
All mutation functions call `PUT /api/config` and fall back to `localStorage` if the API is unreachable.

## Order Schema
```ts
{ id, type, status, phone, operator?, amount, usdtAmount, sypAmount,
  paymentMethod?, paymentProof?, walletAddress?, note?, createdAt, completedAt? }
```
`paymentProof` is a base64 data URL (from file upload). Image preview modal in `OrdersManager`.

## Services (default in `createDefaultConfig()`)
| id | name (i18n key) |
|---|---|
| `mtn` | `servicesData.mtn.name` |
| `syriatel` | `servicesData.syriatel.name` |
| `mtn-cash` | `servicesData.mtnCash.name` |
| `syriatel-cash` | `servicesData.syriatelCash.name` |
| `google-play` | `servicesData.googlePlay.name` |
| `app-store` | `servicesData.appStore.name` |
| `steam` | `servicesData.steam.name` |
| `usdt-buy` | `servicesData.usdtBuy.name` |
| `usdt-sell` | `servicesData.usdtSell.name` |
| `sham-cash` | `servicesData.shamCash.name` |
| `binance` | `servicesData.binance.name` |

Each service has `allowedWallets: string[]` (list of wallet IDs it accepts).

## Wallets (default in `createDefaultConfig()`)
`usdt` (USDT TRC20), `binance` (Binance ID), `sham-cash`, `syriatel-cash`, `mtn-cash` — all with empty default values. Each wallet has `enabled: boolean` (default `true`).

## API Endpoints
- `GET /api/config` — returns JSON config or `null`
- `PUT /api/config` — saves entire config to `data.json`
- `GET /api/health` — returns `{"status":"ok"}`

## Calculator Logic (`src/components/hallmarked/Calculator.tsx`)
- **Buy (SYP → USDT):** input SYP / rate = USDT received
- **Sell (USDT → SYP):** input USDT × rate = SYP received
- Phone + payment method + proof image required to submit order
- Wallets filtered by `currentService.allowedWallets`

## Styling
- **Theme colors (all in `@theme`):** `ivory`, `ivory-dark`, `espresso`, `espresso-muted`, `espresso-faint`, `gold` (with hover/active/light/faint/subtle), `emerald` (+ light), `border` (+ gold), `error` (+ faint), `red`, `green` (+ light)
- **Custom utility classes** (in `index.css`): `.h1`–`.h4`, `.body`, `.body-secondary`, `.caption`, `.mono`, `.gold-text`, `.luxury-card`, `.btn-gold`, `.btn-outline-gold`, `.input-luxury`, `.pill-luxury`, `.price-badge`, `.ticker-bar`, `.toggle`, `.section`, `.section-tight`, `.divider-gold`, `.gold-rule`, animations: `animate-fade-up/-count-up/-slide-down/-pulse-gold`, stagger delays
- **Fonts:** Cinzel Decorative (display), Cairo (heading), Sora (body), Fragment Mono (mono), Noto Naskh Arabic (body fallback) — loaded from Google Fonts in `index.html`
- **CountUp** uses `toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` for formatting
- **PriceCard** `trendValue` prop is optional (not hardcoded); accepts `usdtLabel`/`sypLabel` for currency name translation

## i18n Conventions
- Arabic is fallback (`ar`). English (`en`) available.
- `document.documentElement.dir` switches `rtl`/`ltr` on language change (handled in `src/i18n/config.ts`)
- Admin pages use hardcoded Arabic strings, not i18n keys. Static labels use `t()`.
- Form translation keys in `form.*` prefix: phone, paymentMethod, confirmOrder, walletAddress, paymentProof, imageSelected, selectImage, confirmAndSend, back, usdtOrderSubmitted, rechargeOrderSubmitted, maintenance, operator, amount, submitted, submittedDesc, cta
