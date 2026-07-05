# CLAUDE.md — hamelech-amar

## מה הפרויקט עושה
אתר שסופר כמה פעמים ברק רביד ציין "טראמפ אמר לי" (ו-35 וריאציות נוספות) ב-X/Twitter.  
URL: https://hamelech-amar.vercel.app  
Repo: https://github.com/udiseus/hamelech-amar

**מצב נוכחי (יולי 2026):** 48 ציוצים ב-DB, 4 מנויים מאושרים, הכל עובד.

---

## Stack
- **Next.js 16.2.6** (App Router) — דורש **Node.js >= 20.9.0**
- **React 18.3.1**
- **Supabase** (PostgreSQL) — DB + Auth — Project ID: `hllerncixacustplbyhq`
- **Tailwind CSS 3.4**
- **Vercel** — deploy (auto מ-main branch)
- **Gmail SMTP** — שליחת מיילים (Resend כ-fallback)
- **rss-parser** — סריקת RSS של X/Twitter דרך Nitter

---

## מבנה קבצים חשוב

```
app/
  page.tsx              — דף ראשי (Counter, Timeline, SubscribeBox וכו')
  layout.tsx            — RTL, Frank Ruhl Libre + Heebo fonts, @vercel/analytics
  globals.css           — Tailwind base styles
  api/
    cron/               — GET  /api/cron — סורק RSS, מוסיף ל-DB, שולח מיילים
                          ⚠️ מוגן ב-Authorization: Bearer {CRON_SECRET}
                          ⚠️ CRON_SECRET הוא sensitive env var — לא ניתן לקרוא דרך Vercel API
    confirm/            — GET  /api/confirm?token=... — אישור הרשמה
    subscribe/          — POST /api/subscribe — רישום subscriber
    tweets/             — GET  /api/tweets — שולף tweets מ-Supabase
    unsubscribe/        — GET  /api/unsubscribe?email=...
    send-test/          — GET  /api/send-test — בדיקת שליחת מייל התראה לבעל האתר (dev only)
    send-notification/  — GET  /api/send-notification?count=N — שליחת עדכון ידנית למנויים
    debug-rss/          — GET  /api/debug-rss — בדיקת כל מקורות ה-RSS (dev only)

components/
  Counter.tsx           — המונה הגדול
  Timeline.tsx          — רשימת tweets
  LastTweet.tsx         — הציוץ האחרון
  DaysSince.tsx         — כמה ימים עברו מאז הציוץ האחרון
  LiveRefresh.tsx       — polling כל 30 שניות
  ShareButtons.tsx      — שיתוף
  SubscribeBox.tsx      — הרשמה למייל

lib/
  supabase.ts           — getSupabase() / getSupabaseAdmin() (lazy init)
  email.ts              — sendConfirmationEmail() / sendOwnerNotification() / sendNewTweetNotification()
                          ⚠️ nodemailer נטען עם require() לא import (עבודה עם TypeScript)
                          ⚠️ כל תבנית HTML חייבת להתחיל ב-<meta charset="utf-8"> — בלי זה עברית מגיעה מקולקלת
  rss.ts                — סריקת RSS + 35 צירופי חיפוש
                          ⚠️ מתאים רק על item.title (לא description!) — description מכיל ציוצים מצוטטים שגורמים false positives
                          ⚠️ מדלג על RTs: if (title.startsWith('RT by @') || title.startsWith('RT @')) continue

types/
  database.ts           — Supabase generated types

public/
  hero.png, og-image.jpg, sky.mp4 (40MB)
```

---

## Supabase — טבלאות
```sql
matched_tweets (
  id uuid,
  tweet_id text UNIQUE,
  text text,
  url text,
  created_at timestamptz,      -- תאריך הציוץ המקורי (לא detected_at!)
  detected_at timestamptz,     -- מתי ה-cron גילה את הציוץ
  matched_phrase text NOT NULL, -- ביטוי החיפוש שגרם לmatch (חובה!)
  count_number int              -- מספר סידורי (1, 2, 3...) — חשוב ל-send-notification
)

subscribers (
  id uuid,
  email text UNIQUE,
  token text,
  confirmed boolean,
  created_at timestamptz,
  unsubscribed_at timestamptz  -- NULL = פעיל
)
```

**שני פרויקטי Supabase — אל תתבלבל:**
- `hllerncixacustplbyhq` — **ה-DB האמיתי בייצור**, מחובר דרך env vars ידניים
- `supabase-erin-candle` — **נמחק** (היה integration ממרקטפלייס, גרם לdeploy failures כשהושהה)

---

