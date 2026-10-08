// Download a binary file from the API (PDF/Excel reports) and hand it to the
// user: on web, trigger a browser download; on native, write to the cache dir
// and open the OS share sheet (expo-sharing), since there's no browser to
// download into.
import { Platform } from "react-native";

import { authHeader } from "@/src/core/api/client";
import { DATA_API } from "@/src/core/config";

export async function downloadFile(path: string, filename: string): Promise<void> {
  const url = `${DATA_API}${path}`;
  const resp = await fetch(url, { headers: authHeader() });
  if (!resp.ok) throw new Error(`Download failed (${resp.status})`);

  if (Platform.OS === "web") {
    const blob = await resp.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
    return;
  }

  // The new expo-file-system (v19+) API doesn't expose cacheDirectory /
  // writeAsStringAsync; the legacy subpath keeps that stable, documented API.
  const FileSystem = await import("expo-file-system/legacy");
  const Sharing = await import("expo-sharing");
  const buffer = await resp.arrayBuffer();
  const base64 = arrayBufferToBase64(buffer);
  const fileUri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri);
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  // btoa is available in Hermes/RN and in the web global scope.
  return btoa(binary);
}
