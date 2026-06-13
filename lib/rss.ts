import Parser from 'rss-parser'

// Nitter instances to try — ordered by reliability from cloud IPs.
// nitter.privacyredirect.com is currently the only confirmed-working instance.
const NITTER_INSTANCES = [
  'https://nitter.privacyredirect.com',
  'https://nitter.poast.org',
  'https://xcancel.com',
  'https://nitter.rawbit.ninja',
  'https://nitter.space',
  'https://nitter.net',
  'https://n.opnxng.com',
  'https://bird.trom.tf',
  'https://nitter.privacydev.net',
  'https://nitter.1d4.us',
]

// Search queries — one per key phrase/verb so nothing falls through.
// WHY SEARCH INSTEAD OF FEED:
//   User feed = last 20 tweets regardless of content → if there's downtime, tweets fall out of window.
//   Search RSS = last 20 tweets *matching the query* → 20 results spans weeks/months, not hours.
// IMPORTANT: each query determines what Nitter returns. SEARCH_PHRASES below is only a
// secondary filter. Any phrase NOT covered by a query here will never reach the filter.
const SEARCH_QUERIES = [
  // ── English ──────────────────────────────────────────────────────────────
  'from:BarakRavid "told me"',       // Trump told me, told me in a call, etc.
  'from:BarakRavid "tells me"',      // Trump tells me (present tense)
  'from:BarakRavid "said to me"',    // Trump said to me
  'from:BarakRavid "says to me"',    // Trump says to me
  // ── Hebrew ───────────────────────────────────────────────────────────────
  'from:BarakRavid "אמר לי"',        // טראמפ אמר לי (most common)
  'from:BarakRavid "סיפר לי"',       // טראמפ סיפר לי
  'from:BarakRavid "מסר לי"',        // טראמפ מסר לי
  'from:BarakRavid "אמר לאקסיוס"',   // טראמפ אמר לאקסיוס
  'from:BarakRavid "שוחחתי עם"',     // שוחחתי עם טראמפ
  'from:BarakRavid "בשיחה איתי"',    // אמר/הבהיר בשיחה איתי
  'from:BarakRavid "בראיון שהעניק"', // בראיון שהעניק לי
  'from:BarakRavid "מעורה בפרטים"',  // מקור שמעורה בפרטים
]

// Fallback: user feed (old behavior). Used only if ALL search URLs fail.
const FEED_FALLBACK_SOURCES = [
  'https://rsshub.app/twitter/user/BarakRavid',
  'https://rsshub.rssforever.com/twitter/user/BarakRavid',
  'https://nitter.privacyredirect.com/BarakRavid/rss',
  'https://xcancel.com/BarakRavid/rss',
  'https://nitter.poast.org/BarakRavid/rss',
]

// All phrases we track — English + Hebrew.
// Used as a safety filter even on search results (guards against Nitter returning unrelated content).
export const SEARCH_PHRASES = [
  // Core English
  'Trump told me',
  'Trump tells me',
  'Trump told Axios',
  'Trump told me in an interview',
  // Direct attribution
  'told me in a phone call',
  'told me in a call',
  'told me in an interview',
  'In a phone call with me',
  'In an interview with me',
  'Speaking to me',
  'In comments to me',
  // Reporting verbs
  'Trump confirmed to me',
  'Trump revealed',
  'Trump acknowledged',
  'Trump claimed',
  'I asked Trump',
  'According to Trump',
  // Scoop prefixes
  'SCOOP: Trump told me',
  'NEW: Trump says',
  'Axios scoop: Trump told me',
  // Core Hebrew
  'טראמפ אמר לי',
  'טראמפ אמר בשיחה איתי',
  'בשיחה איתי אמר טראמפ',
  'בראיון שהעניק לי',
  'טראמפ אמר בראיון ל',
  'טראמפ אמר לי כי',
  'שוחחתי עם טראמפ',
  'כששאלתי את טראמפ',
  'טראמפ השיב לי',
  'טראמפ טען בפניי',
  'טראמפ הבהיר לי',
  'טראמפ אישר לי',
  'טראמפ אמר בשיחה',
  'לדברי טראמפ בשיחה איתי',
  'גורם שמעורה בפרטי השיחה',
  'מקור שמעורה בפרטי השיחה',
  'לפי מקור שמעורה בפרטים',
  'טראמפ אמר לאקסיוס',
  'טראמפ אמר לי בראיון',
]

export type RawTweet = {
  tweet_id: string
  text: string
  created_at: string
  url: string
  matched_phrase: string
}

function extractTweetId(url: string): string | null {
  const match = url.match(/\/status\/(\d+)/)
  return match ? match[1] : null
}

