# CLAUDE.md â hamelech-amar

## ×× ××¤×¨×××§× ×¢××©×
××ª×¨ ×©×¡××¤×¨ ××× ×¤×¢××× ××¨×§ ×¨××× ×¦××× "××¨×××¤ ×××¨ ××" (×-35 ××¨×××¦×××ª × ××¡×¤××ª) ×-X/Twitter.
URL: https://hamelech-amar.vercel.app
Repo: https://github.com/udiseus/hamelech-amar

---

## Stack
- Next.js 16.2.6 (App Router) â ×××¨×© Node.js >= 20.9.0
- React 18.3.1
- Supabase (PostgreSQL)
- Tailwind CSS 3.4
- Vercel â deploy (auto ×-main branch)
- Resend ×× Gmail SMTP â ×©××××ª ×××××× (dual-mode)
- rss-parser â ×¡×¨××§×ª RSS ×©× X/Twitter

---

## GitHub API â ××× ×××××£ ×©×× ××××
××¡×××× ×©× Claude ××× ×× ×××©× ××¨×©×ª ××-bash.
×× push ×××× ××¢×××¨ ××¨× GitHub Contents API ××¨× Chrome MCP (JS ××ª×× ××× Gmail).

GitHub token: ghp_YOUR_TOKEN_HERE
(×× ×¤× ×ª××§×£ â ××§×© ××××©×ª××© token ×××©)

Template:
fetch(https://api.github.com/repos/udiseus/hamelech-amar/contents/PATH, PUT, {message, content: btoa(newContent), sha: currentSHA})

---

## ××× × ×§××¦××
app/page.tsx â ××£ ×¨××©×
app/layout.tsx â RTL + fonts + Analytics
app/api/cron â ×¡×¨××§×ª RSS + ××××××
app/api/confirm, subscribe, tweets, unsubscribe, send-test
components/ â Counter, Timeline, LastTweet, DaysSince, LiveRefresh, ShareButtons, SubscribeBox
lib/supabase.ts â getSupabase() / getSupabaseAdmin() (lazy init)
lib/email.ts â nodemailer ×¢× require() ×× import
lib/rss.ts â 35 ×¦××¨××¤× ×××¤××©
types/database.ts â Supabase generated types
public/ â hero.png, og-image.jpg, sky.mp4 (40MB!)

## Supabase ××××××ª
matched_tweets (id, tweet_id, text, url, published_at, created_at)
subscribers (id, email, token, confirmed, created_at)

## ××©×ª× × ×¡××××
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL = https://hamelech-amar.vercel.app
GMAIL_USER + GMAIL_APP_PASSWORD (×× ×××××¨ â Gmail SMTP)
RESEND_API_KEY + RESEND_FROM_EMAIL (fallback)

---

## ××××¨××ª build
next.config.js: typescript.ignoreBuildErrors=true, images.remotePatterns pbs.twimg.com
package.json engines: node>=20.9.0
.nvmrc: 20
vercel.json: ×¨×§ Cache-Control header ×-/api/cron

---

## Vercel
Project ID: prj_U0zoPsooTEY7BOIOyCXxNflplDa0
Org ID: team_n2hKT2W58MCDMG1MFaSgnYif
××× Vercel token â ×× × ××ª× ×××©×ª ×-API ××©××¨××ª
××¦×¤××× ×-logs: vercel.com ×¢× ×××©×ª××© ××××××¨
××××§×ª build status: GitHub Deployments API

---

## ××¢×××ª ×©× ×¤×ª×¨×
- import nodemailer × ×©××¨ ×-TS build â ×©×× ×× ×-require()
- eslint key ×-next.config.js â ×××¡×¨
- tsconfig.tsbuildinfo ×-repo â × ×××§
- Vercel × ××©× ×× Node 18 â .nvmrc=20 + engines
- installCommand ×-vercel.json â ×××¡×¨

## ××××××ª Chrome MCP
- ×× × ××ª× ×× ××× ×-github.com (××¡××)
- ×× × ××ª× ×××¨××¥ JS ×¢× vercel.com (Permission denied)
- Gmail tab ×××¡× base64 strings â ×××©×ª××© ×-window._var ××××¡×× ××× ×××

## ×¡×¨××§×ª ×¦×××¦×× ××× ××ª
curl -X POST https://hamelech-amar.vercel.app/api/cron

## Last updated
2026-05-26 — Node.js set to 20.x in Vercel dashboard
