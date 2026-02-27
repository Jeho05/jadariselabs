# Video Generation Module - Enterprise Architecture

## 📋 Overview

Module de génération vidéo IA de niveau production avec architecture enterprise-grade, incluant:
- Queue asynchrone avec BullMQ + Redis
- Client Replicate avancé avec cache multi-niveau
- WebSocket pour suivi temps réel
- Monitoring Prometheus + logging structuré
- Sécurité maximale (rate limiting, validation, modération)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Video Studio │  │ WebSocket    │  │ Progress Tracking    │   │
│  │ Page         │  │ Hook         │  │ UI                   │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Layer                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Auth         │  │ Rate         │  │ Content Moderation   │   │
│  │ Middleware   │  │ Limiter      │  │ Service              │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Video Generation API Route                   │   │
│  │  - Validation    - Credit Check    - Queue Management    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Queue System                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    BullMQ Queue                           │   │
│  │  - Priority Queues (Pro > Starter > Free)                │   │
│  │  - Job Retry Logic    - Concurrency Control               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Redis Backend                          │   │
│  │  - Job Storage    - Cache Layer    - Pub/Sub              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Worker Pool                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Video Generation Worker                      │   │
│  │  - Prompt Enhancement    - Prediction Creation            │   │
│  │  - Progress Polling      - Storage Upload                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Replicate    │  │ Supabase     │  │ WebSocket Server     │   │
│  │ API          │  │ Storage/DB   │  │ (Socket.io)          │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
lib/
├── config/
│   └── queue.ts                    # Queue configuration
├── types/
│   └── video.ts                    # Video-specific types
├── queue/
│   ├── redis.ts                    # Redis connection manager
│   └── video-queue.ts              # BullMQ queue manager
├── replicate/
│   └── client.ts                   # Enterprise Replicate client
├── workers/
│   └── video-worker.ts             # Job processor
├── cache/
│   └── manager.ts                  # Multi-level cache
├── websocket/
│   ├── server.ts                   # Socket.io server
│   └── hook.ts                     # React hook for client
├── monitoring/
│   └── metrics.ts                  # Prometheus metrics
└── types.ts                        # Shared types

app/
├── api/
│   └── generate/
│       └── video/
│           └── route.ts            # Video generation API
└── (protected)/
    └── studio/
        └── video/
            └── page-enterprise.tsx # Enterprise UI
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install bullmq ioredis socket.io socket.io-client prom-client winston dompurify rate-limiter-flexible node-cache sharp
```

### 2. Configure Environment

```bash
cp .env.enterprise.example .env.local
```

Edit `.env.local` with your credentials:
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `REPLICATE_API_TOKEN`
- `NEXT_PUBLIC_APP_URL`

### 3. Start Redis

```bash
# Docker
docker run -d -p 6379:6379 redis:7-alpine

# Or local installation
redis-server
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Start Worker (separate process)

```bash
# Create worker entry point
node lib/workers/start-worker.js
```

## 🔧 Configuration

### Queue Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `QUEUE_MAX_CONCURRENT` | 3 | Max concurrent jobs per worker |
| `QUEUE_TIMEOUT_MS` | 300000 | Job timeout (5 minutes) |
| `REDIS_HOST` | localhost | Redis server host |
| `REDIS_PORT` | 6379 | Redis server port |

### Rate Limits

| Limit | Requests | Window |
|-------|----------|--------|
| Per Minute | 10 | 60s |
| Per Hour | 100 | 3600s |
| Per Day | 500 | 86400s |

### Video Models

| Model | Credits/sec | Max Duration | Avg Time/sec |
|-------|-------------|--------------|--------------|
| Wan 2.1 | 1 | 15s | 30s |
| Gen-2 | 2 | 10s | 45s |
| Sora | 3 | 30s | 60s |

## 📊 Monitoring

### Prometheus Metrics

Access metrics at `/api/metrics`:

```promql
# Queue metrics
video_queue_length{priority="high"}
video_queue_processing_time_seconds
video_queue_jobs_total{status="success"}

# API metrics
video_api_requests_total{endpoint="/api/generate/video"}
video_api_request_duration_seconds

# Business metrics
video_generations_total{plan="pro"}
video_credits_consumed_total
```

