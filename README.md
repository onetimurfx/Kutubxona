# KUTUBXONA — demo bookstore

Independent demo website for a modern bookstore. React + TypeScript + Vite + Tailwind CSS + Framer Motion + Lucide.
No backend, no API keys: demo data lives in the browser (`localStorage`).

> This is a demonstration. Orders and print requests are never sent to a real business.

## Run locally

```bash
npm install
npm run dev        # development
npm run build      # static production build -> dist/
npm run preview    # serve the production build
```

## Deploy to GitHub Pages

1. Push this repository to GitHub as **kutubxona** (GitHub currently shows it as `Kutubxona`) (the Vite `base` is taken from the repository name in CI).
2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and publishes the site.
4. The site is served at `https://<your-username>.github.io/<repository-name>/`.

Using a different repository name? Build with `VITE_BASE=/<name>/ npm run build`, or edit `vite.config.ts`.

Navigation uses hash routing (`#/search`), so refreshing any page works on GitHub Pages without a 404.

## Progress

- [x] Phase 1 — setup, design, intro animation, homepage, bottom navigation
- [x] Phase 2 — catalog, search, book details, recommendations, favorites, cart
- [x] Phase 3 — quick order, printing services, stationery, account
- [x] Phase 4 — demo admin panel (`#/admin`, demo code shown on the gate page)
- [ ] Phase 5 — testing, responsive polish, deployment