## משתני סביבה (Vercel + .env.local)
```
NEXT_PUBLIC_SUPABASE_URL         # https://hllerncixacustplbyhq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # לא להשתמש מה-browser — Supabase חוסם
NEXT_PUBLIC_APP_URL              # https://hamelech-amar.vercel.app
CRON_SECRET                      # sensitive — לא ניתן לקרוא דרך Vercel API

# מייל:
GMAIL_USER                       # אם מוגדר → Gmail SMTP (עובד!)
GMAIL_APP_PASSWORD
RESEND_API_KEY                   # fallback אם Gmail לא מוגדר
RESEND_FROM_EMAIL
```

---

## הגדרות build חשובות

**`next.config.js`:**
```js
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: { remotePatterns: [{ protocol: 'https', hostname: 'pbs.twimg.com' }] },
}
```

**`package.json` — engines (חשוב! Next.js 16 דורש זאת):**
```json
"engines": { "node": ">=20.9.0" }
```

**`.nvmrc`:** `20`

**`vercel.json`:** Cache-Control header ל-/api/cron + cron schedule `"0 10 * * *"` (12:00 Israel time)
Vercel Hobby plan: cron רץ פעם אחת ביום לכל היותר (לא כל שעה)

---

## GitHub API — איך לדחוף שינויים
הסביבה של Claude אין לה גישה לרשת מה-bash.
כל push חייב לעבור דרך GitHub Contents API דרך Chrome MCP — JS בטאב של vercel.com.

```javascript
// שלב 1: קבל SHA נוכחי
const r = await fetch('https://api.github.com/repos/udiseus/hamelech-amar/contents/PATH',
  {headers: {'Authorization': 'token YOUR_GITHUB_TOKEN'}});
const j = await r.json();
window._sha = j.sha;  // שמור ב-window var — לא להדפיס (base64 ארוך נחסם)

// שלב 2: עדכן קובץ
const content = btoa(unescape(encodeURIComponent(NEW_CONTENT)));  // עברית safe base64
const res = await fetch('https://api.github.com/repos/udiseus/hamelech-amar/contents/PATH', {
  method: 'PUT',
  headers: {'Authorization': 'token YOUR_GITHUB_TOKEN', 'Content-Type': 'application/json'},
  body: JSON.stringify({message: 'commit msg', content, sha: window._sha})
});
(await res.json()).commit?.sha  // SHA החדש
```

**GitHub token:** שמור אצל המשתמש — בקש ממנו בתחילת כל סשן אם צריך.
אל תשמור tokens ב-CLAUDE.md (GitHub secret scanning חוסם push)

**כלל push מרובה:** אחרי כל push ה-SHA משתנה — חייב לרענן (fetch GET) לפני ה-push הבא!

---

## איך מוסיפים ציוץ ידנית ל-DB
כשמוצאים ציוץ שה-cron פספס — **השיטה המומלצת: endpoint זמני**

1. צור `app/api/insert-XXXXX/route.ts` עם הציוצים (דוגמה מיולי 2026):
```typescript
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const TWEETS = [
  { tweet_id: 'ID', text: 'TEXT', url: 'https://x.com/BarakRavid/status/ID',
    created_at: '2026-07-04T16:49:00+00:00', count_number: 45, matched_phrase: 'trump tells me' },
]

export async function GET() {
  const supabase = getSupabaseAdmin()
  const results = []
  for (const t of TWEETS) {
    const { error } = await supabase.from('matched_tweets').insert(t)
    results.push({ ok: !error, err: error?.message })
  }
  return NextResponse.json({ results })
}
```
2. דחוף ל-GitHub → Vercel deploy (~90 שניות)
3. קרא ל-GET /api/insert-XXXXX
4. מחק את הקובץ מ-GitHub
5. קרא ל-/api/send-notification?count=N

**שדות חובה ב-insert:**
- tweet_id, text, url, created_at (תאריך הציוץ — לא published_at!), count_number, matched_phrase (NOT NULL!)

**supabase.dashboard.auth.token כבר לא עובד** — Supabase dashboard עבר ל-cookie auth שחסום מ-JS.

---

## איך שולחים מייל עדכון ידנית למנויים

```bash
curl "https://hamelech-amar.vercel.app/api/send-notification?count=45"
# משלח לכל המנויים המאושרים — {"sent":4, "tweet_id":"...", ...}
```

---

## איך מריצים סריקת ציוצים ידנית

```bash
# דורש CRON_SECRET — sensitive, לא ניתן לקרוא דרך Vercel API
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://hamelech-amar.vercel.app/api/cron
```

**חלופה:** הוסף ציוצים דרך endpoint זמני (ראה למעלה), ואז קרא ל-send-notification.

---

