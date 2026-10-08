// Push registration via Expo's own push service (no third-party account) —
// native-only; no-ops on web / Expo Go gracefully. Call after login and on
// every app open.

import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { PUSH_API } from "@/src/core/config";

export async function registerForPush(user_id: string): Promise<void> {
  if (Platform.OS === "web") return;
  if (!Device.isDevice) return; // simulators have no push token

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    // Not set until `eas build:configure` has run at least once — expected
    // during local/dev-client use, not an error.
    console.log("[push] registration skipped: no EAS projectId configured yet");
    return;
  }

  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== "granted") return;

    const tokenResp = await Notifications.getExpoPushTokenAsync({ projectId });
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
    // Push is best-effort; never block the app.
    console.log("[push] registration skipped:", String(e));
  }
}
