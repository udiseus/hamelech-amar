# CLAUDE.md Ã¢ÂÂ hamelech-amar

## ÃÂÃÂ ÃÂÃÂ¤ÃÂ¨ÃÂÃÂÃÂ§ÃÂ ÃÂ¢ÃÂÃÂ©ÃÂ
ÃÂÃÂªÃÂ¨ ÃÂ©ÃÂ¡ÃÂÃÂ¤ÃÂ¨ ÃÂÃÂÃÂ ÃÂ¤ÃÂ¢ÃÂÃÂÃÂ ÃÂÃÂ¨ÃÂ§ ÃÂ¨ÃÂÃÂÃÂ ÃÂ¦ÃÂÃÂÃÂ "ÃÂÃÂ¨ÃÂÃÂÃÂ¤ ÃÂÃÂÃÂ¨ ÃÂÃÂ" (ÃÂ-35 ÃÂÃÂ¨ÃÂÃÂÃÂ¦ÃÂÃÂÃÂª ÃÂ ÃÂÃÂ¡ÃÂ¤ÃÂÃÂª) ÃÂ-X/Twitter.
URL: https://hamelech-amar.vercel.app
Repo: https://github.com/udiseus/hamelech-amar

---

## Stack
- Next.js 16.2.6 (App Router) Ã¢ÂÂ ÃÂÃÂÃÂ¨ÃÂ© Node.js >= 20.9.0
- React 18.3.1
- Supabase (PostgreSQL)
- Tailwind CSS 3.4
- Vercel Ã¢ÂÂ deploy (auto ÃÂ-main branch)
- Resend ÃÂÃÂ Gmail SMTP Ã¢ÂÂ ÃÂ©ÃÂÃÂÃÂÃÂª ÃÂÃÂÃÂÃÂÃÂÃÂ (dual-mode)
- rss-parser Ã¢ÂÂ ÃÂ¡ÃÂ¨ÃÂÃÂ§ÃÂª RSS ÃÂ©ÃÂ X/Twitter

---

## GitHub API Ã¢ÂÂ ÃÂÃÂÃÂ ÃÂÃÂÃÂÃÂÃÂ£ ÃÂ©ÃÂÃÂ ÃÂÃÂÃÂÃÂ
ÃÂÃÂ¡ÃÂÃÂÃÂÃÂ ÃÂ©ÃÂ Claude ÃÂÃÂÃÂ ÃÂÃÂ ÃÂÃÂÃÂ©ÃÂ ÃÂÃÂ¨ÃÂ©ÃÂª ÃÂÃÂ-bash.
ÃÂÃÂ push ÃÂÃÂÃÂÃÂ ÃÂÃÂ¢ÃÂÃÂÃÂ¨ ÃÂÃÂ¨ÃÂ GitHub Contents API ÃÂÃÂ¨ÃÂ Chrome MCP (JS ÃÂÃÂªÃÂÃÂ ÃÂÃÂÃÂ Gmail).

GitHub token: ghp_YOUR_TOKEN_HERE
(ÃÂÃÂ ÃÂ¤ÃÂ ÃÂªÃÂÃÂ§ÃÂ£ Ã¢ÂÂ ÃÂÃÂ§ÃÂ© ÃÂÃÂÃÂÃÂ©ÃÂªÃÂÃÂ© token ÃÂÃÂÃÂ©)

