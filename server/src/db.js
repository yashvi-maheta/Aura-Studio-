/**
 * db.js — SQLite database setup using better-sqlite3
 *
 * Creates the database file at server/data/aura.db on first run.
 * All tables are created with IF NOT EXISTS so the file is safe to keep
 * across restarts.
 */

const Database = require('better-sqlite3')
const path     = require('path')
const fs       = require('fs')

// Ensure the data directory exists
// const dataDir = path.join(__dirname, '..', 'data')
// if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)

// const db = new Database(path.join(dataDir, 'aura.db'))
const dataDir = process.env.DB_DIR || path.join(__dirname, '..', 'data')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const db = new Database(path.join(dataDir, 'aura.db'))
// WAL mode gives better concurrent read performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ─── Schema ───────────────────────────────────────────────────────────────────

db.exec(`
  -- Services catalogue
  CREATE TABLE IF NOT EXISTS services (
    id          TEXT    PRIMARY KEY,
    name        TEXT    NOT NULL,
    description TEXT    NOT NULL DEFAULT '',
    price_inr   INTEGER NOT NULL CHECK(price_inr > 0),
    duration_min INTEGER NOT NULL CHECK(duration_min > 0),
    popular     INTEGER NOT NULL DEFAULT 0 CHECK(popular IN (0,1)),
    active      INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Stylists
  CREATE TABLE IF NOT EXISTS stylists (
    id             TEXT    PRIMARY KEY,
    name           TEXT    NOT NULL,
    role           TEXT    NOT NULL DEFAULT '',
    pin_hash       TEXT    NOT NULL,
    avatar_initials TEXT   NOT NULL DEFAULT '',
    active         INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
    locked_until   TEXT,
    fail_count     INTEGER NOT NULL DEFAULT 0,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Admin account (single row, id always 'admin')
  CREATE TABLE IF NOT EXISTS admin (
    id            TEXT    PRIMARY KEY DEFAULT 'admin',
    username      TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    fail_count    INTEGER NOT NULL DEFAULT 0,
    locked_until  TEXT
  );

  -- Daily token counter – one row per calendar date (server local date)
  CREATE TABLE IF NOT EXISTS daily_counters (
    date     TEXT PRIMARY KEY,  -- YYYY-MM-DD
    counter  INTEGER NOT NULL DEFAULT 0
  );

  -- Queue tokens
  CREATE TABLE IF NOT EXISTS tokens (
    id                   TEXT    PRIMARY KEY,   -- UUID v4
    token_label          TEXT    NOT NULL,      -- e.g. A-07
    customer_name        TEXT    NOT NULL,
    phone                TEXT    NOT NULL DEFAULT '',
    service_id           TEXT    NOT NULL REFERENCES services(id),
    stylist_id           TEXT    REFERENCES stylists(id),
    assigned_stylist_id  TEXT    REFERENCES stylists(id),
    status               TEXT    NOT NULL DEFAULT 'waiting'
                         CHECK(status IN ('waiting','called','in_service','completed','no_show','cancelled')),
    queue_date           TEXT    NOT NULL,      -- YYYY-MM-DD
    position             INTEGER NOT NULL DEFAULT 0,
    cancelled_reason     TEXT,
    created_at           TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at           TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`)

module.exports = db
