// Build the WhatsApp announcement for a vihar and open the share sheet. The
// message itself is identical to main's "Copy to WhatsApp" format (full
// Gujarati detail — main doesn't have an English variant of this message
// either, it's always Gujarati regardless of the UI language toggle); the
// only thing added on top is the app's RSVP join link at the bottom.
import { Platform, Share } from "react-native";

import { WEB_ORIGIN } from "@/src/core/config";
import { formatViharRecordForWhatsapp } from "@/src/core/vihar/whatsapp-format";
import type { Vihar } from "@/src/shared/models";

export function viharRsvpLink(vihar: Vihar): string {
  // Short link: first 8 characters of the id (resolved by app/r/[code].tsx).
  return `${WEB_ORIGIN}/r/${vihar.id.slice(0, 8)}`;
}

export function buildAnnouncement(vihar: Vihar): string {
  return [formatViharRecordForWhatsapp(vihar), "", "સેવામાં જોડાઓ 👇", viharRsvpLink(vihar)].join("\n");
}

/** Opens the share sheet (native) or wa.me (web) with arbitrary text. */
export async function shareText(message: string): Promise<void> {
  if (Platform.OS === "web") {
    // Open WhatsApp's own share link directly — navigator.share isn't
    // available on most desktop browsers, and silently falling back to
    // clipboard left the button looking like it did nothing.
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    return;
  }
  await Share.share({ message });
}

export async function shareAnnouncement(vihar: Vihar): Promise<void> {
  await shareText(buildAnnouncement(vihar));
}
