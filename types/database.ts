export type Database = {
  public: {
    Tables: {
      matched_tweets: {
        Row: {
          id: string
          tweet_id: string
          text: string
          created_at: string
          url: string
          matched_phrase: string
          count_number: number
          detected_at: string
        }
        Insert: {
          id?: string
          tweet_id: string
          text: string
          created_at: string
          url: string
          matched_phrase: string
          count_number: number
          detected_at?: string
        }
        Update: {
          id?: string
          tweet_id?: string
          text?: string
          created_at?: string
          url?: string
          matched_phrase?: string
          count_number?: number
          detected_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          id: string
          email: string
          confirmed: boolean
          confirmation_token: string | null
          created_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          id?: string
          email: string
          confirmed?: boolean
          confirmation_token?: string | null
          created_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          confirmed?: boolean
          confirmation_token?: string | null
          created_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
