# PRD 10 — Tech Stack & Deployment

> **Dokumen:** 10 dari 10  
> **Status:** Draft v1.0.0  
> **Tanggal:** 2026-10-20  
> **Prioritas Keseluruhan:** P0

---

## 10.1 Rekomendasi Tech Stack

### Arsitektur Tingkat Tinggi

```
┌──────────────────────────────────────────────────────────────────────────┐
│                      ARSITEKTUR SISTEM SAUMABOX                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌── Client Layer ───────────────────────────────────────────────────┐   │
│  │                                                                    │   │
│  │  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐      │   │
│  │  │   Desktop     │    │   Mobile      │    │   PWA         │      │   │
│  │  │   Browser     │    │   Browser     │    │   Installed   │      │   │
│  │  │               │    │               │    │               │      │   │
│  │  │  Chrome       │    │  Safari iOS   │    │  Home Screen  │      │   │
│  │  │  Firefox      │    │  Chrome And.  │    │  Offline      │      │   │
│  │  │  Edge         │    │               │    │  Support      │      │   │
│  │  └───────┬───────┘    └───────┬───────┘    └───────┬───────┘      │   │
│  │          │                    │                     │              │   │
│  └──────────┼────────────────────┼─────────────────────┼──────────────┘   │
│             │                    │                     │                  │
│             └────────────────────┼─────────────────────┘                  │
│                                  │                                        │
│                                  ▼                                        │
│  ┌── Application Layer ──────────────────────────────────────────────┐   │
│  │                                                                    │   │
│  │  ┌── Frontend (SPA) ─────────────────────────────────────────┐    │   │
│  │  │                                                            │    │   │
│  │  │  React / Next.js / Nuxt.js / SvelteKit                    │    │   │
│  │  │  + Service Worker (PWA)                                    │    │   │
│  │  │  + Responsive CSS                                          │    │   │
│  │  │                                                            │    │   │
│  │  └──────────────────────────┬─────────────────────────────────┘    │   │
│  │                             │ HTTP / REST API                      │   │
│  │  ┌── Backend (API Server) ──┴─────────────────────────────────┐    │   │
│  │  │                                                            │    │   │
│  │  │  Go (Fiber/Gin) / Node.js (Express/Fastify) / Rust        │    │   │
│  │  │  + Auth middleware                                         │    │   │
│  │  │  + CORS                                                    │    │   │
│  │  │  + Rate limiting                                           │    │   │
│  │  │                                                            │    │   │
│  │  └──────────────────────────┬─────────────────────────────────┘    │   │
│  │                             │                                      │   │
│  └─────────────────────────────┼──────────────────────────────────────┘   │
│                                │                                          │
│                                ▼                                          │
│  ┌── Data Layer ─────────────────────────────────────────────────────┐   │
│  │                                                                    │   │
│  │  ┌── SQLite Database ────────────────────────────────────────┐    │   │
│  │  │                                                            │    │   │
│  │  │  📁 saumabox.sqlite                                       │    │   │
│  │  │  Mode: WAL (Write-Ahead Logging)                           │    │   │
│  │  │                                                            │    │   │
│  │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │    │   │
│  │  │  │games │ │cinema│ │music │ │users │ │config│            │    │   │
│  │  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘            │    │   │
│  │  │                                                            │    │   │
│  │  └────────────────────────────────────────────────────────────┘    │   │
│  │                                                                    │   │
│  │  ┌── File Storage ───────────────────────────────────────────┐    │   │
│  │  │  📁 backups/          (backup files)                       │    │   │
│  │  │  📁 uploads/          (import files — temp)                │    │   │
│  │  └────────────────────────────────────────────────────────────┘    │   │
│  │                                                                    │   │
│  └────────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### 10.1.1 Opsi Tech Stack

| Layer | Opsi A (Recommended) | Opsi B | Opsi C |
|-------|---------------------|--------|--------|
| **Frontend** | React + Vite | Next.js (SSR) | SvelteKit |
| **UI Library** | Shadcn/UI + Tailwind | Ant Design | Skeleton UI |
| **Data Grid** | TanStack Table | AG Grid (free) | Custom |
| **State** | Zustand / Jotai | Redux Toolkit | Svelte stores |
| **Backend** | Go (Fiber) | Node.js (Fastify) | Rust (Actix) |
| **ORM/Query** | sqlc / GORM | better-sqlite3 / Drizzle | rusqlite |
| **Auth** | JWT + bcrypt | Session + cookie | Passport.js |
| **PWA** | Workbox | vite-plugin-pwa | Custom SW |
| **Database** | SQLite 3 | SQLite 3 | SQLite 3 |
| **Bundler** | Vite | Webpack (Next) | Vite (Svelte) |

### 10.1.2 Rekomendasi Stack — Detail

#### Stack A: Go + React (Direkomendasikan)

| Komponen | Teknologi | Alasan |
|----------|-----------|--------|
| **Backend** | Go 1.21+ (Fiber v2) | Binary tunggal, cepat, low memory |
| **Frontend** | React 18 + Vite 5 | Ekosistem besar, community support |
| **UI** | Shadcn/UI + Tailwind CSS | Komponen modern, customizable |
| **Data Grid** | TanStack Table v8 | Headless, flexible, performant |
| **Charts** | Recharts / Chart.js | Mudah diintegrasikan |
| **Auth** | JWT (jose) + bcrypt | Stateless, scalable |
| **PWA** | vite-plugin-pwa | Auto-generate SW & manifest |
| **Import/Export** | SheetJS (xlsx) | Multi-format support |
| **SQLite Driver** | modernc.org/sqlite | Pure Go, no CGo needed |
| **Packaging** | Single binary (embed frontend) | Mudah di-deploy |

#### Kenapa Go + React?

```
┌──────────────────────────────────────────────────────────────┐
│  Keunggulan Go + React                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Go Backend:                                                 │
│  ✅ Compile ke single binary (tanpa runtime dependency)      │
│  ✅ Embed frontend assets langsung di binary                 │
│  ✅ Memory usage rendah (~10-30MB)                           │
│  ✅ Startup time < 100ms                                     │
│  ✅ Cross-compile untuk Linux/Windows/macOS/ARM              │
│  ✅ SQLite driver pure-Go (tanpa CGo)                        │
│                                                              │
│  React Frontend:                                             │
│  ✅ Ekosistem komponen terbesar                              │
│  ✅ TanStack Table untuk data grid canggih                   │
│  ✅ Shadcn/UI komponen modern & accessible                   │
│  ✅ Vite untuk dev experience cepat                          │
│  ✅ PWA support mature                                       │
│                                                              │
│  Deployment:                                                 │
│  ✅ 1 file binary saja — download & run                      │
│  ✅ Docker image < 30MB (Alpine + binary)                    │
│  ✅ Berjalan di PC, NAS (Synology/QNAP), VPS, RPi           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 10.2 Struktur Direktori Proyek

