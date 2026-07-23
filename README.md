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
- **Customer accounts** (`/signup`, `/login`) — email/password or one-click **Google sign-in**,
  required before checkout so every order and cart can be attached to a person.
- **Customer order tracking** (`/orders`) — signed-in customers see their own order history.
- **Admin dashboard** (`/admin`) — password-protected visit analytics, full product CRUD
  (including per-item photo uploads), order management, a customers list, and discount code
  management (see sections below), backed by Redis + Vercel Blob.

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
3. Vercel automatically injects the right environment variables into your project once
   connected — the exact names have varied across integration versions (you might see
   `UPSTASH_KV_REST_API_URL`/`UPSTASH_KV_REST_API_TOKEN`, or `KV_REST_API_URL`/`KV_REST_API_TOKEN`,
   or `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`). This app checks for all three, so you
   don't need to rename anything — whatever Vercel gives you will work.
4. Redeploy. That's it — `/admin/products` and the visit counters will start persisting.

**Before you connect Redis:** the site still works — the shop shows the built-in catalog
(read-only) and the admin overview shows a "not connected yet" notice instead of numbers. Nothing
crashes; it just can't save changes yet.

### Product & Mystery Scoop photos

From `/admin/products`, click **Upload photo** (or **Replace photo**) next to any item to attach
a real photo — it's stored in **Vercel Blob** and shows up immediately on the Unit Shop and
Build-a-Gift pages, replacing the generic placeholder icon. From `/admin/scoops`, do the same for
each of the three Mystery Scoop tiers (Starter/Classic/Deluxe) — their photos show on the Mystery
Scoop page and the homepage teaser, so customers can gauge the size of the package before buying.
Images are capped at 4MB and must be an image file type; there's a **Remove** link to drop a
photo back to the placeholder.

This needs its own storage connection, separate from the Redis one above:

1. Vercel project → **Storage** tab → **Create Database** → **Blob**.
2. Connect it to this project — Vercel injects `BLOB_READ_WRITE_TOKEN` automatically.
3. Redeploy.

**Until Blob is connected**, both admin pages show an upfront yellow notice explaining that photo
uploads aren't set up yet, and the Upload buttons are disabled — rather than letting you click
Upload and have nothing visibly happen. If you ever see uploads fail after Blob *is* connected,
the error message returned now includes the underlying reason (e.g. a specific Blob API error),
which is also logged server-side in your Vercel deployment's function logs for that request.

### Customer accounts (sign up / login)

Every order needs to be attached to a real person, so checkout now requires being signed in:

- `/signup` — collects **full name, email, and password**, creates the account, and logs the
  person straight in.
