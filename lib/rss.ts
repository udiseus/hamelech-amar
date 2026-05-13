import Parser from 'rss-parser'

const NITTER_INSTANCES = [
  'https://nitter.privacydev.net',
  'https://nitter.poast.org',
  'https://nitter.1d4.us',
  'https://nitter.rawbit.ninja',
]

// All phrases we track — English + Hebrew
export const SEARCH_PHRASES = [
  // Core English
  'Trump told me',
  'Trump told Axios',
  'Trump told me in an interview',
  // Direct attribution
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
  // Scoop prefixes (these appear at start of tweet)
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

async function fetchFromInstance(instance: string): Promise<RawTweet[]> {
  const parser = new Parser({ timeout: 8000 })
  const feedUrl = `${instance}/BarakRavid/rss`
  const feed = await parser.parseURL(feedUrl)
  const results: RawTweet[] = []

  for (const item of feed.items ?? []) {
    const text = item.contentSnippet ?? item.title ?? ''
    const link = item.link ?? ''
    const pubDate = item.pubDate ?? new Date().toISOString()

    const matchedPhrase = SEARCH_PHRASES.find((p) =>
      text.toLowerCase().includes(p.toLowerCase())
    )
    if (!matchedPhrase) continue

    const tweetId = extractTweetId(link)
    if (!tweetId) continue

    results.push({
      tweet_id: tweetId,
      text,
      created_at: new Date(pubDate).toISOString(),
      url: `https://x.com/BarakRavid/status/${tweetId}`,
      matched_phrase: matchedPhrase,
    })
  }
  return results
}

export async function fetchNewTweets(): Promise<RawTweet[]> {
  for (const instance of NITTER_INSTANCES) {
    try {
      const tweets = await fetchFromInstance(instance)
      console.log(`[rss] ${tweets.length} matched from ${instance}`)
      return tweets
    } catch (err) {
      console.warn(`[rss] ${instance} failed:`, (err as Error).message)
    }
  }
  console.error('[rss] all Nitter instances failed')
  return []
}