```
saumabox/
├── cmd/
│   └── server/
│       └── main.go                 # Entry point
├── internal/
│   ├── config/
│   │   └── config.go               # App configuration
│   ├── database/
│   │   ├── database.go             # SQLite connection & migration
│   │   ├── migrations/
│   │   │   └── 001_initial.sql     # Initial schema
│   │   └── seed.go                 # Default data seeder
│   ├── handlers/
│   │   ├── auth.go                 # Login, logout, session
│   │   ├── games.go                # CRUD games
│   │   ├── cinema.go               # CRUD cinema
│   │   ├── music.go                # CRUD music
│   │   ├── import.go               # Import handler
│   │   ├── export.go               # Export handler
│   │   ├── backup.go               # Backup & restore
│   │   ├── settings.go             # App settings
│   │   ├── dashboard.go            # Dashboard stats
│   │   └── public.go               # Public API
│   ├── middleware/
│   │   ├── auth.go                 # Auth middleware
│   │   ├── cors.go                 # CORS middleware
│   │   └── ratelimit.go            # Rate limiting
│   ├── models/
│   │   ├── game.go                 # Game model
│   │   ├── cinema.go               # Cinema model
│   │   ├── music.go                # Music model
│   │   ├── user.go                 # User model
│   │   └── settings.go             # Settings model
│   ├── services/
│   │   ├── import_service.go       # Import logic & parser
│   │   ├── export_service.go       # Export logic
│   │   └── backup_service.go       # Backup/restore logic
│   └── utils/
│       ├── parser.go               # Data cleaning & conversion
│       └── response.go             # API response helpers
├── frontend/
│   ├── public/
│   │   ├── manifest.json           # PWA manifest
│   │   └── icons/                  # PWA icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── TopBar.tsx
│   │   │   │   ├── BottomNav.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   ├── data-grid/
│   │   │   │   ├── DataGrid.tsx
│   │   │   │   ├── FilterBar.tsx
│   │   │   │   ├── Pagination.tsx
│   │   │   │   └── AutoSum.tsx
│   │   │   ├── forms/
│   │   │   │   ├── GameForm.tsx
│   │   │   │   ├── CinemaForm.tsx
│   │   │   │   └── MusicForm.tsx
│   │   │   ├── cards/
│   │   │   │   ├── GameCard.tsx
│   │   │   │   ├── CinemaCard.tsx
│   │   │   │   └── MusicCard.tsx
│   │   │   └── ui/                 # Shadcn components
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   │   ├── Landing.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Setup.tsx
│   │   │   │   └── PublicCatalog.tsx
│   │   │   └── admin/
│   │   │       ├── Dashboard.tsx
│   │   │       ├── Games.tsx
│   │   │       ├── Cinema.tsx
│   │   │       ├── Music.tsx
│   │   │       ├── Import.tsx
│   │   │       ├── Export.tsx
│   │   │       └── Settings.tsx
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── lib/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
├── data/                            # Runtime data (gitignored)
│   ├── saumabox.sqlite
│   └── backups/
├── docker/
│   └── Dockerfile
├── docker-compose.yml
├── Makefile
├── go.mod
├── go.sum
└── README.md
```

