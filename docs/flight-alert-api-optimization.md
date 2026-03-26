# Optimization: AeroDataBox Flight Alert (Push) API

Status: **Planned — not yet implemented**
Prerequisite: Public-facing backend URL (deployment on VPS or tunnel)

## What It Is

AeroDataBox offers a **webhook-based push API** for flight updates. Instead of us polling their flight status endpoint every 90 seconds, we register a webhook URL and they POST updates to us whenever a flight's data changes (delay, gate change, status change, cancellation, etc.).

## How It Works

1. **Create a subscription** for a flight number (or airport ICAO code) via a POST to AeroDataBox
2. Provide our webhook endpoint URL (e.g., `https://flights.example.com/api/webhooks/aerodatabox`)
3. AeroDataBox sends HTTP POST with JSON payload to our webhook whenever the flight has an update
4. We parse the payload and update the flight record in our database

## Credit System

- Creating subscriptions is **free** (no credits deducted)
- Credits are deducted when alerts fire: **1 credit per flight item** in each notification
- Credit balance is managed via API — refill from your monthly RapidAPI quota
- Credits **never expire**
- No automatic retries if webhook is down (unless explicitly requested)

## Benefits vs Current Polling

| Aspect | Current (Polling) | Flight Alert (Push) |
|--------|-------------------|---------------------|
| Update frequency | Every 90 seconds | Real-time (seconds after change) |
| API quota usage | Burns calls even if nothing changed | Only fires when data actually changes |
| Data freshness | Up to 90s stale | Near real-time |
| Implementation | Simple cron | Requires public webhook URL |

## What We'd Need to Build

### Backend
1. `POST /api/webhooks/aerodatabox` — public endpoint (no auth) that receives AeroDataBox push notifications
2. Verify the webhook source (check headers/signature if available)
3. Parse the payload and update the matching Flight record
4. `POST /api/flights/:id/subscribe` — when a flight is added, create an AeroDataBox alert subscription
5. Manage alert credits — monitor balance, refill as needed

### Subscription Flow
```
User adds flight → POST /api/flights
  → Save to DB
  → Call AeroDataBox: create webhook subscription for this flight number
  → Store subscription ID on the Flight record

Flight updates happen → AeroDataBox POSTs to our webhook
  → Parse payload → Update Flight record → Frontend sees fresh data on next fetch
```

### Fallback Strategy
Keep the existing 90-second polling cron as a fallback for:
- Local development (no public URL)
- If webhook delivery fails
- If AeroDataBox alert system is down

The cron can check `lastApiFetchAt` and only poll flights that haven't received a webhook update recently.

## Deployment Requirement

AeroDataBox must be able to reach our webhook URL. Options:
- **VPS/cloud server**: Direct — just expose the endpoint
- **Home server**: Cloudflare Tunnel or ngrok to make it publicly reachable
- **Local dev**: ngrok for testing

## When to Implement

After the app is deployed to a server with a public URL. The current polling system works fine for development and single-user scale.

## Sources

- [AeroDataBox Flight Alert API Guide (2026)](https://aerodatabox.com/flight-alert-api-2026/)
- [Introduction of Flight Alert PUSH API](https://aerodatabox.com/introduction-of-flight-alert-push-api/)
- [AeroDataBox Pricing](https://aerodatabox.com/pricing/)
- [AeroDataBox API Documentation (RapidAPI)](https://doc.aerodatabox.com/rapidapi.html)
