# Flighty vs Flight — Feature Gap Analysis

Last updated: March 2026

## Features We Already Have

| Feature | Status |
|---------|--------|
| Add flight by number + date | Done |
| Flight status (Scheduled → Arrived) | Done |
| Delay info (minutes late) | Done |
| Gate + terminal (departure & arrival) | Done |
| Aircraft type | Done |
| Route map (great circle arcs) | Done |
| Auto-polling for status updates (90s) | Done |
| Auto-archive after landing | Done |
| Flight statistics dashboard | Done |
| Airline logos | Done |
| Past flights archive with world map | Done |
| Vertical Flighty-style flight detail | Done |

## Tier 1 — Doable with Existing API (AeroDataBox)

| Feature | Description | Effort | Status |
|---------|-------------|--------|--------|
| Live countdown on cards | "Departs in 4h 23m" updating every minute | Low | Planned |
| Timezone change notice | "−1 Hour Timezone Change" on detail | Low | Planned |
| Baggage belt info | Display if AeroDataBox returns it | Low | Not started |
| Codeshare info | Multiple flight numbers for same flight | Low | Not started |
| Push notifications | Browser notifications for delays/gate changes | Medium | Not started |

## Tier 2 — Doable with Free APIs or Frontend-Only

| Feature | Description | API Needed | Effort | Status |
|---------|-------------|------------|--------|--------|
| Arrival weather | Temp + conditions at destination | OpenWeatherMap (free 1000/day) | Medium | Planned |
| Calendar .ics export | "Add to Calendar" download | None (frontend) | Low | Not started |
| Share flight card | Shareable link or image | None | Medium | Not started |
| Flight duration on cards | Show Xh Xm on list cards | None (already computed) | Low | Not started |

## Tier 3 — Needs Paid APIs or ML

| Feature | Description | What's Needed | Cost |
|---------|-------------|---------------|------|
| "Where's My Plane" | Track inbound aircraft 25h before | Tail number + fleet tracking API | Paid |
| Delay prediction (ML) | Predict delays hours before airline | Historical delay data + ML model | Significant |
| Arrival forecast | "19% late, avg 26m" over 60 days | Historical flight performance data | Paid API |
| Connection assistant | Flag risky layovers | Airport terminal walking time data | Medium |
| FAA delay/ground stop alerts | Real-time FAA ATCSCC feed | FAA data feed | Free but US-only |
| Live flight path tracking | Real positions during flight | ADS-B Exchange or OpenSky | Free (30 days) / Paid (historical) |
| Aircraft details | Tail number, age, ICAO type, callsign | Fleet database API | Paid |

## API Landscape

| API | Free Tier | Historical Data | Best For |
|-----|-----------|----------------|----------|
| AeroDataBox (RapidAPI) | 300-600 calls/month | Current flights only | Flight status, gates, delays |
| OpenSky Network | Yes | Last 30 days only | Live position, recent tracks |
| ADS-B Exchange | ~$10/month | Since March 2020 | Position data, enthusiast use |
| FlightRadar24 | No | Full history | Best data, premium pricing |
| OpenWeatherMap | 1000 calls/day | N/A | Arrival weather |
| Aviation Edge | Paid | Varies | Historical flight tracker |

## Sources

- [Flighty Features — The Points Guy](https://thepointsguy.com/travel-gear/everything-you-need-to-know-about-flighty-app/)
- [Flighty Review — Going.com](https://www.going.com/guides/flighty-review)
- [Flighty App Store](https://apps.apple.com/us/app/flighty-live-flight-tracker/id1358823008)
- [Flighty Delay Predictions](https://flighty.com/help/delay-predictions)
- [Flighty Pricing](https://flighty.com/pricing)
- [ADS-B Exchange Historical Data](https://www.adsbexchange.com/products/historical-data/)
- [OpenSky REST API](https://openskynetwork.github.io/opensky-api/rest.html)