Template:
fetch(https://api.github.com/repos/udiseus/hamelech-amar/contents/PATH, PUT, {message, content: btoa(newContent), sha: currentSHA})

---

## ÃÂÃÂÃÂ ÃÂ ÃÂ§ÃÂÃÂ¦ÃÂÃÂ
app/page.tsx Ã¢ÂÂ ÃÂÃÂ£ ÃÂ¨ÃÂÃÂ©ÃÂ
app/layout.tsx Ã¢ÂÂ RTL + fonts + Analytics
app/api/cron Ã¢ÂÂ ÃÂ¡ÃÂ¨ÃÂÃÂ§ÃÂª RSS + ÃÂÃÂÃÂÃÂÃÂÃÂ
app/api/confirm, subscribe, tweets, unsubscribe, send-test
components/ Ã¢ÂÂ Counter, Timeline, LastTweet, DaysSince, LiveRefresh, ShareButtons, SubscribeBox
lib/supabase.ts Ã¢ÂÂ getSupabase() / getSupabaseAdmin() (lazy init)
lib/email.ts Ã¢ÂÂ nodemailer ÃÂ¢ÃÂ require() ÃÂÃÂ import
lib/rss.ts Ã¢ÂÂ 35 ÃÂ¦ÃÂÃÂ¨ÃÂÃÂ¤ÃÂ ÃÂÃÂÃÂ¤ÃÂÃÂ©
types/database.ts Ã¢ÂÂ Supabase generated types
public/ Ã¢ÂÂ hero.png, og-image.jpg, sky.mp4 (40MB!)

## Supabase ÃÂÃÂÃÂÃÂÃÂÃÂª
matched_tweets (id, tweet_id, text, url, published_at, created_at)
subscribers (id, email, token, confirmed, created_at)

## ÃÂÃÂ©ÃÂªÃÂ ÃÂ ÃÂ¡ÃÂÃÂÃÂÃÂ
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL = https://hamelech-amar.vercel.app
GMAIL_USER + GMAIL_APP_PASSWORD (ÃÂÃÂ ÃÂÃÂÃÂÃÂÃÂ¨ Ã¢ÂÂ Gmail SMTP)
RESEND_API_KEY + RESEND_FROM_EMAIL (fallback)

---

## ÃÂÃÂÃÂÃÂ¨ÃÂÃÂª build
next.config.js: typescript.ignoreBuildErrors=true, images.remotePatterns pbs.twimg.com
package.json engines: node>=20.9.0
.nvmrc: 20
vercel.json: ÃÂ¨ÃÂ§ Cache-Control header ÃÂ-/api/cron

---

## Vercel
Project ID: prj_U0zoPsooTEY7BOIOyCXxNflplDa0
Org ID: team_n2hKT2W58MCDMG1MFaSgnYif
ÃÂÃÂÃÂ Vercel token Ã¢ÂÂ ÃÂÃÂ ÃÂ ÃÂÃÂªÃÂ ÃÂÃÂÃÂ©ÃÂª ÃÂ-API ÃÂÃÂ©ÃÂÃÂ¨ÃÂÃÂª
ÃÂÃÂ¦ÃÂ¤ÃÂÃÂÃÂ ÃÂ-logs: vercel.com ÃÂ¢ÃÂ ÃÂÃÂÃÂ©ÃÂªÃÂÃÂ© ÃÂÃÂÃÂÃÂÃÂÃÂ¨
ÃÂÃÂÃÂÃÂ§ÃÂª build status: GitHub Deployments API

---

## ÃÂÃÂ¢ÃÂÃÂÃÂª ÃÂ©ÃÂ ÃÂ¤ÃÂªÃÂ¨ÃÂ
- import nodemailer ÃÂ ÃÂ©ÃÂÃÂ¨ ÃÂ-TS build Ã¢ÂÂ ÃÂ©ÃÂÃÂ ÃÂÃÂ ÃÂ-require()
- eslint key ÃÂ-next.config.js Ã¢ÂÂ ÃÂÃÂÃÂ¡ÃÂ¨
- tsconfig.tsbuildinfo ÃÂ-repo Ã¢ÂÂ ÃÂ ÃÂÃÂÃÂ§
- Vercel ÃÂ ÃÂÃÂ©ÃÂ ÃÂÃÂ Node 18 Ã¢ÂÂ .nvmrc=20 + engines
- installCommand ÃÂ-vercel.json Ã¢ÂÂ ÃÂÃÂÃÂ¡ÃÂ¨

## ÃÂÃÂÃÂÃÂÃÂÃÂª Chrome MCP
- ÃÂÃÂ ÃÂ ÃÂÃÂªÃÂ ÃÂÃÂ ÃÂÃÂÃÂ ÃÂ-github.com (ÃÂÃÂ¡ÃÂÃÂ)
- ÃÂÃÂ ÃÂ ÃÂÃÂªÃÂ ÃÂÃÂÃÂ¨ÃÂÃÂ¥ JS ÃÂ¢ÃÂ vercel.com (Permission denied)
- Gmail tab ÃÂÃÂÃÂ¡ÃÂ base64 strings Ã¢ÂÂ ÃÂÃÂÃÂ©ÃÂªÃÂÃÂ© ÃÂ-window._var ÃÂÃÂÃÂÃÂ¡ÃÂÃÂ ÃÂÃÂÃÂ ÃÂÃÂÃÂ

## ÃÂ¡ÃÂ¨ÃÂÃÂ§ÃÂª ÃÂ¦ÃÂÃÂÃÂ¦ÃÂÃÂ ÃÂÃÂÃÂ ÃÂÃÂª
curl -X POST https://hamelech-amar.vercel.app/api/cron

## Last updated
2026-05-26 â Node.js set to 20.x in Vercel dashboard

## כללי עבודה חשובים
- **אל תבצע commit לפני שרצה `npm run build` (או לפחות `npm run lint`) בהצלחה** — שגיאות syntax חוסמות כל Vercel build
- Turbopack ב-Next.js 16 קפדן מאוד — אפילו typo אחד כמו `apync` במקום `async` שובר הכל
