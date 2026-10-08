# Release Checklist — Naranpura Vihar Seva (Android + iOS)

Tracks what's left before this app (the `appdevelopment` branch, Expo/React
Native) can be published to the Play Store / App Store. App code is being
built first; this list is the infrastructure/setup work to do once that's
ready. Check items off as they're done — don't start a step until its
dependencies above it are done.

## 1. Backend deployment (blocks everything — do this first)

- [ ] Deploy `backend/` (the companion proxy + push relay) somewhere public
      (Vercel/Railway/Render/etc.) — it currently only runs on this dev
      machine at `localhost:8000`, which a real phone can never reach.
- [ ] Update `frontend/.env`'s `EXPO_PUBLIC_BACKEND_URL` to that public URL
      (currently `http://localhost:8000` — must change before any build).
- [ ] Confirm the deployed backend can still reach the real production API
      (`UPSTREAM_API_URL`, defaults to `https://viharsevagroup.vercel.app/api`)
      — no code change needed, just verify network access from the new host.

## 2. Push notifications

Uses Expo's own push service (`https://exp.host/--/api/v2/push/send`) — no
third-party account/key (no Emergent, no OneSignal). `backend/server.py`
stores each user's Expo push token in memory (resets on backend restart —
acceptable since the app re-registers on every open) and forwards
`/push/notify` calls straight to Expo.

- [ ] Run `eas build:configure` at least once (see §4) — this writes the
      project's EAS `projectId` into `app.json`'s `extra.eas.projectId`,
      which `src/core/push/register.ts` needs to request an Expo push token.
      Until then, push registration silently no-ops (by design, not a bug).
- [ ] Android: nothing else required — Expo's push service relays to FCM
      using its own Firebase project, not yours.
- [ ] iOS: still need an Apple Push Notification service (APNs) key uploaded
      to EAS's credentials manager — Apple requires this regardless of which
      push service sits behind it.
- [ ] Re-test "Send Reminder" (admin → participants screen) and the
      register-on-login flow once the above is in place — push is a no-op on
      web by design, so this can only be verified on a real device build.
- [ ] If token persistence across backend restarts ever matters at scale,
      swap the in-memory `_push_tokens` dict for a small persistent store
      (file/Redis/Mongo) — not needed at current volume.

## 3. Deep links (WhatsApp RSVP link opening the app directly)

- [ ] Decide the real public web destination (or confirm native-only):
      `frontend/src/core/config.ts`'s `WEB_ORIGIN` still points at the *old*
      production CRA site (`https://viharsevagroup.vercel.app`), which has no
      `/vihar/:id/rsvp` route — today this link goes nowhere useful on any
      platform.
- [ ] Host `assetlinks.json` at
      `https://naranpuraviharsevagroup.com/.well-known/assetlinks.json`
      (Android App Links) and `apple-app-site-association` at
      `https://naranpuraviharsevagroup.com/.well-known/apple-app-site-association`
      (iOS Universal Links) — Expo/EAS can generate the content, hosting is
      on whoever controls that domain.
- [ ] Update `WEB_ORIGIN` to that domain once the association files are live,
      so WhatsApp announcement links open the native app instead of a
      browser (or a dead page).

## 4. EAS build & signing

- [ ] Create/confirm an Expo account for this project; run `eas login`.
- [ ] `eas build:configure` to generate `eas.json`.
- [ ] Android: let EAS generate/manage the signing keystore (or provide one).
- [ ] iOS: an Apple Developer Program account is required ($99/yr) — EAS can
      manage certificates/provisioning once that account exists.
- [ ] First build: `eas build --platform android` / `--platform ios`,
      install on a real device via the generated `.apk`/TestFlight, and
      smoke-test the full flow (login, join seva, admin create/edit vihar,
      WhatsApp share, reports download) end-to-end on-device.

## 5. Store listing requirements

- [ ] App icon / splash — already done (real VSG logo wired into
      `app.json`'s `icon`/`adaptiveIcon`/`splash` paths).
- [ ] Privacy Policy — in-app at `/privacy`; Play Console also wants a public
      URL to the same content (can point to the hosted domain once #3 is
      resolved, or host the content as a static page separately).
- [ ] Child Safety Standards — in-app at `/child-safety`; same public-URL
      consideration as Privacy Policy (Play Store's CSAE policy may require
      this reachable outside the app too).
- [ ] Screenshots, store description, content rating questionnaire — not
      started.
- [ ] Data safety form (Play Console) / App Privacy details (App Store
      Connect) — describe what's actually collected: phone, name, area,
      blood group, emergency contact, DOB, optional photo (see `/privacy`
      content for the exact list already written).

## Known gaps carried over from the web-only testing phase

- "Today's vihar not showing" — reported but not yet root-caused; needs
  either a test login or the specific vihar's route/date to debug against
  the live database (see conversation history — this is still open).
- `main` (the old CRA web app) and this branch now have fully diverged
  feature sets; the 30+ commits on `main` (password reset, vihar splitting,
  privacy/child-safety pages, etc.) have all been re-implemented here, but
  there's no automatic sync between the two going forward.
