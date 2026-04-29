# AirGuard Backend

Backend NestJS pentru sistemul IoT AirGuard — monitorizare calitate aer în timp real.

## Arhitectură

```
Angular Frontend  ──HTTP──►  NestJS Backend  ──SQL──►  Supabase PostgreSQL
                  ◄─WS────                  ◄─MQTT──  HiveMQ Cloud
                                                       ESP32 Devices
```

## Cerințe sistem

- Node.js 18+
- npm 9+
- Cont Supabase (gratuit: supabase.com)
- Cont HiveMQ Cloud (gratuit: hivemq.com)

## Setup

### 1. Instalare dependențe

```bash
npm install
```

### 2. Configurare variabile de mediu

Copiază `.env.example` în `.env` și completează credențialele:

```bash
cp .env.example .env
```

Editează `.env`:
- `SUPABASE_URL` și `SUPABASE_SERVICE_KEY` — din Supabase Dashboard → Project Settings → API
- `MQTT_HOST`, `MQTT_USERNAME`, `MQTT_PASSWORD` — din HiveMQ Cloud Console
- `JWT_SECRET` — un șir aleatoriu lung (ex: `openssl rand -hex 32`)

### 3. Creare schema bază de date

În **Supabase Dashboard → SQL Editor → New Query**, rulează conținutul din:
```
supabase-schema.sql
```

### 4. Pornire server

```bash
# Development (cu hot-reload)
npm run start:dev

# Production
npm run build
npm run start:prod
```

Serverul pornește pe `http://localhost:3000`.

---

## Endpoint-uri API

### Auth (publice)

#### POST /auth/register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Ion Popescu", "email": "ion@example.com", "password": "parola123"}'
```
**Response:**
```json
{
  "id": "uuid",
  "name": "Ion Popescu",
  "email": "ion@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ion@example.com", "password": "parola123"}'
```
**Response:** aceeași structură ca `/auth/register`

> **Notă:** Frontend-ul salvează răspunsul complet în `localStorage['airguard_user']` și extrage `user.token` pentru header-ul `Authorization`.

---

### Devices (JWT required)

#### GET /devices
```bash
curl http://localhost:3000/devices \
  -H "Authorization: Bearer TOKEN"
```
**Response:** `Device[]`

#### GET /devices/:id
```bash
curl http://localhost:3000/devices/DEVICE_UUID \
  -H "Authorization: Bearer TOKEN"
```

#### POST /devices
```bash
curl -X POST http://localhost:3000/devices \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Senzor Bucătărie", "location": "Bucătărie", "windowMode": "auto"}'
```

#### PATCH /devices/:id
```bash
# Toggle fereastră
curl -X PATCH http://localhost:3000/devices/DEVICE_UUID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"windowOpen": true}'

# Actualizare praguri + mod
curl -X PATCH http://localhost:3000/devices/DEVICE_UUID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"co2Threshold": 900, "pm25Threshold": 20, "windowMode": "auto"}'
```

**Device Response:**
```json
{
  "id": "uuid",
  "name": "Senzor Living",
  "location": "Camera de zi",
  "status": "online",
  "windowOpen": false,
  "windowMode": "auto",
  "firmware": "v2.1.3",
  "lastSync": "2026-04-29T10:00:00.000Z",
  "co2Threshold": 1000,
  "pm25Threshold": 25
}
```

---

### History / Sensor Readings (JWT required)

#### GET /history/:deviceId?from=ISO&to=ISO
```bash
curl "http://localhost:3000/history/DEVICE_UUID?from=2026-04-22T00:00:00.000Z&to=2026-04-29T23:59:59.000Z" \
  -H "Authorization: Bearer TOKEN"
```
**Response:** `HistoryEntry[]`
```json
[
  {
    "deviceId": "uuid",
    "co2": 850,
    "pm25": 18.5,
    "temperature": 22.3,
    "humidity": 55,
    "timestamp": "2026-04-29T10:00:00.000Z"
  }
]
```

---

## WebSocket (Socket.IO)

Frontend-ul se conectează la `http://localhost:3000` cu `socket.io-client` și ascultă:

### Eveniment: `sensor-data` (Server → Client)
```javascript
// Frontend:
const socket = io('http://localhost:3000');
socket.on('sensor-data', (data) => {
  console.log(data);
  // { deviceId, co2, pm25, temperature, humidity, timestamp }
});
```

Evenimentul este emis automat de backend la fiecare citire MQTT de la un ESP32.

---

## Topicuri MQTT

| Topic | Direcție | Payload | Descriere |
|-------|----------|---------|-----------|
| `airguard/{deviceId}/sensors` | ESP32 → Backend | `{"co2":850,"pm25":15.2,"temperature":22.1,"humidity":55}` | Date senzori |
| `airguard/{deviceId}/status` | ESP32 → Backend | `{"online":true}` | Status conexiune |
| `airguard/{deviceId}/window/cmd` | Backend → ESP32 | `{"open":true}` | Comandă fereastră |
| `airguard/{deviceId}/window/state` | ESP32 → Backend | `{"open":true}` | Confirmare fereastră |

### Flux complet date live:
```
ESP32 publică pe MQTT → Backend primește → salvează în DB → verifică praguri → emite 'sensor-data' via Socket.IO → Angular actualizează UI
```

---

## Conectare cu Angular Frontend

1. Setează `useMockData: false` în `Website_AirGuard/src/environments/environment.ts`
2. Verifică `apiUrl: 'http://localhost:3000'` și `wsUrl: 'http://localhost:3000'`
3. Pornește backend-ul: `npm run start:dev`
4. Pornește frontend-ul: `ng serve`

---

## Structura proiect

```
src/
├── config/configuration.ts     # Variabile de mediu tipizate
├── database/
│   ├── supabase.service.ts     # Client Supabase singleton
│   └── database.module.ts
├── auth/
│   ├── auth.service.ts         # login, register, generateToken
│   ├── auth.controller.ts      # POST /auth/login, /auth/register
│   ├── jwt.strategy.ts         # Passport JWT strategy
│   ├── jwt-auth.guard.ts       # Guard reutilizabil
│   └── dto/                    # LoginDto, RegisterDto
├── users/users.service.ts      # findByEmail, findById, create
├── devices/
│   ├── devices.service.ts      # CRUD + mapare camelCase + MQTT cmd
│   ├── devices.controller.ts   # GET/POST/PATCH /devices
│   └── dto/                    # CreateDeviceDto, UpdateDeviceDto
├── sensors/
│   ├── sensors.service.ts      # saveReading, getHistory, getLatest
│   └── sensors.controller.ts   # GET /history/:deviceId
├── alerts/alerts.service.ts    # checkAndCreateAlerts, getAlertsByDevice
├── mqtt/mqtt.service.ts        # Bridge HiveMQ ↔ NestJS
├── gateway/sensors.gateway.ts  # Socket.IO gateway → emitSensorData
└── app.module.ts
```
