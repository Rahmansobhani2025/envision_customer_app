# Envision Eyewear: customer app

One app for every optical shop. The shop is identified from the link the customer opens:

- `https://{slug}.envisioneyewear.store`  (production, wildcard subdomain)
- `https://your-app.vercel.app/?shop={slug}`  (testing)

The slug comes from the OpticPortal sales-agent app. The app loads that shop's name, logo, colours,
address and frames from Supabase and shows nothing from any other shop.

See **DEPLOY.md** for the full GitHub, Vercel, DNS and Supabase setup.

## Run locally
```bash
npm install
cp .env.example .env      # then fill in the values
npm run dev               # http://localhost:3000/?shop=your-slug
```

## Project layout
| Path | What it does |
|---|---|
| `src/` | The website (React + Vite + Tailwind) |
| `src/lib/shop.ts` | Finds the shop from the link, loads it, theme colour and address helpers |
| `src/lib/inventory.ts`, `matching.ts` | Loads only this shop's frames and ranks them for a face shape |
| `server/app.ts` | The API routes (Gemini face analysis, prescription reading) |
| `api/[...path].ts` | Vercel entry that serves `server/app.ts` |
| `local-server.ts` | Local dev and self-hosting only (not used on Vercel) |
| `supabase/multi_shop_setup.sql` | Database functions, run once in the Supabase SQL editor |