function buildSearchUrl(instance: string, query: string): string {
  return `${instance}/search/rss?q=${encodeURIComponent(query)}&f=tweets`
}

async function fetchFromUrl(feedUrl: string): Promise<RawTweet[]> {
  const parser = new Parser({ timeout: 10000 })
  const feed = await parser.parseURL(feedUrl)

  if (!feed.items || feed.items.length === 0) {
    throw new Error('Empty feed')
  }

  const results: RawTweet[] = []

  for (const item of feed.items) {
    const title = (item.title ?? '').trim()
    const link = item.link ?? ''
    const pubDate = item.pubDate ?? new Date().toISOString()

    // Skip retweets
    if (title.startsWith('RT by @') || title.startsWith('RT @')) continue

    // Match only on the tweet title (not description — avoids false positives from quoted tweets)
    const matchedPhrase = SEARCH_PHRASES.find((p) =>
      title.toLowerCase().includes(p.toLowerCase())
    )
    if (!matchedPhrase) continue

    const tweetId = extractTweetId(link)
    if (!tweetId) continue

    results.push({
      tweet_id: tweetId,
      text: title,
      created_at: new Date(pubDate).toISOString(),
      url: `https://x.com/BarakRavid/status/${tweetId}`,
      matched_phrase: matchedPhrase,
    })
  }
  return results
}

function dedupeByTweetId(tweets: RawTweet[]): RawTweet[] {
  const seen = new Set<string>()
  return tweets.filter((t) => {
    if (seen.has(t.tweet_id)) return false
    seen.add(t.tweet_id)
    return true
  })
}

export async function fetchNewTweets(): Promise<RawTweet[]> {
  // PHASE 1: Try search RSS from all instances × all queries, in parallel.
  // This is the reliable path — search results span weeks, not just the last 20 tweets.
  const searchUrls = NITTER_INSTANCES.flatMap((instance) =>
    SEARCH_QUERIES.map((q) => buildSearchUrl(instance, q))
  )

  const searchResults = await Promise.allSettled(searchUrls.map(fetchFromUrl))

  const allTweets: RawTweet[] = []
  let searchSuccesses = 0

  for (const result of searchResults) {
    if (result.status === 'fulfilled' && result.value.length >= 0) {
      allTweets.push(...result.value)
      searchSuccesses++
    }
  }

  if (searchSuccesses > 0) {
    const deduped = dedupeByTweetId(allTweets)
    console.log(
      `[rss] search phase: ${searchSuccesses}/${searchUrls.length} succeeded → ${deduped.length} unique matches`
    )
    return deduped
  }

  // PHASE 2: Fallback to user feed (old behavior) if all search URLs failed.
  console.warn('[rss] all search URLs failed — falling back to user feed')
  const errors: string[] = []

  for (const url of FEED_FALLBACK_SOURCES) {
    try {
      const tweets = await fetchFromUrl(url)
      console.log(`[rss] feed fallback SUCCESS ${url} → ${tweets.length} matched`)
      return tweets
    } catch (err) {
      const msg = (err as Error).message
      console.warn(`[rss] feed fallback FAIL ${url}: ${msg}`)
      errors.push(`${url}: ${msg}`)
    }
  }

  console.error('[rss] ALL sources failed:', errors.join(' | '))
  return []
}

// Debug helper — tests all search + feed sources.
// Used by /api/debug-rss
export async function debugAllSources(): Promise<{
  url: string
  type: 'search' | 'feed'
  ok: boolean
  itemCount?: number
  matchCount?: number
  error?: string
  firstItem?: string
}[]> {
  const searchUrls = NITTER_INSTANCES.flatMap((instance) =>
    SEARCH_QUERIES.map((q) => ({ url: buildSearchUrl(instance, q), type: 'search' as const }))
  )
  const feedUrls = FEED_FALLBACK_SOURCES.map((url) => ({ url, type: 'feed' as const }))
  const allSources = [...searchUrls, ...feedUrls]

  return Promise.all(
    allSources.map(async ({ url, type }) => {
      try {
        const parser = new Parser({ timeout: 10000 })
        const feed = await parser.parseURL(url)
        const itemCount = feed.items?.length ?? 0
        const matchCount = (feed.items ?? []).filter((item) => {
          const title = (item.title ?? '').trim()
          if (title.startsWith('RT by @') || title.startsWith('RT @')) return false
          return SEARCH_PHRASES.some((p) => title.toLowerCase().includes(p.toLowerCase()))
        }).length
        const firstItem = feed.items?.[0]?.title?.slice(0, 80) ?? ''
        return { url, type, ok: true, itemCount, matchCount, firstItem }
      } catch (err) {
        return { url, type, ok: false, error: (err as Error).message }
      }
    })
  )
}
