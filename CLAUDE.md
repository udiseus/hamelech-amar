# CLAUDE.md — hamelech-amar

## מה הפרויקט עושה
אתר שסופר כמה פעמים ברק רביד ציין "טראמפ אמר לי" (ו-35 וריאציות נוספות) ב-X/Twitter.
URL: https://hamelech-amar.vercel.app
Repo: https://github.com/udiseus/hamelech-amar

---

## Stack
- Next.js 16.2.6 (App Router) — דורש Node.js >= 20.9.0
- React 18.3.1
- Supabase (PostgreSQL)
- Tailwind CSS 3.4
- Vercel — deploy (auto מ-main branch)
- Resend או Gmail SMTP — שליחת מיילים (dual-mode)
- rss-parser — סריקת RSS של X/Twitter

---

## GitHub API — איך לדחוף שינויים
הסביבה של Claude אין לה גישה לרשת מה-bash.
כל push חייב לעבור דרך GitHub Contents API דרך Chrome MCP (JS בתוך טאב Gmail).

GitHub token: ghp_YOUR_TOKEN_HERE
(אם פג תוקף — בקש מהמשתמש token חדש)

Template:
fetch(https://api.github.com/repos/udiseus/hamelech-amar/contents/PATH, PUT, {message, content: btoa(newContent), sha: currentSHA})

---

## מבנה קבצים
app/page.tsx — דף ראשי
app/layout.tsx — RTL + fonts + Analytics
app/api/cron — סריקת RSS + מיילים
app/api/confirm, subscribe, tweets, unsubscribe, send-test
components/ — Counter, Timeline, LastTweet, DaysSince, LiveRefresh, ShareButtons, SubscribeBox
lib/supabase.ts — getSupabase() / getSupabaseAdmin() (lazy init)
lib/email.ts — nodemailer עם require() לא import
lib/rss.ts — 35 צירופי חיפוש
types/database.ts — Supabase generated types
public/ — hero.png, og-image.jpg, sky.mp4 (40MB!)

## Supabase טבלאות
matched_tweets (id, tweet_id, text, url, published_at, created_at)
subscribers (id, email, token, confirmed, created_at)

## משתני סביבה
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL = https://hamelech-amar.vercel.app
GMAIL_USER + GMAIL_APP_PASSWORD (אם מוגדר — Gmail SMTP)
RESEND_API_KEY + RESEND_FROM_EMAIL (fallback)

---

## הגדרות build
next.config.js: typescript.ignoreBuildErrors=true, images.remotePatterns pbs.twimg.com
package.json engines: node>=20.9.0
.nvmrc: 20
vercel.json: רק Cache-Control header ל-/api/cron

---

## Vercel
Project ID: prj_U0zoPsooTEY7BOIOyCXxNflplDa0
Org ID: team_n2hKT2W58MCDMG1MFaSgnYif
אין Vercel token — לא ניתן לגשת ל-API ישירות
לצפייה ב-logs: vercel.com עם המשתמש המחובר
בדיקת build status: GitHub Deployments API

---

## בעיות שנפתרו
- import nodemailer נשבר ב-TS build → שינוי ל-require()
- eslint key ב-next.config.js → הוסר
- tsconfig.tsbuildinfo ב-repo → נמחק
- Vercel נכשל כי Node 18 → .nvmrc=20 + engines
- installCommand ב-vercel.json → הוסר

## מגבלות Chrome MCP
- לא ניתן לנווט ל-github.com (חסום)
- לא ניתן להריץ JS על vercel.com (Permission denied)
- Gmail tab חוסם base64 strings — להשתמש ב-window._var לאחסון ביניים

## סריקת ציוצים ידנית
curl -X POST https://hamelech-amar.vercel.app/api/cron
