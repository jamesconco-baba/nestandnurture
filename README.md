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

## 3. Push to GitHub

```bash
cd nest-and-nurture
git init
git add .
git commit -m "Initial Nest & Nurture storefront"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 4. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo.
2. Framework preset: **Next.js** (auto-detected — no config needed).
3. Add the same two environment variables from step 2 under **Project → Settings →
   Environment Variables** (use your **Live** Paystack keys for production).
4. Deploy. Every push to `main` will auto-redeploy.

## Notes on prices & catalog

`lib/products.js` holds the full unit-price catalog from your item list, with placeholder NGN
prices — edit any `price` value directly, nothing else depends on it. `lib/scoops.js` holds the
three Mystery Scoop tiers and the greeting-card copy from the concept document.

## On the logo

The header/footer use a hand-drawn nest-and-pearl SVG mark (`components/NestMark.js`) in your
brand colors, since the uploaded brand files are presentation boards (with "PRIMARY LOGO" /
"SECONDARY LOGO" labels, incorrect-usage examples, etc.) rather than isolated transparent logo
assets. Drop a transparent PNG/SVG export of your real logo into `/public` and swap the
`<NestMark />` usages in `components/Header.js` and `components/Footer.js` for an `<img>`/`next/image`
tag whenever you have one.

## Stack

Next.js 14 · React 18 · Tailwind CSS · Paystack Inline JS · Vercel serverless functions