---

## 10.3 Docker Deployment

### Dockerfile

```dockerfile
# ============================================================
# Multi-stage build: Go backend + React frontend
# Final image: Alpine Linux (~30MB total)
# ============================================================

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM golang:1.21-alpine AS backend-builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o saumabox ./cmd/server

# Stage 3: Final image
FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata
WORKDIR /app
COPY --from=backend-builder /app/saumabox .
RUN mkdir -p /app/data/backups

EXPOSE 8080
VOLUME ["/app/data"]

ENV TZ=Asia/Jakarta
ENV SAUMABOX_DB_PATH=/app/data/saumabox.sqlite
ENV SAUMABOX_BACKUP_PATH=/app/data/backups

CMD ["./saumabox"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  saumabox:
    build: .
    container_name: saumabox
    ports:
      - "8080:8080"
    volumes:
      - saumabox_data:/app/data
    environment:
      - TZ=Asia/Jakarta
      - SAUMABOX_PORT=8080
      - SAUMABOX_DB_PATH=/app/data/saumabox.sqlite
      - SAUMABOX_BACKUP_PATH=/app/data/backups
    restart: unless-stopped

volumes:
  saumabox_data:
    driver: local
```

### Cara Deploy

```bash
# Quick start (1 command)
docker compose up -d

# Atau tanpa Docker:
# Download binary dari GitHub Releases
./saumabox

# Akses di browser
# http://localhost:8080
```

---

## 10.4 Environment Variables

| Variable | Default | Keterangan |
|----------|---------|------------|
| `SAUMABOX_PORT` | `8080` | Port HTTP server |
| `SAUMABOX_DB_PATH` | `./data/saumabox.sqlite` | Path file database |
| `SAUMABOX_BACKUP_PATH` | `./data/backups` | Path folder backup |
| `SAUMABOX_JWT_SECRET` | (auto-generated) | Secret key JWT |
| `SAUMABOX_SESSION_TTL` | `168h` (7 hari) | Session duration |
| `SAUMABOX_MAX_UPLOAD_SIZE` | `52428800` (50MB) | Max upload size |
| `SAUMABOX_RATE_LIMIT` | `100` | Max requests/menit |
| `SAUMABOX_LOG_LEVEL` | `info` | Log level |
| `TZ` | `UTC` | Timezone |

---

## 10.5 Deployment Options

### Diagram — Opsi Deployment

