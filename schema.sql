-- ==============================================
-- Blog Database Schema for Cloudflare D1
-- Run: wrangler d1 execute gaumatosewa-db --file=./schema.sql
-- ==============================================

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  text TEXT NOT NULL,
  ip_hash TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  likes INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS post_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  ip_hash TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(post_slug, visitor_id)
);

CREATE TABLE IF NOT EXISTS post_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug TEXT NOT NULL,
  visitor_id TEXT,
  ip_hash TEXT,
  viewed_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_comments_slug ON comments(post_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_slug ON post_likes(post_slug);
CREATE INDEX IF NOT EXISTS idx_views_slug ON post_views(post_slug);
