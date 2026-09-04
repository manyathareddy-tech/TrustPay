# TrustPay setup

TrustPay is a single Express service with a React demo console and a real SQLite ledger. The backend runs the full deterministic pipeline synchronously for each transaction; the only generative step is the optional natural-language explanation.

## Run locally

```bash
pnpm install
pnpm dev
```

Open the URL printed by the dev server. The demo console is the root page. The backend also exposes REST endpoints under `/api`.

Node.js **22.5+** is recommended because the project uses Node's built-in `node:sqlite` driver. This keeps the hackathon service to one Express process with no native database build step. The SQLite file is created at the project root as `trustpay.sqlite` by default. Set `TRUSTPAY_DB_PATH` to use another location.

## Gemini configuration

Create a local `.env` file (never commit it) and add the API key from [Google AI Studio](https://aistudio.google.com/apikey):

```dotenv
GEMINI_API_KEY=your-key-here
GEMINI_MODEL=gemini-3.8-flash
GEMINI_ENABLED=true
```

As of September 4, 2026, Google's official model catalog lists `gemini-3.8-flash` as the latest stable Flash endpoint. `GEMINI_MODEL` is configurable so the demo can move to a newer or account-available fast model without a code change. Live Gemini is intentionally opt-in with `GEMINI_ENABLED=true`; when it is off, when `GEMINI_API_KEY` is absent, or when a request fails, TrustPay returns a deterministic fallback explanation instead of blocking the transaction decision.

Gemini receives only the finished `penalties` array. It cannot score the transaction, choose the trusted/uncertain status, map the UI, change escrow, or add warning signals.

## REST API

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Service health check |
| `POST /api/users` | Create a demo user, trusted contact, and optional seed transaction history |
| `POST /api/transactions` | Persist an event and run Layers 1–7; returns the full decision object |
| `GET /api/transactions/:id` | Retrieve a stored transaction and its decision |
| `GET /api/transactions/:id/render-state` | Retrieve the compact adaptive-interface state |
| `POST /api/transactions/:id/verify` | Release a held transaction after identity verification |
| `POST /api/transactions/:id/cancel` | Cancel a held transaction and return funds |
| `GET /api/users/:id/history` | Transaction history plus running average score |
| `GET /api/demo/scenarios` | Sarah scam, legitimate large purchase, and normal transfer payloads |

The default seeded user is Sarah Chen (`userId: 1`) with one trusted contact. Notifications are written to the SQLite `notifications` table and returned as `simulated: true`; no SMS, voice, or email provider is connected.

## Deterministic scoring

The score begins at 100 and applies the fixed penalties from the build brief: screen sharing (20), new recipient (15), duplicate transaction (25), unusual time (10), z-score over 3 (20), z-score over 2 (10), velocity over 80 (15), and velocity over 60 (8). The result is clamped to 0–100. Historical mean, standard deviation, and velocity are computed from SQL queries over the transaction ledger.

A held transaction uses a 2-hour hold for medium risk and a 24-hour hold for high risk. The in-process timeout sweep cancels expired holds every minute for the hackathon demo.

## Validation

```bash
pnpm check
pnpm test
pnpm build
```

The production bundle is a single Node entrypoint at `dist/index.js` with the compiled frontend served by the same Express process.
