# Deploy: Supabase, GitHub, Vercel

## 1) Supabase (once)
1. Supabase dashboard, then **SQL Editor**, then **New query**.
2. Paste `supabase/multi_shop_setup.sql` and click **Run**. It is safe to run again.
3. **Authentication, then URL Configuration**:
   - Site URL: `https://envisioneyewear.store`
   - Redirect URLs: add `https://*.envisioneyewear.store/**` and your Vercel preview URL pattern
     (for example `https://*.vercel.app/**`).

## 2) GitHub
```bash
git init
git add .
git commit -m "Envision Eyewear customer app"
git branch -M main
git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
git push -u origin main
```
`.env` is ignored by git. Do not commit keys.

## 3) Vercel
1. **Add New, then Project**, import the GitHub repo. `vercel.json` already sets the Vite framework.
2. **Environment Variables** (Production and Preview):
   | Name | Value |
   |---|---|
   | `GEMINI_API_KEY` | your Gemini key (server-side only) |
   | `VITE_SUPABASE_URL` | Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |
   | `VITE_BASE_DOMAIN` | `envisioneyewear.store` |
3. **Deploy**. Test first on the Vercel URL: `https://YOUR-APP.vercel.app/?shop=THE-SLUG`.

## 4) Shop subdomains (after the test works)
1. Vercel project, then **Settings, then Domains**: add `envisioneyewear.store` and `*.envisioneyewear.store`.
2. Wildcards need Vercel to renew certificates, so use the **Vercel nameservers** shown there at your
   registrar (copy your existing DNS records into Vercel DNS first so e-mail keeps working).
   If you cannot change nameservers, Vercel documents a delegated `_acme-challenge` alternative.
3. Redeploy. `https://{slug}.envisioneyewear.store` now opens that shop.

## Checklist
- [ ] `?shop=slug` shows the shop's name, logo, colours and address under the logo
- [ ] A different shop's link shows only that shop's frames
- [ ] A suspended shop shows the "temporarily unavailable" page
- [ ] Sign-up works, and the account stays tied to the first shop used
- [ ] Face analysis works (calls `/api/gemini/analyze`)

## Notes
- The sample showroom (demo) is off on the live site. Turn it on only for testing with `VITE_ENABLE_DEMO=true`.
- Vercel limits request bodies to 4.5 MB. Prescription photos are shrunk in the browser before upload.
