import Parser from 'rss-parser'

// RSS sources in priority order.
// RSSHub is the most reliable from cloud IPs (AWS/Vercel).
// Nitter instances are kept as fallback — many block cloud IPs but some don't.
const RSS_SOURCES = [
  'https://nitter.meowing.monster/BarakRavid/rss',
  'https://goyimx.com/BarakRavid/rss',
  'https://nitter.kareem.one/BarakRavid/rss',
  'https://shitter.thepixora.com/BarakRavid/rss',
  'https://rsshub.app/twitter/user/BarakRavid',
  'https://xcancel.com/BarakRavid/rss',
]

// All phrases we track — English + Hebrew
export const SEARCH_PHRASES = [
  // Core English
  'Trump told me',
  'Trump tells me',
  'Trump told Axios',
  'Trump told me in an interview',
  // Direct attribution
  'In a phone call with me',
  'In an interview with me',
  'Speaking to me',
  'In comments to me',
  // Reporting verbs — only direct contact with Ravid
  'Trump confirmed to me',
  'I asked Trump',
  // Scoop prefixes (these appear at start of tweet)
  'SCOOP: Trump told me',
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

async function fetchFromUrl(feedUrl: string): Promise<RawTweet[]> {
  const parser = new Parser({ timeout: 10000 })
  const feed = await parser.parseURL(feedUrl)

  if (!feed.items || feed.items.length === 0) {
    throw new Error('Empty feed')
  }

  const results: RawTweet[] = []

  for (const item of feed.items) {
    const title = item.title ?? ''

    // Skip retweets
    if (title.startsWith('RT by @') || title.startsWith('RT @')) continue

    const link = item.link ?? ''
    const pubDate = item.pubDate ?? new Date().toISOString()

    // Match only on title — not description/contentSnippet which contain quoted tweet text
    // and cause false positives
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

export type FetchResult = {
  tweets: RawTweet[]
  allSourcesFailed: boolean
  successSource?: string
}

export async function fetchNewTweets(): Promise<FetchResult> {
  const errors: string[] = []

  for (const url of RSS_SOURCES) {
    try {
      const tweets = await fetchFromUrl(url)
      console.log(`[rss] SUCCESS ${url} → ${tweets.length} matched`)
      return { tweets, allSourcesFailed: false, successSource: url }
    } catch (err) {
      const msg = (err as Error).message
      console.warn(`[rss] FAIL ${url}: ${msg}`)
      errors.push(`${url}: ${msg}`)
    }
  }

  console.error('[rss] ALL sources failed:', errors.join(' | '))
  return { tweets: [], allSourcesFailed: true }
}