### Structured Logs

Logs are JSON-formatted for easy parsing:

```json
{
  "timestamp": "2026-02-27T18:36:00Z",
  "level": "info",
  "service": "video-api",
  "message": "Job created",
  "generationId": "gen_123",
  "traceId": "vid_123_abc"
}
```

## 🔒 Security

### Input Validation
- Prompt length: 1-1000 characters
- Duration: 1-60 seconds
- Model whitelist validation
- XSS sanitization with DOMPurify

### Content Moderation
- Forbidden word detection
- Optional AI moderation API integration
- User reputation scoring

### Rate Limiting
- Token bucket algorithm
- Per-user limits
- Automatic retry with backoff

### Authentication
- JWT validation via Supabase
- Role-based access control
- Session management

## 🎯 API Endpoints

### POST /api/generate/video

Create a new video generation job.

**Request:**
```json
{
  "prompt": "A majestic lion walking in the savanna...",
  "duration": 5,
  "model": "wan2",
  "quality": "high",
  "style": "cinematic"
}
```

**Response:**
```json
{
  "success": true,
  "generation_id": "gen_abc123",
  "job_id": "job_xyz789",
  "estimated_time_seconds": 150,
  "queue_position": 3,
  "model_used": "wan2",
  "credits_charged": 8,
  "remaining_credits": 192,
  "trace_id": "vid_123_abc"
}
```

### GET /api/generate/video

Get generation status or list generations.

**Query Parameters:**
- `generation_id` (optional): Get specific generation

**Response:**
```json
{
  "success": true,
  "generation": {
    "id": "gen_abc123",
    "status": "completed",
    "result_url": "https://...",
    "queue_status": null
  }
}
```

### DELETE /api/generate/video

Cancel a generation.

**Query Parameters:**
- `generation_id`: Generation to cancel

## 🔄 WebSocket Events

### Client → Server

| Event | Data | Description |
|-------|------|-------------|
| `subscribe` | `{ generationId }` | Subscribe to updates |
| `unsubscribe` | `{ generationId }` | Unsubscribe |
| `cancel` | `{ generationId }` | Cancel generation |

### Server → Client

| Event | Data | Description |
|-------|------|-------------|
| `job:queued` | `{ generationId, position }` | Job queued |
| `job:started` | `{ generationId, workerId }` | Processing started |
| `job:progress` | `{ generationId, percent, stage, message }` | Progress update |
| `job:completed` | `{ generationId, videoUrl }` | Generation complete |
| `job:failed` | `{ generationId, error, retryIn? }` | Generation failed |
| `job:cancelled` | `{ generationId }` | Generation cancelled |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test video-generation.test.ts

# Run with coverage
npm test -- --coverage
```

## 📈 Performance Optimization

### Caching Strategy

1. **L1 Memory Cache**: 1ms latency, 100MB max
2. **L2 Redis Cache**: 5ms latency, distributed
3. **L3 CDN Cache**: 20ms latency, global
4. **L4 Database**: 50ms latency, persistent

### Connection Pooling

- PgBouncer for Supabase connections
- Redis connection pooling
- HTTP keep-alive for Replicate API

### Worker Autoscaling

Scale workers based on queue length:
- Scale up: queue_length > 10
- Scale down: queue_length < 5

## 🐛 Troubleshooting

### Redis Connection Issues

```bash
# Check Redis status
redis-cli ping

# Check Redis logs
docker logs redis-container
```

### Queue Not Processing

1. Check worker is running
2. Check Redis connection
3. Check queue stats: `GET /api/queue/stats`

### WebSocket Not Connecting

1. Check `NEXT_PUBLIC_APP_URL` is correct
2. Check CORS settings
3. Check Socket.io path: `/api/socket`

## 📚 Additional Resources

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Replicate API Docs](https://replicate.com/docs)
- [Socket.io Guide](https://socket.io/docs/v4/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)

## 📝 License

Proprietary - JadaRiseLabs
