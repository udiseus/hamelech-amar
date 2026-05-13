-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Matched tweets table
create table if not exists matched_tweets (
  id uuid default uuid_generate_v4() primary key,
  tweet_id text unique not null,
  text text not null,
  created_at timestamptz not null,
  url text not null,
  matched_phrase text not null,
  count_number integer not null,
  detected_at timestamptz default now()
);

create index if not exists idx_matched_tweets_created_at on matched_tweets(created_at desc);
create index if not exists idx_matched_tweets_count_number on matched_tweets(count_number desc);

-- Subscribers table
create table if not exists subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  confirmed boolean default false,
  confirmation_token text unique,
  created_at timestamptz default now(),
  unsubscribed_at timestamptz
);

create index if not exists idx_subscribers_email on subscribers(email);
create index if not exists idx_subscribers_token on subscribers(confirmation_token);

-- Row Level Security
alter table matched_tweets enable row level security;
alter table subscribers enable row level security;

-- Allow public read on matched_tweets
create policy "Public can read tweets" on matched_tweets
  for select using (true);

-- Only service role can insert/update/delete
create policy "Service role only insert tweets" on matched_tweets
  for insert with check (auth.role() = 'service_role');

create policy "Service role only insert subscribers" on subscribers
  for insert with check (true);

create policy "Service role only update subscribers" on subscribers
  for update using (true);