- `/login` — logs an existing customer in.
- The header shows **Log in** when signed out, or **Hi, [First name] · Log out** when signed in.
- If someone with items in their cart heads to `/checkout` while signed out, they see a prompt
  to log in or create an account (with a `redirect` back to checkout) instead of a broken form —
  their cart is untouched (it's saved in the browser regardless of login state) and waiting for
  them once they're signed in.

Passwords are hashed with Node's built-in `crypto.scrypt` (salted, no plaintext ever stored) —
no extra dependency needed. Sessions are a random token stored in Redis with a 30-day expiry, set
as an httpOnly cookie (`nn_user_session`), separate from the admin session cookie.

This needs the same Redis connection as the rest of the admin dashboard — no separate setup.

### Google sign-in ("Continue with Google")

Both `/login` and `/signup` show a **Continue with Google** button above the email/password
form — one click, no password to create or remember. It's implemented as a plain OAuth 2.0 flow
against Google's own endpoints (no SDK, no extra npm package), so it slots into the same
account/session system as email/password login:

- If the Google account's email matches an existing password-based account, it's linked to that
  same account (so someone can use either method going forward).
- Otherwise, a new account is created automatically — no separate "Google users" table, just the
  same customer record with `authProvider: 'google'` and no password set.

**Setup (5 minutes):**

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → create or select a
   project → **APIs & Services** → **Credentials**.
2. **Create Credentials** → **OAuth client ID**. If prompted, configure the **OAuth consent
   screen** first (External user type is fine for a public storefront; you only need an app name
   and support email).
3. Application type: **Web application**.
4. Under **Authorized redirect URIs**, add:
   - `https://your-production-domain.com/api/auth/google/callback` (your real domain)
   - `http://localhost:3000/api/auth/google/callback` (for local development)

   These must match **exactly** — Google rejects anything that doesn't, including a trailing
   slash mismatch.
5. Copy the generated **Client ID** and **Client Secret** into `GOOGLE_CLIENT_ID` and
   `GOOGLE_CLIENT_SECRET` in Vercel's environment variables, then redeploy.

**Until these are set**, the Google button still shows (it's harmless to leave visible), but
clicking it redirects straight to `/login` with a friendly "Google sign-in isn't set up yet"
message instead of erroring out.

**One quirk worth knowing:** Vercel preview deployments get a random URL per deployment
(`your-app-git-branch-yourteam.vercel.app`), and Google requires an exact redirect URI match — so
Google sign-in will only work on domains you've explicitly added above. Email/password sign-in is
unaffected and works on any domain, including previews.

### Customers (`/admin/users`)

Every registered account — password or Google — shows up here: name, email, how they signed up,
when they joined, how many orders they've placed, and total lifetime spend. Read-only for now
(no editing or deleting accounts from here yet).

### Discount codes (`/admin/discounts`)

Create codes for whatever purpose you like — a blanket 10% off, a one-time new-customer
incentive, a fixed ₦2,000-off promo — from one form:

- **Type**: percentage off, or a fixed Naira amount off.
- **Purpose / label**: a free-text note for your own reference (e.g. "New User Discount"),
  shown in the admin list — customers don't see it.
- **Max uses** (optional): a **global** cap on total redemptions across every customer combined
  (e.g. 50 means the first 50 orders using it, from any mix of people, then it stops). Leave
  blank for unlimited.
- **Limit to one use per customer** (checkbox): on top of any max uses above, blocks the *same*
  signed-in customer from using this exact code more than once — this is the setting you want for
  a "New User Discount" so it can't be reused order after order by one person, while still working
  for every different customer up to the max-uses cap. Checked against that customer's own past
  orders, so it only applies to signed-in customers (which checkout already requires).
- **Minimum order** (optional): the code won't apply below this subtotal.
- **Expires** (optional): the code stops working after this date.

Use the **Generate** button next to the code field for a random 8-character code, or type your
own (it's automatically uppercased). Toggle a code **Active**/**Inactive** any time without
deleting it — inactive codes stay in the list with their usage history intact.

Customers enter a code in a field on the checkout page; it's checked against all of the above in
real time, and the discount is subtracted before the amount is sent to Paystack — so the discount
is baked into the actual charge, not something applied after the fact. Usage count only increments
once a payment is confirmed (not just validated), so someone checking whether a code works
doesn't burn a redemption.

### Order management (`/admin/orders`)

A tabbed dashboard covering the full lifecycle of a paid order:

- **Waiting to Ship** — every order lands here immediately after a successful, verified payment.
- **Shipped**, **Delivered**, **Completed** — move an order through these from its detail view
  (click a row to expand it, then use the **Status** dropdown). Nothing moves automatically;
  it's a manual step so you're only marking things once you've actually done them.
- **Waiting in Carts** — a separate tab (not a shipping stage) showing what signed-in customers
  currently have sitting in their cart but haven't checked out yet — useful for reminders or
  understanding what's not converting. Only tracked for signed-in customers; anonymous browsing
  isn't recorded here.

Each order's expanded view shows the recipient's delivery details, the account holder who placed
it (which may differ from the recipient — this is a gifting site), the itemized cart, the
personalization survey answers, and the Paystack payment reference for cross-checking.

Orders are created automatically by `/api/paystack/verify` right after a payment is confirmed —
there's nothing to wire up manually.

### Customer order tracking (`/orders`)

Signed-in customers see their own order history at `/orders` (linked from the header, next to
Cart, once logged in). It mirrors the admin pipeline but simplified to two tabs that map onto
the four admin stages:

- **Waiting to Ship** — covers `waiting_to_ship`, `shipped`, and `delivered` (the actual stage
  still shows inside each order if you expand it).
- **Completed** — orders the admin has marked `completed` in `/admin/orders`.

The moment you move an order to **Completed** in the admin dashboard, it moves to the customer's
**Completed** tab too — same underlying order record, no separate sync step. Customers only ever
see their own orders (the API route checks their session and filters by their account).

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
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (optional — skip if you don't want Google
     sign-in yet; add later anytime)
4. Deploy. Then connect Redis and Blob storage (steps above) so the admin dashboard can persist
   changes and photos, and redeploy once more.
5. If you added Google credentials, go back to Google Cloud Console and add this deployment's
   real domain to **Authorized redirect URIs** as `https://your-domain.com/api/auth/google/callback`
   (see the Google sign-in section above) — it won't work until that exact URL is registered.
6. Every push to `main` will auto-redeploy after this.

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
