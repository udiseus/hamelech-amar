import Parser from 'rss-parser'

// Multiple Nitter instances as fallbacks — if one is down, try the next
const NITTER_INSTANCES = [
  'https://nitter.privacydev.net',
  'https://nitter.poast.org',
  'https://nitter.1d4.us',
  'https://nitter.rawbit.ninja',
]

const SEARCH_PHRASES = ['טראמפ אמר לי', 'Trump told me']

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

function toOfficialUrl(nitterUrl: string): string {
  // Convert nitter URL to official x.com URL
  return nitterUrl
    .replace(/https:\/\/[^/]+\//, 'https://x.com/')
    .replace('/x.com/status/', '/x.com/BarakRavid/status/')
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
      console.log(`[rss] fetched ${tweets.length} matched tweets from ${instance}`)
      return tweets
    } catch (err) {
      console.warn(`[rss] instance ${instance} failed:`, (err as Error).message)
    }
  }

  console.error('[rss] all Nitter instances failed')
  return []
}
