# Crypto Dashboard (v2)

A crypto market dashboard with a **Java Spring Boot** backend and an
**Angular + Angular Material** frontend, powered by the live
[CoinGecko API](https://docs.coingecko.com/). Successor to the React/Go v1.

The dashboard shows five metrics, filterable by time period (Today / Last week / Last month / Last quarter):

| # | Metric | CoinGecko endpoint | Backend route |
|---|--------|--------------------|---------------|
| 1 | Live price + change + 7d sparkline | `/coins/markets` | `/api/markets` |
| 2 | Market cap & BTC/ETH dominance | `/global` | `/api/global` |
| 3 | Price-history chart | `/coins/{id}/market_chart` | `/api/chart/{id}?period=` |
| 4 | Trending coins | `/search/trending` | `/api/trending` |
| 5 | Exchange volume | `/exchanges` | `/api/exchanges` |

## Architecture

```
Browser (Angular/Material) ──/api──▶ Spring Boot backend ──x-cg-demo-api-key──▶ CoinGecko
```

The Angular app **never** calls CoinGecko directly — the API key stays
server-side in the Spring Boot backend, which also caches upstream responses
(60s TTL) to stay within the CoinGecko demo-plan rate limits. Errors are mapped
to a consistent `{error, code, status}` JSON shape (429 rate-limit + `Retry-After`,
404, 502/504, 400 for invalid input); raw upstream detail is logged, never forwarded.

### Time-period filter
`Today → 1 day`, `Last week → 7`, `Last month → 30`, `Last quarter → 90`.
- The **price-history chart** (metric 3) uses the full day range.
- The **Live Prices** % column uses CoinGecko's native change windows
  (24h / 7d / 30d). Quarter has no native window, so it shows the 30d change
  while the chart still renders the full 90 days.
- `/global`, `/search/trending`, `/exchanges` are live snapshots with no
  historical dimension, so those three widgets stay current regardless of period.

## Layout

```
crypto-dashboard-v2/
├── .env                  # COINGECKO_API_KEY=... (demo key)
├── backend/              # Java 25 · Spring Boot 4.1 · Maven
│   └── src/main/java/com/bencosker/cryptodashboard/
│       ├── config/       # DotEnv loader, RestClient + CORS, @ConfigurationProperties
│       ├── client/       # CoinGeckoClient + CoinGeckoException
│       ├── cache/        # TtlCache
│       ├── service/      # DashboardService, TimePeriod
│       └── web/          # DashboardController, GlobalExceptionHandler, ApiError
└── frontend/             # Angular 20 + Angular Material + Chart.js
    └── src/
        ├── styles.scss   # blue/yellow/white Angular Material (M3) theme
        └── app/
            ├── components/  # 5 widgets + WidgetCard, PeriodFilter, PercentChange, Sparkline
            ├── services/    # CryptoApi (HttpClient), NotificationService, ApiError
            └── interceptors/# error.interceptor (typed errors + global toast)
```

## Configuration

The backend reads `crypto-dashboard-v2/.env` (walks up from its working dir via
`DotEnv`, loaded in `main()` before Spring resolves placeholders):

```
COINGECKO_API_KEY=CG-xxxxxxxx     # required (CoinGecko demo key)
# optional overrides:
# PORT=8080
# ALLOWED_ORIGIN=http://localhost:5173
# COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
```

The frontend calls a relative `/api` path; the Angular dev server proxies it to
the backend on `:8080` (see `frontend/proxy.conf.json`).

## Running locally

Requires **Java 25 (LTS)**, **Maven**, and **Node 18+**.

```bash
# Terminal 1 — backend (http://localhost:8080)
cd backend
./mvnw spring-boot:run

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm install        # first time only
npm start          # ng serve on :5173, proxying /api -> :8080
```

Open http://localhost:5173.

> If `mvn`/`java` aren't on your PATH (Homebrew keg-only JDK), set:
> `export JAVA_HOME="$(brew --prefix openjdk@25)/libexec/openjdk.jdk/Contents/Home"`

### Hot reload (development)

- **Frontend:** `npm start` (ng serve) live-reloads on every save.
- **Backend:** restart `./mvnw spring-boot:run` to pick up changes (optionally add
  `spring-boot-devtools` for auto-restart).

## Testing

```bash
# Backend — JUnit 5 (cache, CoinGecko client via MockRestServiceServer, controller + error mapping)
cd backend
./mvnw test

# Frontend — Karma/Jasmine (format helpers, ApiError mapping, PercentChange, PeriodFilter)
cd frontend
npm test                                          # interactive (watch)
npx ng test --no-watch --browsers=ChromeHeadless  # one-shot / CI

# Frontend E2E — Cypress (happy + sad paths, /api/* stubbed; backend not needed)
cd frontend
npm run e2e                                        # boots dev server, runs Cypress, exits
```

## Build (production)

```bash
# Frontend bundle -> frontend/dist/frontend
cd frontend && npm run build

# Backend runnable jar -> backend/target/*.jar
cd backend && ./mvnw package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```
