import Parser from 'rss-parser'

// ── Fallback list — used only if status.d420.de is unreachable ───────────────
const NITTER_INSTANCES_FALLBACK = [
  'https://nitter.privacyredirect.com',
  'https://nitter.poast.org',
  'https://xcancel.com',
  'https://nitter.net',
  'https://nitter.space',
]

// ── Dynamic instance discovery ───────────────────────────────────────────────
// Fetches the live list of healthy Nitter instances from status.d420.de.
// Filters for healthy:true AND rss:true (rss:false = RSS disabled at config level).
async function getHealthyInstances(): Promise<string[]> {
  try {
    const res = await fetch('https://status.d420.de/api/v1/instances/', {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json() as {
      hosts: Array<{ url: string; healthy: boolean; rss: boolean }>
    }
    const instances = (data.hosts ?? [])
      .filter((h) => h.healthy === true && h.rss === true)
      .map((h) => h.url.replace(/\/$/,  ''))
    if (instances.length > 0) {
      console.log(
        `[rss] status.d420.de → ${instances.length} healthy RSS instances: ${instances.join(', ')}`
      )
      return instances
    }
    throw new Error('no healthy RSS instances returned')
  } catch (err) {
    console.warn('[rss] status.d420.de unavailable, using fallback:', (err as Error).message)
    return NITTER_INSTANCES_FALLBACK
  }
}

// ── Search queries — one per key phrase/verb ─────────────────────────────────
// WHY SEARCH INSTEAD OF FEED:
//   User feed = last 20 tweets regardless of content → tweets fall out of window during downtime.
//   Search RSS = last 20 tweets *matching the query* → spans weeks/months.
const SEARCH_QUERIES = [
  // English
  'from:BarakRavid "told me"',
  'from:BarakRavid "tells me"',
  'from:BarakRavid "said to me"',
  'from:BarakRavid "says to me"',
  // Hebrew
  'from:BarakRavid "אמר לי"',
  'from:BarakRavid "סיפר לי"',
  'from:BarakRavid "מסר לי"',
  'from:BarakRavid "אמר לאקסיוס"',
  'from:BarakRavid "שוחחתי עם"',
  'from:BarakRavid "בשיחה איתי"',
  'from:BarakRavid "בראיון שהעניק"',
  'from:BarakRavid "מעורה בפרטים"',
]

// Fallback: user feed — used only if ALL search URLs fail
const FEED_FALLBACK_SOURCES = [
  'https://rsshub.app/twitter/user/BarakRavid',
  'https://rsshub.rssforever.com/twitter/user/BarakRavid',
  'https://nitter.privacyredirect.com/BarakRavid/rss',
  'https://xcancel.com/BarakRavid/rss',
  'https://nitter.poast.org/BarakRavid/rss',
]

// Secondary phrase filter — guards against Nitter returning unrelated content
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

    if (title.startsWith('RT by @') || title.startsWith('RT @')) continue

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
  // PHASE 1: Fetch live list of healthy RSS-capable Nitter instances,
  // then try all instance × query combos in parallel.
  const instances = await getHealthyInstances()
  const searchUrls = instances.flatMap((instance) =>
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

  // PHASE 2: Fallback to user feed if all search URLs failed
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
  const instances = await getHealthyInstances()
  const searchUrls = instances.flatMap((instance) =>
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
