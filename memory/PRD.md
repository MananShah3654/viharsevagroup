# PRD — Naranpura Vihar Seva (Mobile App)

## Original problem statement
Build a production-ready native mobile app for the "Naranpura Vihar Seva Group"
(Jain volunteer coordination for sadhu/sadhviji vihars). Reuse the EXISTING
backend (https://viharsevagroup.vercel.app) as the single source of truth —
React web, mobile, and WhatsApp all share the same data. Original ask was
Flutter; this platform builds React Native (Expo), so the app was delivered in
Expo with identical scope (user chose Expo).

## Architecture
- **Frontend:** Expo (React Native) + expo-router, React Query, secure-store
  auth, Gujarati-first i18n, warm saffron Material-ish theme (light + dark),
  Noto Sans Gujarati fonts.
- **Data:** Companion FastAPI backend (this env) transparently **proxies** every
  `/api/*` data request to the production API (the single source of truth). The
  proxy exists to (a) remove browser CORS on web and (b) work around two
  pre-existing upstream bugs (see below). It never stores or duplicates data.
- **Push:** Same companion backend hosts the Emergent push relay
  (`/api/register-push`, `/api/push/notify`). Tokens resolved by SuprSend via
  user id; nothing stored locally.

## Upstream (production) issues worked around in the proxy (cannot deploy to Vercel)
1. `GET /api/vihars/{id}` → HTTP 500 (undefined `cache_key` in upstream handler).
   Proxy reconstructs the detail from the working `GET /api/vihars` list (+ admin
   participants when authorized).
2. `POST /api/auth/register` → HTTP 500 even though the user IS created. Proxy
   detects the 500 and logs the new user in, returning a valid token.

## User personas
- **Volunteer (sevak):** browses vihars, joins/cancels seva, tracks own history.
- **Admin/organizer:** creates vihars, manages participants, marks attendance,
  shares WhatsApp announcements, sends reminders, spots volunteer shortage.

## Core requirements (static)
- Gujarati-first UI, English secondary, remembered language.
- 5-tab bottom nav: Home, Vihars, Join Seva, My Seva, Profile.
- Phone + 4-digit password auth (reuse existing), persistent login.
- Join/cancel seva, dedupe participation, offline cache, WhatsApp deep links,
  push notifications, basic mobile admin.

## Implemented (2026-06)
- Auth: login + register (phone/4-digit), secure token storage, persistent
  session, auth-gated routing.
- Home: greeting, "આજનો વિહાર" hero card (image + gradient scrim, counts,
  volunteer progress bar, join CTA), My Upcoming Seva, Upcoming Vihars.
- Vihars: filter chips (All/Upcoming/Today/Past), live list (567 vihars).
- Vihar Detail (deep-link target `/vihar/{id}` and `/vihar/{id}/rsvp`): route,
  date/time, sahebji, counts, instructions (from flags), seva status progress,
  confirmed volunteers (admin), sticky join/cancel CTA with confirm sheet.
- Join Seva tab: upcoming not-joined vihars with inline join.
- My Seva (History): yearly stat tiles (total vihars, km, sadhuji, sadhviji),
  Upcoming/Completed toggle, history list.
- Profile: user info, Gujarati/English toggle, logout.
- Admin: panel with create-vihar form, participants (view/add/remove),
  on-device attendance, WhatsApp share, push reminder, shortage highlight.
- Offline: NetInfo banner + cached today/vihars/my-seva via storage.
- Push: expo-notifications scaffolding (permission flow, device token register,
  foreground handler, Android channel, tap deep-link to /vihar/{id}).
- Deep links: scheme `viharseva`, Android App Links + iOS associated domains
  for `naranpuraviharsevagroup.com/vihar/*`.

## Verified
- Backend proxy: 8/9 pytest pass (the 1 "fail" was the upstream 500, now worked
  around). Login, list, detail (rebuilt), participate (idempotent), my-vihars,
  reports, register (fallback), push route — all OK.
- Frontend (web preview): login, home, vihars list, detail + sticky CTA,
  history, profile language toggle, logout — all render against live data.

## Backlog / remaining
- **P1 Admin validation:** admin screens built but untested — need an admin
  account (promote a user via the existing React web admin, or provide creds).
- **P1 Push on device:** only works after Publish → build (not Expo Go).
- **P2 Attendance sync:** attendance is on-device only (upstream has no
  attendance field); add an upstream endpoint later to share it.
- **P2 Volunteer count for non-admins:** upstream exposes participant counts to
  admins only, so volunteers see target + own status (not the full 3/5 count).
- **P2 Report upstream bugs** (`/vihars/{id}` 500, `/auth/register` 500) to the
  web app owner for a permanent fix.

## Next tasks
- Get admin creds and validate/adjust admin flows.
- Deploy, generate iOS/Android builds, provide google-services.json + APNs key,
  then test push + universal/app links on real devices.
