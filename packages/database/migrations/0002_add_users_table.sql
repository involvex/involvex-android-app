-- Migration 0002: Add users table and link subscriptions
-- Enables multi-user support and admin features

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE, -- Allow NULL if they only have OAuth for now? No, better to keep email as primary identifier if possible
  password_hash TEXT, -- Allow NULL for OAuth-only users
  username TEXT,
  role TEXT DEFAULT 'user', -- 'user' or 'admin'
  avatar_url TEXT,
  discord_id TEXT UNIQUE,
  github_id TEXT UNIQUE,
  created_at INTEGER DEFAULT (unixepoch() * 1000),
  updated_at INTEGER DEFAULT (unixepoch() * 1000)
);

-- Add user_id to subscriptions
-- Since existing rows might not have user_id, we'll allow NULL for now or migration logic
-- For a new deployment, we can just alter
ALTER TABLE subscriptions ADD COLUMN user_id TEXT REFERENCES users(id) ON DELETE CASCADE;

-- Create index for user subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