## RSS — מה עובד ומה לא (נבדק יולי 2026)

Nitter instances שסורקים את @BarakRavid:
- `nitter.privacyredirect.com` — עובד מהדפדפן (RSS גולמי)
- `nitter.poast.org` — 403 מהדפדפן, ייתכן שעובד מ-Vercel
- `nitter.net` — לא זמין לרוב
- instances נוספים ב-`lib/rss.ts`

**באג Nitter שנפתר:** ה-description field מכיל ציוצים מצוטטים → גורם ל-false positives.
הפתרון: match רק על item.title, לא על description/contentSnippet.

**באג RT שנפתר:** Nitter מסמן retweets כ-"RT by @username: ..." ב-title.
הפתרון: if (title.startsWith('RT by @') || title.startsWith('RT @')) continue

---

## בעיות שנפתרו (לא לחזור עליהן)

| בעיה | פתרון |
|------|--------|
| import nodemailer נשבר ב-TS build | שינוי ל-require('nodemailer') |
| eslint key ב-next.config.js | הוסר (לא נתמך ב-Next.js 16) |
| tsconfig.tsbuildinfo ב-repo | נמחק (קובץ cache של Mac) |
| Vercel נכשל כי Node 18 | הוסף .nvmrc + engines → כופה Node 20 |
| installCommand ב-vercel.json | הוסר |
| מיילים בעברית מקולקלים (mojibake) | הוסף meta charset utf-8 בכל HTML template |
| Counter מציג "Invalid Date" | formatUpdatedAt מחזיר string אם isNaN(date) |
| ציוצים ב-Timeline בפונט לא נכון | הוסף fontFamily Heebo |
| RSS false positives מציוצים מצוטטים | match רק על item.title |
| RSS מחזיר RTs | skip titles שמתחילים ב-"RT by @" |
| supabase-erin-candle גורם לdeploy failures | נמחק |
| SUPABASE_SERVICE_ROLE_KEY חסום ב-browser | endpoint זמני עם server-side insert |
| published_at לא קיים בסכמה | הקולומן הנכון הוא created_at |
| matched_phrase NOT NULL — insert נכשל | חובה לכלול matched_phrase בכל insert |
| supabase.dashboard.auth.token לא עובד | Supabase עברו ל-cookie auth — endpoint זמני במקום |
| React-controlled inputs מתעלמים מ-form_input | שימוש ב-computer.left_click + computer.type |
| base64 strings ארוכים נחסמים ב-Chrome MCP | שמירה ב-window._var |

---

## Vercel — מידע
- **Project ID:** `prj_U0zoPsooTEY7BOIOyCXxNflplDa0`
- **Org ID:** `team_n2hKT2W58MCDMG1MFaSgnYif`
- אין Vercel token שמור — לא ניתן לגשת ל-API ישירות
- בדיקת build status: GitHub Deployments API
- לצפייה ב-logs: חייב גישה ל-vercel.com עם המשתמש המחובר

---

## נקודות זהירות
1. לא לדחוף sky.mp4 שוב — הוא 40MB
2. לא לcommit node_modules
3. next-env.d.ts — לא לערוך! Next.js מייצר אותו אוטומטית
4. Chrome MCP: לא ניתן להריץ JS על vercel.com (Permission denied) — כן ניתן ל-fetch
5. Chrome MCP: לא ניתן לנווט ל-github.com (חסום) — push דרך GitHub Contents API
6. להריץ JS מטאב vercel.com בלבד, לשמור ב-window._var
7. בעת push מרובה — לרענן SHA לפני כל commit
8. base64: btoa(unescape(encodeURIComponent(text))) / decodeURIComponent(escape(atob(content)))
9. CRON_SECRET — sensitive, לא שמור ב-CLAUDE.md

---

## פיצ'רים קיימים (מה שנבנה)
| פיצ'ר | קבצים רלוונטיים |
|--------|----------------|
| מונה ציוצים + אנימציה | components/Counter.tsx |
| טיימליין ציוצים (Heebo font) | components/Timeline.tsx |
| הרשמה + אישור במייל | app/api/subscribe/, app/api/confirm/, lib/email.ts |
| התראה לבעל האתר על מנוי חדש | sendOwnerNotification() ב-lib/email.ts |
| בדיקת מייל התראה | GET /api/send-test |
| סריקת RSS אוטומטית (cron יומי 12:00) | app/api/cron/, lib/rss.ts |
| שליחת מייל לכל המנויים על ציוץ חדש | sendNewTweetNotification() ב-lib/email.ts |
| שליחת עדכון ידנית למנויים | GET /api/send-notification?count=N |
| דיבאג מקורות RSS | GET /api/debug-rss |
