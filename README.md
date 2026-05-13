# המלך אמר 👑

מונה ההופעות הרשמי של "טראמפ אמר לי" מפי ברק רביד.

## Stack — הכל חינמי
| שירות | שימוש | עלות |
|-------|-------|------|
| **Vercel** Hobby | Hosting | ✅ חינם |
| **Supabase** Free | Postgres DB | ✅ חינם |
| **Nitter RSS** | קריאת ציוצים | ✅ חינם (ללא X API) |
| **cron-job.org** | Cron כל 10 דקות | ✅ חינם |
| **Resend** Free | 3,000 מיילים/חודש | ✅ חינם |

---

## הגדרה — שלב אחר שלב

### 1. Supabase
1. צרו פרויקט ב-[supabase.com](https://supabase.com)
2. ב-SQL Editor הריצו את `supabase/schema.sql`
3. העתיקו מ-Settings → API:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Resend
1. נרשמו ב-[resend.com](https://resend.com)
2. ב-Domains — הוסיפו את הדומיין שלכם ואמתו אותו (DNS records)
3. ב-API Keys — צרו מפתח חדש → `RESEND_API_KEY`
4. `RESEND_FROM_EMAIL=hamelech@yourdomain.com`

> **אין דומיין?** השתמשו ב-`onboarding@resend.dev` לבדיקות בלבד (שולח רק לאימייל שלכם).

### 3. Deploy ל-Vercel
```bash
npm install -g vercel
cd hamelech-amar
vercel deploy
```

הגדירו את כל משתני הסביבה ב-Vercel Dashboard → Settings → Environment Variables.  
כולל `NEXT_PUBLIC_APP_URL=https://your-site.vercel.app`

### 4. Cron ב-cron-job.org (חינמי, בלי Vercel Pro)
1. נרשמו ב-[cron-job.org](https://cron-job.org)
2. צרו Cronjob חדש:
   - **URL:** `https://your-site.vercel.app/api/cron`
   - **Schedule:** `*/10 * * * *` (כל 10 דקות)
   - **Request method:** GET
   - **Headers:** הוסיפו header:
     - Key: `Authorization`
     - Value: `Bearer YOUR_CRON_SECRET`
3. שמרו ותפעילו

---

## בדיקה ידנית

**טריגר Cron ידני:**
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-site.vercel.app/api/cron
```

**הוספת ציוץ ידנית לדאטהבייס (לבדיקת ה-UI):**  
ב-Supabase SQL Editor:
```sql
INSERT INTO matched_tweets (tweet_id, text, created_at, url, matched_phrase, count_number)
VALUES (
  '123456789',
  'Trump told me that the deal is the best deal ever made.',
  NOW(),
  'https://x.com/BarakRavid/status/123456789',
  'Trump told me',
  1
);
```

---

## הרצה מקומית

```bash
cp .env.example .env.local
# מלאו את הערכים

npm install
npm run dev
```

---

## מבנה הקבצים

```
app/
  page.tsx          ← עמוד ראשי (SSR + revalidate 60s)
  layout.tsx        ← HTML + metadata
  globals.css       ← עיצוב RTL עם תמה סגול/זהב
  api/
    tweets/         ← GET קאונטר + ארכיון
    subscribe/      ← POST הרשמה + שליחת אישור
    confirm/        ← GET double opt-in confirmation
    unsubscribe/    ← GET הסרה מהרשימה
    cron/           ← GET סריקת RSS + שמירה + מיילים
components/
  Counter.tsx       ← קאונטר ענק עם אנימציית count-up
  LastTweet.tsx     ← כרטיס הציוץ האחרון
  SubscribeBox.tsx  ← טופס מייל
  Timeline.tsx      ← ארכיון כל הציוצים
  LiveRefresh.tsx   ← רענון אוטומטי כל 5 דקות
lib/
  supabase.ts       ← Supabase clients + types
  rss.ts            ← Nitter RSS parser (ללא X API!)
  email.ts          ← Resend — אישור + עדכון
supabase/
  schema.sql        ← CREATE TABLE matched_tweets + subscribers + RLS
vercel.json         ← Cache headers
```

---

## הערה על Nitter

Nitter הוא front-end חינמי לטוויטר. ה-RSS של `nitter.privacydev.net/BarakRavid/rss`
מחזיר את 20 הציוצים האחרונים.

הקוד מנסה מספר instances בסדר: אם אחד נופל — עובר לבא בתור.  
אם כולם נופלים — הסריקה מחזירה 0 ציוצים (ואין שינוי בדאטהבייס).
