// The mobile app talks to its OWN companion backend, which transparently
// proxies all data requests to the production API (the single source of
// truth) and also hosts the push relay. Using the same origin as the app
// avoids browser CORS on web; native requests work the same way.
export const DATA_API = `${process.env.EXPO_PUBLIC_BACKEND_URL ?? ""}/api`;

export const PUSH_API = `${process.env.EXPO_PUBLIC_BACKEND_URL ?? ""}/api`;

// Public web RSVP origin (used when generating WhatsApp share links).
export const WEB_ORIGIN = "https://viharsevagroup.vercel.app";

export const STORAGE_KEYS = {
  token: "vsg.auth.token",
  user: "vsg.auth.user",
  language: "vsg.language",
  cacheVihars: "vsg.cache.vihars",
  cacheMyVihars: "vsg.cache.myVihars",
  attendancePrefix: "vsg.attendance.", // + vihar_id -> string[] of user_ids
};
