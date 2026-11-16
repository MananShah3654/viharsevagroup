// Formats a single vihar's full details into the Gujarati WhatsApp announcement
// text main's admin "Copy to WhatsApp" button produces, so admins can paste it
// straight into the group with every field spelled out. core/share/whatsapp.ts
// appends the app's RSVP join link to this same message for every share
// action (list share button, participants screen, post-create auto-share) —
// so the message is identical to main's, plus one link at the bottom.
import { parseViharDate, viharYearLabel } from "@/src/core/vihar/utils";
import type { Vihar } from "@/src/shared/models";

const GUJARATI_DIGITS = ["૦", "૧", "૨", "૩", "૪", "૫", "૬", "૭", "૮", "૯"];

function toGujaratiNumeral(num: number | string): string {
  return num
    .toString()
    .split("")
    .map((d) => (d >= "0" && d <= "9" ? GUJARATI_DIGITS[parseInt(d, 10)] : d))
    .join("");
}

const PLACE_MAPPINGS: Record<string, string> = {
  vijaynagar: "વિજયનગર",
  paladi: "પાલડી",
  naranpura: "નરણપુરા",
  ahmedabad: "અમદાવાદ",
  gandhinagar: "ગાંધીનગર",
  vadodara: "વડોદરા",
  surat: "સુરત",
  rajkot: "રાજકોટ",
};

function transliterateToGujarati(text: string): string {
  if (!text) return "";
  const mapped = PLACE_MAPPINGS[text.toLowerCase().trim()];
  return mapped ?? text;
}

function getGujaratiDay(dateString: string): string {
  const date = parseViharDate(dateString);
  if (!date) return "";
  const days = ["રવિવાર", "સોમવાર", "મંગળવાર", "બુધવાર", "ગુરુવાર", "શુક્રવાર", "શનિવાર"];
  return days[date.getDay()] ?? "";
}

function formatGujaratiTime(timeString: string): string {
  if (!timeString) return "";
  const [h, m] = timeString.split(":");
  const hour = parseInt(h, 10) || 0;
  const min = parseInt(m, 10) || 0;
  let period: string;
  let displayHour = hour;
  if (hour < 12) {
    period = "સવારે";
  } else if (hour < 18) {
    period = "બપોરે";
    if (hour > 12) displayHour = hour - 12;
  } else {
    period = "સાંજે";
    if (hour > 12) displayHour = hour - 12;
  }
  return `${period} ${toGujaratiNumeral(displayHour)}.${toGujaratiNumeral(String(min).padStart(2, "0"))} વાગે`;
}

export interface WhatsappFormatInput {
  route_no: string;
  total_no?: string;
  sahebji_name: string;
  vihar_date: string;
  vihar_time: string;
  sadhu_bhagvant: string;
  sadhviji_bhagvant: string;
  mumukshu: string;
  wheelchair: string;
  self: boolean;
  luggage: boolean;
  dori: boolean;
  car_required: boolean;
  activa: boolean;
  from_upashray: string;
  to_upashray: string;
}

export function formatViharForWhatsapp(form: WhatsappFormatInput): string {
  const routeNo = toGujaratiNumeral(form.route_no || "0");
  const viharDate = parseViharDate(form.vihar_date);
  const season = viharDate ? viharYearLabel(viharDate) : "";
  const dayOfWeek = form.vihar_date ? getGujaratiDay(form.vihar_date) : "";
  const gujaratiTime = formatGujaratiTime(form.vihar_time);

  const sadhuCount = parseInt(form.sadhu_bhagvant, 10) || 0;
  const sadhvijiCount = parseInt(form.sadhviji_bhagvant, 10) || 0;
  const mumukshuCount = parseInt(form.mumukshu, 10) || 0;
  const wheelchairCount = parseInt(form.wheelchair, 10) || 0;

  let formattedDate = "";
  if (form.vihar_date) {
    const d = parseViharDate(form.vihar_date);
    if (d) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = String(d.getFullYear()).slice(-2);
      formattedDate = `${day}/${month}/${year}`;
    } else {
      formattedDate = form.vihar_date;
    }
  }

  const lines: string[] = [
    "*પ્રણામ🙏🏻 વિહાર સેવકો*",
    "",
    ...(form.total_no ? [`*મૂળ ક્રમાંક- ${toGujaratiNumeral(form.total_no)}*`] : []),
    `*વાર્ષિક રૂટ- ${routeNo}${season ? ` (${season})` : ""}*`,
    "*વિહાર ની વિગત: -*",
    `*સાહેબજી નું નામ -* ${form.sahebji_name || ""}`,
    `*વિહાર તારીખ-* ${formattedDate},`,
    `*વાર-* ${dayOfWeek}`,
    `*વિહાર સમય-* ${gujaratiTime}`,
  ];

  if (sadhuCount > 0) lines.push(`*સાધુ ભગવંત -* ${toGujaratiNumeral(sadhuCount)}`);
  if (sadhvijiCount > 0) lines.push(`*સાધ્વીજી ભગવંત -* ${toGujaratiNumeral(sadhvijiCount)}`);
  if (mumukshuCount > 0) lines.push(`*મુમુક્ષુ -* ${toGujaratiNumeral(mumukshuCount)}`);
  if (wheelchairCount > 0) lines.push(`*વ્હીલચેર-* ${wheelchairCount}`);

  if (form.luggage) {
    if (form.activa && form.car_required) {
      lines.push("*સામાન છે એકટીવા જોઈશે*");
      lines.push("*સામાન છે ગાડી જોઈશે*");
    } else if (form.activa) {
      lines.push("*સામાન છે એકટીવા જોઈશે*");
    } else if (form.car_required) {
      lines.push("*સામાન છે ગાડી જોઈશે*");
    } else {
      lines.push("*સામાન -* હા");
    }
  } else if (form.activa) {
    lines.push("*સામાન -* ના");
    lines.push("*એકટીવા -* હા");
  } else if (form.car_required) {
    lines.push("*કાર જરૂરી -* હા");
  }

  if (form.dori) lines.push("*ડોરી -* હા");

  lines.push(`*ક્યાં ઉપાશ્રય -* ${transliterateToGujarati(form.from_upashray)}`);
  lines.push(`*ક્યાં ઉપાશ્રય -* ${transliterateToGujarati(form.to_upashray)}`);
  lines.push("");
  lines.push("*અનુકૂળતા હોય તે જણાવશો.*");
  lines.push("*એપમાં ઇન કરી લેવું*");

  if (form.self) {
    lines.push("");
    lines.push("*નોંધ:*");
    lines.push("*વ્હીલચેર આપણે ચલાવવાની છે*");
  }

  return lines.join("\n");
}

/** Same formatting, taking a stored Vihar (numeric fields) directly. */
export function formatViharRecordForWhatsapp(vihar: Vihar): string {
  return formatViharForWhatsapp({
    route_no: vihar.route_no,
    total_no: vihar.total_no,
    sahebji_name: vihar.sahebji_name ?? "",
    vihar_date: vihar.vihar_date,
    vihar_time: vihar.vihar_time,
    sadhu_bhagvant: String(vihar.sadhu_bhagvant ?? 0),
    sadhviji_bhagvant: String(vihar.sadhviji_bhagvant ?? 0),
    mumukshu: String(vihar.mumukshu ?? 0),
    wheelchair: String(vihar.wheelchair ?? 0),
    self: !!vihar.self,
    luggage: !!vihar.luggage,
    dori: !!vihar.dori,
    car_required: !!vihar.car_required,
    activa: !!vihar.activa,
    from_upashray: vihar.from_upashray,
    to_upashray: vihar.to_upashray,
  });
}
