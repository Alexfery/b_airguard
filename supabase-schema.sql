-- ============================================================
-- AirGuard — Schema Supabase PostgreSQL
-- Rulează în: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Extensie UUID (activată implicit în Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────
-- USERS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT,
  role          TEXT DEFAULT 'user',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- DEVICES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  location       TEXT DEFAULT '',
  status         TEXT DEFAULT 'offline',     -- 'online' | 'offline'
  window_open    BOOLEAN DEFAULT false,
  window_mode    TEXT DEFAULT 'manual',      -- 'auto' | 'manual'
  firmware       TEXT DEFAULT 'v2.1.3',
  last_sync      TIMESTAMPTZ,
  co2_threshold  FLOAT DEFAULT 1000,
  pm25_threshold FLOAT DEFAULT 25,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- SENSOR READINGS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sensor_readings (
  id          BIGSERIAL PRIMARY KEY,
  device_id   UUID REFERENCES devices(id) ON DELETE CASCADE,
  co2         FLOAT,
  pm25        FLOAT,
  temperature FLOAT,
  humidity    FLOAT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index pentru interogări frecvente pe history
CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_created
  ON sensor_readings(device_id, created_at DESC);

-- ──────────────────────────────────────────────
-- ALERTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id  UUID REFERENCES devices(id) ON DELETE CASCADE,
  metric     TEXT NOT NULL,          -- 'CO2' | 'PM2.5' | 'temperature' | 'humidity'
  value      FLOAT NOT NULL,
  severity   TEXT DEFAULT 'warning', -- 'warning' | 'danger'
  message    TEXT NOT NULL,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_device_created
  ON alerts(device_id, created_at DESC);

-- ──────────────────────────────────────────────
-- ROW LEVEL SECURITY (opțional dar recomandat)
-- Dezactivează RLS dacă folosești Service Role Key
-- ──────────────────────────────────────────────
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