```
┌──────────────────────────────────────────────────────────────────┐
│                     OPSI DEPLOYMENT                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌── Opsi 1: Docker ─────────────────────────────────────────┐   │
│  │                                                            │   │
│  │  VPS / Home Server / NAS                                   │   │
│  │  ┌────────────────────────────────────────┐                │   │
│  │  │  Docker Engine                          │                │   │
│  │  │  ┌──────────────────────────────────┐   │                │   │
│  │  │  │  SaumaBox Container              │   │                │   │
│  │  │  │  Port: 8080                      │   │                │   │
│  │  │  │  Volume: /app/data → host        │   │                │   │
│  │  │  └──────────────────────────────────┘   │                │   │
│  │  └────────────────────────────────────────┘                │   │
│  │                                                            │   │
│  │  Cocok untuk: VPS, Synology NAS, QNAP, Unraid             │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌── Opsi 2: Binary Langsung ────────────────────────────────┐   │
│  │                                                            │   │
│  │  PC / Laptop / Raspberry Pi                                │   │
│  │  ┌────────────────────────────────────────┐                │   │
│  │  │  OS (Windows/Linux/macOS)               │                │   │
│  │  │  ┌──────────────────────────────────┐   │                │   │
│  │  │  │  ./saumabox (binary)             │   │                │   │
│  │  │  │  Port: 8080                      │   │                │   │
│  │  │  │  Data: ./data/                   │   │                │   │
│  │  │  └──────────────────────────────────┘   │                │   │
│  │  └────────────────────────────────────────┘                │   │
│  │                                                            │   │
│  │  Cocok untuk: penggunaan personal di PC sendiri            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌── Opsi 3: Reverse Proxy ──────────────────────────────────┐   │
│  │                                                            │   │
│  │  VPS dengan domain                                         │   │
│  │  ┌────────────────────────────────────────┐                │   │
│  │  │  Caddy / Nginx / Traefik               │                │   │
│  │  │  ┌──────────┐    ┌──────────────────┐  │                │   │
│  │  │  │ HTTPS    │    │ SaumaBox         │  │                │   │
│  │  │  │ :443     │───▶│ :8080            │  │                │   │
│  │  │  │ Auto-SSL │    │                  │  │                │   │
│  │  │  └──────────┘    └──────────────────┘  │                │   │
│  │  └────────────────────────────────────────┘                │   │
│  │                                                            │   │
│  │  Cocok untuk: akses dari internet dengan HTTPS             │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 10.6 Performance Requirements

| Metrik | Target | Cara Ukur |
|--------|--------|-----------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Cumulative Layout Shift | < 0.1 | Lighthouse |
| Time to Interactive | < 3.5s | Lighthouse |
| API Response (CRUD) | < 200ms P95 | Server monitoring |
| Data Grid Render (1000 rows) | < 300ms | Client profiling |
| Import 1000 rows | < 5s | End-to-end timing |
| Export 5000 rows to XLSX | < 3s | End-to-end timing |
| Backup download (100MB) | < 10s | Download timing |
| SQLite query (filtered) | < 50ms | Query profiling |
| Memory usage (server) | < 50MB idle | Docker stats |
| Docker image size | < 50MB | `docker images` |
| Binary size | < 30MB | File size |

---

## 10.7 Security Checklist

| # | Item | Implementasi |
|---|------|-------------|
| 1 | Password hashing | bcrypt (cost 12) |
| 2 | SQL injection | Parameterized queries |
| 3 | XSS | HTML entity encoding, CSP headers |
| 4 | CSRF | Token per session / SameSite cookie |
| 5 | Rate limiting | 100 req/min per IP |
| 6 | Auth bypass | Middleware check on all /admin/* routes |
| 7 | File upload | Validate extension, size, content type |
| 8 | Path traversal | Sanitize file paths |
| 9 | CORS | Whitelist allowed origins |
| 10 | Headers | Helmet / secure headers middleware |
| 11 | Secrets | Env vars, never in code |
| 12 | Dependencies | Regular audit (`npm audit`, `govulncheck`) |

---

## 10.8 Roadmap

| Fase | Versi | Fitur | Timeline |
|------|-------|-------|----------|
| **MVP** | v1.0 | CRUD, Import/Export, Backup/Restore, Login, PWA | 8–12 minggu |
| **Polish** | v1.1 | Dark/Light theme, keyboard shortcuts, advanced filters | +2 minggu |
| **Enhancement** | v1.2 | Dashboard charts, activity log, auto-backup | +2 minggu |
| **Integration** | v2.0 | API integration (IGDB, TMDB, Spotify), auto-metadata | TBD |
| **Social** | v3.0 | Multi-user, sharing, public profiles | TBD |

---

## 10.9 Glossary

| Term | Definisi |
|------|---------|
| **PWA** | Progressive Web App — web app yang bisa diinstal |
| **WAL** | Write-Ahead Logging — mode jurnal SQLite untuk performa |
| **SPA** | Single Page Application |
| **CRUD** | Create, Read, Update, Delete |
| **Recomp** | Recompilation — teknik porting game konsol ke PC |
| **ROM** | Read-Only Memory — file game konsol |
| **ISO** | Image file format untuk game disc |
| **NAS** | Network Attached Storage |
| **CSP** | Content Security Policy — header keamanan HTTP |
| **CSRF** | Cross-Site Request Forgery |
| **XSS** | Cross-Site Scripting |

---

*← Kembali ke [09-import-export-backup.md](./09-import-export-backup.md)  
Kembali ke → [00-daftar-isi.md](./00-daftar-isi.md)*
