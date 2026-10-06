// Push registration (Emergent relay). Native-only; no-ops on web / Expo Go
// gracefully. Call after login and on every app open.

import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { PUSH_API } from "@/src/core/config";

export async function registerForPush(user_id: string): Promise<void> {
  if (Platform.OS === "web") return;
  if (!Device.isDevice) return; // simulators have no push token

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== "granted") return;

    const tokenResp = await Notifications.getDevicePushTokenAsync();
    await fetch(`${PUSH_API}/register-push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        platform: Platform.OS,
        device_token: tokenResp.data,
      }),
    });
  } catch (e) {
    // Push is best-effort; never block the app. (Expo Go cannot get a token.)
    console.log("[push] registration skipped:", String(e));
  }
}
