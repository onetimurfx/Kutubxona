# KUTUBXONA — demo bookstore

An independent demo website for a modern bookstore: catalog, search, quick pickup orders, printing services, stationery and a demo admin panel.
**React + TypeScript + Vite + Tailwind CSS + Framer Motion + Lucide.** No backend, no payments, no API keys — all data lives in the browser (`localStorage`).

> This is a demonstration. Orders and print requests are never sent to a real business, and uploaded files never leave the browser.
> This project is separate from every other project; it shares no code, data or configuration with them.

## Features

**Customer site** (mobile-first, bottom navigation)
- Animated intro and homepage with category rail and recommendations
- Catalog with smart search (typo tolerant, author/topic/genre), filters and sorting
- Book detail pages, “SHUNGA O'XSHASH KITOBLAR” recommendations, favorites, cart with stock limits
- Quick order (name + phone, pickup), order tracking by number and phone, status timeline
- Printing services: book printing, documents, copies, binding — price estimate, file names (nothing is uploaded)
- Stationery catalog with categories and search
- Customer account: profile, orders, print requests, favorites, demo-data reset

**Demo admin panel** (`#/admin`, separate from customer navigation)
- Overview: totals, pending orders, print requests, revenue, 7-day sales chart, top sellers, recent activity
- Books and stationery: add / edit / delete (with confirmation), cover and product image upload, prices and discounts, stock, available/unavailable
- Orders: search by number, name or phone; status changes; stock is deducted **once** when an order is completed (restored if re-opened)
- Print requests: customer info, specification, file names, status changes
- Inventory: in stock / low stock / sold out / unavailable, quick quantity updates
- Data: sample data, reset catalog, reset everything (both with confirmation)
- Changes appear on the customer site immediately and survive a refresh

> **The admin gate is a demo, not security.** The code (`1234`) is shown on the gate page and sits in the browser bundle, so it cannot protect anything. A real shop must check access on a server.

## Run locally

```bash
npm install
npm run dev        # development
npm run build      # type-check + static production build -> dist/
npm run preview    # serve the production build at http://127.0.0.1:4173/Kutubxona/
```

## Tests

End-to-end tests (Playwright, Chromium) live in `tests/e2e/`: Phase 2 catalog/cart, Phase 3 orders/printing/stationery/account, Phase 4 admin, plus an audit that visits every route at six viewport widths (320–1440 px) and checks horizontal overflow, console errors, image alt text, control names and headings.

```bash
npm i -D playwright && npx playwright install chromium   # once
npm run build && npm run test:e2e
```

Set `KX_BASE=https://<user>.github.io/Kutubxona/` to run the suites against a deployed site instead of a local preview.

## Deploy to GitHub Pages

1. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main`. `.github/workflows/deploy.yml` installs, builds with `VITE_BASE=/<repository-name>/` and publishes `dist/`.
3. The site is served at `https://<user>.github.io/<repository-name>/` (for this repository: `https://onetimurfx.github.io/Kutubxona/`).

Navigation uses hash routing (`#/search`), so refreshing any page works on GitHub Pages without a 404. Building for another repository name: `VITE_BASE=/<name>/ npm run build`.

## Data and storage

| Key | Content |
| --- | --- |
| `kx:catalog` | books, stationery and admin activity (created on the first admin change) |
| `kx:cart`, `kx:favorites`, `kx:profile` | customer state |
| `kx:orders`, `kx:prints` | orders and print requests |
| session `kx:intro-seen`, `kx:admin-ok` | intro shown / demo admin unlocked |

Browsers allow roughly 5 MB per site; uploaded images are compressed (max 640 px) and the admin shows a message if storage fills up. Use **Admin → Ma’lumotlar** or **Account → Demo ma’lumotlarini tiklash** to start over.

## Progress

- [x] Phase 1 — setup, design, intro animation, homepage, bottom navigation
- [x] Phase 2 — catalog, search, book details, recommendations, favorites, cart
- [x] Phase 3 — quick order, printing services, stationery, account
- [x] Phase 4 — demo admin panel
- [x] Phase 5 — testing, responsive polish, deployment
