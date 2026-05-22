-- AirGuard — Initial Schema Migration
-- Run in: Supabase Dashboard → SQL Editor → New Query

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ──────────────────────────────────────────────
-- USERS
-- ──────────────────────────────────────────────
CREATE TABLE users (
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
CREATE TABLE devices (
  id              TEXT PRIMARY KEY,  -- ex: "airguard_01", setat pe ESP32
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  location        TEXT,
  status          TEXT DEFAULT 'offline',
  -- Stare actuatoare
  window_open     BOOLEAN DEFAULT false,
  window_mode     TEXT DEFAULT 'manual',
  fan_on          BOOLEAN DEFAULT false,
  fan_mode        TEXT DEFAULT 'manual',
  humidifier_on   BOOLEAN DEFAULT false,
  humidifier_mode TEXT DEFAULT 'manual',
  -- Praguri alerte
  co2_threshold          FLOAT DEFAULT 1000,
  tvoc_threshold         FLOAT DEFAULT 500,
  pm25_threshold         FLOAT DEFAULT 25,
  temp_threshold_min     FLOAT DEFAULT 16,
  temp_threshold_max     FLOAT DEFAULT 30,
  humidity_threshold_min FLOAT DEFAULT 30,
  humidity_threshold_max FLOAT DEFAULT 70,
  -- Meta
  firmware    TEXT DEFAULT 'v2.1.3',
  last_sync   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- SENSOR_READINGS
-- ──────────────────────────────────────────────
CREATE TABLE sensor_readings (
  id            BIGSERIAL PRIMARY KEY,
  device_id     TEXT REFERENCES devices(id) ON DELETE CASCADE,
  timestamp     TIMESTAMPTZ DEFAULT NOW(),
  co2_ppm       FLOAT,
  tvoc_ppb      FLOAT,
  pm25_ugm3     FLOAT,
  temperature_c FLOAT,
  humidity_pct  FLOAT,
  pressure_atm  FLOAT,
  fan_on        BOOLEAN,
  humidifier_on BOOLEAN
);

-- ──────────────────────────────────────────────
-- PREDICTIONS
-- ──────────────────────────────────────────────
CREATE TABLE predictions (
  id               BIGSERIAL PRIMARY KEY,
  device_id        TEXT REFERENCES devices(id) ON DELETE CASCADE,
  timestamp        TIMESTAMPTZ DEFAULT NOW(),
  pred_co2         FLOAT,
  pred_tvoc        FLOAT,
  pred_pm25        FLOAT,
  pred_temperature FLOAT,
  pred_humidity    FLOAT,
  pred_pressure    FLOAT
);

-- ──────────────────────────────────────────────
-- ALERTS
-- ──────────────────────────────────────────────
CREATE TABLE alerts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id  TEXT REFERENCES devices(id) ON DELETE CASCADE,
  metric     TEXT,
  value      FLOAT,
  severity   TEXT,
  message    TEXT,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────────
CREATE INDEX idx_sensor_readings_device_time ON sensor_readings(device_id, timestamp DESC);
CREATE INDEX idx_predictions_device_time ON predictions(device_id, timestamp DESC);
CREATE INDEX idx_alerts_device_unread ON alerts(device_id, is_read);
