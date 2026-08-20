# Deployment & Hosting

> Last updated: 2026-08-19. Supersedes the hosting/DNS sections of
> [CUSTOM_DOMAIN_CONFIGURATION.md](./CUSTOM_DOMAIN_CONFIGURATION.md) (GitHub Pages era).

## Current state

| Component | Where |
|---|---|
| Production site | **Firebase Hosting**, project `nexlab-prod`, site `nexlab-prod` |
| Primary URL | https://nexlab.bio (custom domain, status *Connected*, auto-renewing SSL) |
| Secondary URL | https://nexlab-prod.web.app (always available; useful for testing and as a fallback entry point) |
| Cloud Functions | Firebase Functions Gen2 / Node 24 (`functions/`), callable — not routed through Hosting (see below) |
| Warm standby | GitHub Pages (`gh-pages` branch). No DNS points at it, but it can take over in minutes (see Rollback) |

The migration from GitHub Pages to Firebase Hosting happened on **2026-08-19**.

## How deployment works

### Hosting config

[`firebase.json`](../firebase.json) → `hosting` block:

- Serves the Vite build output from `dist/`
- SPA rewrite: `** → /index.html` (native replacement for the old GitHub Pages `404.html` redirect hack)
- Cache headers: hashed assets under `/assets/**` are immutable for 1 year; `index.html` is `no-cache`

### Manual deploy (from a local checkout)

```bash
npm run build                                   # on Windows, run the two package.json steps manually if mkdir -p fails
firebase deploy --only hosting --project nexlab-prod
```

Requires `firebase login` with an account that has deploy rights on `nexlab-prod`.

### CI

> ⚠️ **Pending switch.** As of 2026-08-19, [`react-deploy.yml`](../.github/workflows/react-deploy.yml)
> still deploys **only to GitHub Pages** on push to `main`. Until it is updated,
> **pushes to `main` do NOT update nexlab.bio** — deploy manually (see above).
>
> Planned setup (dual deploy): `FirebaseExtended/action-hosting-deploy@v0` (primary, `channelId: live`)
> plus the existing gh-pages step (backup). Requires a `FIREBASE_SERVICE_ACCOUNT_NEXLAB_PROD`
> repository secret containing a service-account JSON from
> Firebase Console → Project settings → Service accounts → Generate new private key.

## Cloud Functions & AI keys

Migrated on **2026-08-19** (same day as the Hosting cutover):

- All three functions (`processCourseWithGemini`, `processMaterialWithGemini`,
  `publishScheduledMaterials`) run as **Gen2 (Cloud Run functions), Node.js 24**,
  built on `firebase-functions` v7 + `firebase-admin` v14.
- Gemini API keys live **only in Cloud Secret Manager** (`GEMINI_COURSE_KEY`,
  `GEMINI_MATERIAL_KEY`), bound via `defineSecret` in `functions/src/index.ts`.
  The legacy `functions.config()` values were deleted the same day.
  Older docs mentioning `VITE_GEMINI_*` env vars or `functions:config:set` are obsolete.

```bash
# view / rotate a key (rotation requires a functions redeploy to take effect)
firebase functions:secrets:access GEMINI_COURSE_KEY --project nexlab-prod
firebase functions:secrets:set GEMINI_COURSE_KEY --project nexlab-prod

# deploy (on Windows the source-discovery step may need a longer timeout)
FUNCTIONS_DISCOVERY_TIMEOUT=60 firebase deploy --only functions --project nexlab-prod
```

Gotcha: if a Gen2 deploy fails partway, a callable can be left without its public
`run.invoker` (`allUsers`) binding — clients then get an HTML 403 instead of the JSON
`UNAUTHENTICATED` a callable normally returns. Fix it in Cloud Run → service → Security/IAM.

## DNS

Zone hosted at `ns1/ns2.da.hostns.io` (DirectAdmin panel). Website-relevant records:

| Name | Type | Value | TTL | Purpose |
|---|---|---|---|---|
| `@` | A | `199.36.158.100` | 300 | Firebase Hosting |
| `@` | TXT | `hosting-site=nexlab-prod` | 300 | Firebase domain-ownership proof — keep |
| `www` | CNAME | `nexlab-prod.web.app` | 300 | www → apex redirect (added 2026-08-19; Firebase serves the 301) |

Mail records (MX `mx.enmail.co`, `mail`/`pop`/`smtp` A records, SPF TXT, DKIM `_domainkey` TXT)
and NS records are **independent of the website** — never touch them during hosting changes.

TTLs were lowered to 300 for the migration; they can be raised back to 3600 once things are stable.

## Rollback to GitHub Pages

If Firebase Hosting has a serious outage, GitHub Pages can take over in ~5 minutes
(TTL 300). The `gh-pages` branch, `public/CNAME`, and the GitHub Pages workflow are
kept for exactly this reason — do not delete them until this rollback path is
officially retired.

In the DNS panel:

1. **Delete** the `@ A 199.36.158.100` record.
2. **Re-add** the GitHub Pages records:

   | Name | Type | Value |
   |---|---|---|
   | `@` | A | `185.199.108.153` |
   | `@` | A | `185.199.109.153` |
   | `@` | A | `185.199.110.153` |
   | `@` | A | `185.199.111.153` |
   | `@` | AAAA | `2606:50c0:8000::153` |
   | `@` | AAAA | `2606:50c0:8001::153` |
   | `@` | AAAA | `2606:50c0:8002::153` |
   | `@` | AAAA | `2606:50c0:8003::153` |

3. Verify GitHub repo → Settings → Pages still has custom domain `nexlab.bio` and the
   `gh-pages` branch holds a recent build (CI keeps it updated while dual deploy is in place).

Rolling forward again is the same swap in reverse; Firebase keeps the domain
association and certificate for a while, so re-cutover is usually immediate.

## Known migration gotchas (observed 2026-08-19)

- **Firebase-side DNS caching**: right after switching records, Firebase's ACME
  verification may still hit the *old* IPs and fail with 404s. This resolves by
  itself once the old TTL expires — just retry *Verify* after ~30–60 min.
- **Stale CDN error page**: the "Site Not Found" placeholder can get cached on
  Firebase's CDN for the compressed (browser) variant even when the site works.
  Fix: run any `firebase deploy --only hosting`, which purges the CDN cache.

## Remaining TODOs

1. **Switch CI to dual deploy** (see CI section above) — most urgent.
2. ~~Add `www.nexlab.bio`~~ — done 2026-08-19 (DNS CNAME + Firebase redirect-to-apex).
   At setup time the `www` SSL certificate was still provisioning (Firebase served the
   fallback `firebaseapp.com` cert); expected to resolve on its own — if `https://www.nexlab.bio`
   still shows a cert error after ~24 h, re-check the domain status in Firebase Console.
3. After a few stable weeks, retire the GitHub Pages standby: remove `public/CNAME`,
   `public/404.html`, the SPA-redirect script in `index.html`, the `gh-pages`
   dependency/scripts in `package.json`, and disable Pages in repo settings.
