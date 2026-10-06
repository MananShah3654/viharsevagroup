// Deep-link landing for WhatsApp links like /vihar/{id}/rsvp. Redirect to the
// vihar detail screen where the user can RSVP.
import { Redirect, useLocalSearchParams } from "expo-router";

export default function ViharRsvpRedirect() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={`/vihar/${id}`} />;
}
