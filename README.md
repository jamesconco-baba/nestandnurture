# Nest & Nurture — E-Commerce Site

A boutique e-commerce platform for **Nest & Nurture (Mystery Scoop Baby Gifts)**, built with
Next.js 14 (App Router) + Tailwind CSS, matching the brand book (lavender `#7E5B8E`, champagne
gold `#C5A059`, charcoal `#2C2C2C`, cream `#FAF6EF`, Playfair Display headings).

## What's included

- **Unit Price Shop** (`/shop`) — full catalog from the item list, filterable by category, search.
- **Build-a-Gift Pack** (`/build-a-gift`) — budget-based custom curation (starts at ₦50,000).
- **Mystery Scoop Tiers** (`/mystery-scoop`) — Starter (₦15,000), Classic (₦30,000), Deluxe (₦50,000).
- **Mandatory personalization survey** at checkout — gender/theme, dynamic greeting-card message
  (with a custom-text option), and an assembly/delivery instructions field. Payment is disabled
  until it's completed.
- **Cart** with persistence (localStorage) across all three purchase paths.
- **Payment** via **Paystack** (Card, Bank Transfer, USSD) — inline popup on checkout, verified
  server-side via a Vercel serverless function so a browser can't fake a successful payment.
- **Admin dashboard** (`/admin`) — password-protected visit analytics + full product CRUD
  (including per-item photo uploads), backed by Redis + Vercel Blob (see section 3 below).

## 1. Run it locally

```bash
npm install
cp .env.example .env.local   # then fill in your Paystack keys
npm run dev
```

Visit `http://localhost:3000`.

## 2. Payment setup (Paystack)

1. Create a free account at [paystack.com](https://paystack.com) (supports NGN out of the box).
2. Dashboard → Settings → API Keys & Webhooks → copy your **Test** (or **Live**) keys.
3. Set:
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` — safe to expose, used to open the payment popup.
   - `PAYSTACK_SECRET_KEY` — server-only, used by `/api/paystack/verify` to confirm the charge
     actually succeeded before the order is treated as paid.
4. Without these set, the **Pay** button on checkout will show a friendly setup message instead
   of crashing.

> The order data (personalization survey answers + cart contents) is currently only sent to
> Paystack as transaction `metadata`, visible in your Paystack dashboard per-transaction. There's
> a `TODO` in `app/api/paystack/verify/route.js` where you'd persist it to a database (e.g.
> Supabase/Postgres) or fire off an email/Slack notification once you're ready to go further than
> "view it in Paystack."

## 3. Admin dashboard (`/admin`)

A password-protected dashboard for the business owner, covering:

- **Overview** (`/admin`) — total visits, visits over the last 7/14 days, and a "most visited
  pages" ranking.
- **Products** (`/admin/products`) — add, edit, or remove any item in the Unit Shop /
  Build-a-Gift catalog. Changes appear on the live site immediately (no redeploy needed).

### Storage — connect Redis (2 minutes)

Both the analytics and the product editing need somewhere to persist data across requests
(Vercel's serverless functions don't have a writable local disk). The standard option on Vercel
today is a Redis database from the **Marketplace** (note: the old "Vercel KV" product was retired
in December 2024 in favor of this):

1. In your Vercel project → **Storage** tab → **Create Database** → **Upstash** → **Redis**.
2. Follow the prompts to create a free-tier database and connect it to this project.
3. Vercel automatically injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` into your project's
   environment variables — you don't need to copy/paste anything.
4. Redeploy. That's it — `/admin/products` and the visit counters will start persisting.

**Before you connect Redis:** the site still works — the shop shows the built-in catalog
(read-only) and the admin overview shows a "not connected yet" notice instead of numbers. Nothing
crashes; it just can't save changes yet.

### Product photos

From `/admin/products`, click **Upload** (or **Replace**) next to any item to attach a real
photo — it's stored in **Vercel Blob** and shows up immediately on the Unit Shop and
Build-a-Gift pages, replacing the generic placeholder icon. Images are capped at 4MB and must be
an image file type; there's a **Remove** link to drop a photo back to the placeholder.

This needs its own storage connection, separate from the Redis one above:

1. Vercel project → **Storage** tab → **Create Database** → **Blob**.
2. Connect it to this project — Vercel injects `BLOB_READ_WRITE_TOKEN` automatically.
3. Redeploy. Until this is connected, the upload button shows a "not configured yet" message
   instead of failing silently.

### Admin login

Set these two environment variables (Vercel → Project → Settings → Environment Variables):

- `ADMIN_PASSWORD` — whatever password the business owner will type in at `/admin/login`.
- `ADMIN_SESSION_SECRET` — a separate long random string, e.g. generate one with
  `openssl rand -hex 32`. This becomes the session cookie's value; it's never shown to anyone
  and doesn't need to be memorable.

This is intentionally a single shared password rather than individual accounts — appropriate for
one business owner. If you later need multiple staff logins or roles, swap `lib/adminAuth.js` for
a proper auth provider (e.g. NextAuth/Auth.js).

### What the analytics track

A small client-side component (`components/VisitTracker.js`) pings `/api/track` on every page
view across the public storefront (using `navigator.sendBeacon` where available). That API route
runs on Node.js, not the Edge runtime, and is the only place the Redis client is used for
analytics — `middleware.js` itself only does a cookie check for `/admin`, with no external
packages, to keep the Edge bundle as small and dependency-free as possible.

It's intentionally simple — no bot filtering, no per-user tracking, no cookies on visitors —
enough to answer "what's getting looked at" without adding a full analytics vendor. Swap in Vercel
Analytics, Plausible, or PostHog later if you want more depth (session replay, referrers,
conversion funnels, etc.).

## 4. Push to GitHub

```bash
cd nest-and-nurture
git init
git add .
git commit -m "Initial Nest & Nurture storefront"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 5. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo.
2. Framework preset: **Next.js** (auto-detected — no config needed).
3. Under **Project → Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` / `PAYSTACK_SECRET_KEY` (use your **Live** keys)
   - `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET`
4. Deploy. Then connect Redis and Blob storage (steps above) so the admin dashboard can persist
   changes and photos, and redeploy once more.
5. Every push to `main` will auto-redeploy after this.

## Notes on prices & catalog

`lib/products.js` holds the **default/seed** unit-price catalog from your item list, with
placeholder NGN prices. Once Redis is connected, `/admin/products` becomes the actual source of
truth — edits there persist and override the defaults; `lib/products.js` is only used to seed the
very first load and as a fallback if storage isn't connected. `lib/scoops.js` holds the three
Mystery Scoop tiers and the greeting-card copy from the concept document (not yet editable from
`/admin` — let me know if you'd like that added too).

## On the logo

The header/footer use a hand-drawn nest-and-pearl SVG mark (`components/NestMark.js`) in your
brand colors, since the uploaded brand files are presentation boards (with "PRIMARY LOGO" /
"SECONDARY LOGO" labels, incorrect-usage examples, etc.) rather than isolated transparent logo
assets. Drop a transparent PNG/SVG export of your real logo into `/public` and swap the
`<NestMark />` usages in `components/Header.js` and `components/Footer.js` for an `<img>`/`next/image`
tag whenever you have one.

## Stack

Next.js 14 · React 18 · Tailwind CSS · Paystack Inline JS · Vercel serverless functions
