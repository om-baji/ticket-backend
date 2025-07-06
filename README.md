# 🚄 Train Ticket Booking System

A high-performance backend for real-time **train ticket reservation**, architected using **Go**, **Bun.js**, **Redis**, and **PostgreSQL**.

- 🎟️ **Ticketing Engine**: A Go-based gRPC service handles concurrent seat allocation using Redis-backed atomic locking with Lua.
- 🧾 **Service Layer**: A Bun.js + Express app provides APIs for authentication, train search, booking requests, and integrates with the gRPC engine.
- 🕰️ **Scheduler (Cron)**: Periodically populates Redis ZSET + BITMAP structures from the PostgreSQL seat configuration.

Built for speed, concurrency, and real-world constraints like coach/berth preferences and quotas.


---

## 🧩 Tech Stack

| Component        | Tech                                    |
| ---------------- | --------------------------------------- |
| Booking Engine   | Go (gRPC, Redis Lua)                    |
| Redis Seeder/API | Bun.js + Express                        |
| DB               | PostgreSQL                              |
| Cache & Locking  | Redis (ZSET + BITMAP + Lua)             |
| Concurrency      | Go Goroutines                           |
| Messaging (opt)  | Redis Streams (planned for async flows) |

---

## 📂 Project Structure

```
.
├── cron/                    # Optional: Redis stream-based job pushers (future)
├── docker-compose.yml       # Redis + PostgreSQL orchestration
├── README.md                # This file
├── proto/                   # gRPC protobuf definitions
├── service/                 # Bun.js + Express APIs
│   ├── src/
│   │   ├── redis.ts         # Redis connection (ioredis)
│   │   ├── populate.ts      # Redis population script (ZSET + BITMAP)
│   │   └── server.ts        # Express endpoints (optional)
│   ├── package.json
│   ├── tsconfig.json
│   └── bun.lockb
├── ticket-engine/           # Go core logic
│   ├── db/                  # Redis/Postgres clients
│   └── helper/              # Concurrent seat allocator
├── service/                 # gRPC Booking Server (main.go)
│   └── main.go
└── go.mod / go.sum
```

---

## 🔧 Environment Variables

`.env` (shared by both Go and Node)

```env
REDIS_URI=redis://host.docker.internal:6379
DATABASE_URL=postgres://postgres:postgres@localhost:5432/train
```

> `host.docker.internal` works for Go apps **outside Docker**, talking to containers.

---

## 🚀 Setup & Run

### 1. Start Redis and PostgreSQL

```bash
docker-compose up -d
```

### 2. Seed PostgreSQL Tables

Seed the following tables (manual SQL or Prisma seeder):

* `Train`
* `TrainSeatConfig` (includes class, berth, seat count, trainId)

### 3. Populate Redis via Bun.js

```bash
cd service
bun src/populate.ts
```

This script will:

* Query all configs from `TrainSeatConfig` (joined with `Train`)
* Fill Redis ZSET per berth (e.g., `redis:ZSET:12345:SL:LB`)
* Fill Redis BITMAP per berth (e.g., `redis:BITMAP:12345:SL:LB`)

---

## 📦 gRPC Booking Flow

### `BookingRequest` Format

```protobuf
message BookingRequest {
  string trainId;
  string date;
  string userId;
  string travelClass;
  string quota;
  repeated Passenger passengers;
}
```

### Allocation Strategy

✅ For each passenger:

1. Lua script atomically fetches a seat from ZSET
2. Checks BITMAP if it's free
3. Marks it as booked
4. ZREM to prevent race conditions
5. Returns confirmed seat or fallback to `WAITLISTED`

### Lua Script (Go)

```lua
local seat = redis.call("ZRANGE", KEYS[2], 0, 0)[1]
if not seat then return nil end
local index = tonumber(string.match(seat, "-(%d+)$"))
if not index or index < 1 then return nil end
index = index - 1
if redis.call("GETBIT", KEYS[1], index) == 1 then return nil end
redis.call("SETBIT", KEYS[1], index, 1)
redis.call("ZREM", KEYS[2], seat)
return seat
```

✅ Executed via `redis.NewScript().Run(...)` in `ConcurrentSeat()` function.

---

## 👥 Sample Booking Payload

```json
{
  "trainId": "12345",
  "date": "2025-07-05",
  "userId": "user_789",
  "travelClass": "SL",
  "quota": "GENERAL",
  "passengers": [
    { "name": "Example", "berth": "LB", "age": 18 },
    { "name": "Another", "berth": "LB", "age": 18 }
  ]
}
```

> Make a gRPC request via client or `grpcurl` tool.

---

## 🛠 Redis Key Design

| Key                                | Type   | Usage                                 |
| ---------------------------------- | ------ | ------------------------------------- |
| `redis:ZSET:TrainId:Class:Berth`   | ZSET   | Sorted seat strings (e.g. `SL-1`)     |
| `redis:BITMAP:TrainId:Class:Berth` | BITMAP | Bit index per seat (0=free, 1=booked) |

---

## 📊 Benchmarks

* 🧵 Goroutine-based seat locking under **700ms for 10 passengers**
* 🚫 Zero collision across concurrent bookings (due to Lua atomicity)
* ⚡ Redis-only for availability check = low latency

---
