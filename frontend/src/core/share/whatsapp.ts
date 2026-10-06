// Build a Gujarati WhatsApp announcement for a vihar and open the share sheet.
import { Platform, Share } from "react-native";

import { WEB_ORIGIN } from "@/src/core/config";
import { formatDateLong, formatTime } from "@/src/core/vihar/utils";
import type { Vihar } from "@/src/shared/models";

export function viharRsvpLink(vihar: Vihar): string {
  return `${WEB_ORIGIN}/vihar/${vihar.id}/rsvp`;
}

export function buildAnnouncement(vihar: Vihar, lang: "gu" | "en"): string {
  const parts: string[] = [];
  if (lang === "gu") {
    parts.push("🙏 વિહાર સેવા 🙏");
    parts.push(`રૂટ: ${vihar.route_no}`);
    parts.push(`તારીખ: ${formatDateLong(vihar)}`);
    parts.push(`સમય: ${formatTime(vihar, "gu")}`);
    parts.push(`${vihar.from_upashray} → ${vihar.to_upashray} (${vihar.approx_kms} કિમી)`);
    if (vihar.sadhu_bhagvant) parts.push(`સાધુજી: ${vihar.sadhu_bhagvant}`);
    if (vihar.sadhviji_bhagvant) parts.push(`સાધ્વીજી: ${vihar.sadhviji_bhagvant}`);
    if (vihar.wheelchair) parts.push(`વ્હીલચેર: ${vihar.wheelchair}`);
    parts.push("");
    parts.push("સેવામાં જોડાઓ 👇");
    parts.push(viharRsvpLink(vihar));
  } else {
    parts.push("🙏 Vihar Seva 🙏");
    parts.push(`Route: ${vihar.route_no}`);
    parts.push(`Date: ${formatDateLong(vihar)}`);
    parts.push(`Time: ${formatTime(vihar, "en")}`);
    parts.push(`${vihar.from_upashray} → ${vihar.to_upashray} (${vihar.approx_kms} KM)`);
    parts.push("");
    parts.push("Join the seva 👇");
    parts.push(viharRsvpLink(vihar));
  }
  return parts.join("\n");
}

export async function shareAnnouncement(vihar: Vihar, lang: "gu" | "en"): Promise<void> {
  const message = buildAnnouncement(vihar, lang);
  if (Platform.OS === "web") {
    // Best-effort on web.
    try {
      // @ts-ignore navigator may exist on web
      if (navigator?.share) await navigator.share({ text: message });
      else await navigator.clipboard?.writeText(message);
    } catch {}
    return;
  }
  await Share.share({ message });
}
