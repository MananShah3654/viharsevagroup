// Gujarati-first i18n. Default language is Gujarati ("gu"); English ("en") is
// secondary. Selection is remembered across launches.

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { STORAGE_KEYS } from "@/src/core/config";
import { storage } from "@/src/utils/storage";

export type Lang = "gu" | "en";

type Dict = Record<string, { gu: string; en: string }>;

export const T: Dict = {
  appName: { gu: "નારણપુરા વિહાર સેવા", en: "Naranpura Vihar Seva" },
  pranam: { gu: "પ્રણામ", en: "Pranam" },

  // tabs
  tabHome: { gu: "હોમ", en: "Home" },
  tabVihars: { gu: "વિહાર", en: "Vihars" },
  tabSeva: { gu: "સેવા", en: "Join Seva" },
  tabHistory: { gu: "મારી સેવા", en: "My Seva" },
  tabProfile: { gu: "પ્રોફાઇલ", en: "Profile" },

  // home
  todayVihar: { gu: "આજનો વિહાર", en: "Today's Vihar" },
  myUpcomingSeva: { gu: "મારી આગામી સેવા", en: "My Upcoming Seva" },
  upcomingVihars: { gu: "આગામી વિહારો", en: "Upcoming Vihars" },
  recentActivity: { gu: "તાજેતરની પ્રવૃત્તિ", en: "Recent Activity" },
  noTodayVihar: { gu: "આજે કોઈ વિહાર નથી", en: "No vihar today" },
  seeAll: { gu: "બધા જુઓ", en: "See all" },

  // counts
  sadhuji: { gu: "સાધુજી", en: "Sadhuji" },
  sadhviji: { gu: "સાધ્વીજી", en: "Sadhviji" },
  wheelchair: { gu: "વ્હીલચેર", en: "Wheelchair" },
  mumukshu: { gu: "મુમુક્ષુ", en: "Mumukshu" },
  sevaks: { gu: "સેવકો", en: "Volunteers" },
  joined: { gu: "જોડાયા", en: "joined" },
  km: { gu: "કિમી", en: "KM" },

  // seva cta / status
  iWillJoin: { gu: "🙏 હું સેવા માટે આવીશ", en: "🙏 I will join the seva" },
  sevaRecorded: { gu: "✓ તમારી સેવા નોંધાઈ ગઈ છે", en: "✓ Your seva is recorded" },
  cancelSeva: { gu: "સેવા રદ કરો", en: "Cancel seva" },
  youJoined: { gu: "તમે જોડાયેલા છો", en: "You have joined" },
  sevaStatus: { gu: "સેવા સ્થિતિ", en: "Seva status" },
  confirmedVolunteers: { gu: "પુષ્ટિ થયેલ સેવકો", en: "Confirmed volunteers" },
  needMore: { gu: "સેવકોની જરૂર છે", en: "more volunteers needed" },
  fullyStaffed: { gu: "પૂરતા સેવકો જોડાયા છે 🙏", en: "Enough volunteers joined 🙏" },
  instructions: { gu: "સૂચનાઓ", en: "Instructions" },
  volunteerCountNote: {
    gu: "સેવકોની કુલ સંખ્યા એડમિન જ જોઈ શકે છે",
    en: "Only admins can see the full volunteer list",
  },

  // vihar detail
  route: { gu: "રૂટ", en: "Route" },
  date: { gu: "તારીખ", en: "Date" },
  time: { gu: "સમય", en: "Time" },
  from: { gu: "થી", en: "From" },
  to: { gu: "સુધી", en: "To" },
  distance: { gu: "અંતર", en: "Distance" },
  sahebji: { gu: "સાહેબજી", en: "Sahebji" },

  // filters
  all: { gu: "બધા", en: "All" },
  today: { gu: "આજે", en: "Today" },
  upcoming: { gu: "આગામી", en: "Upcoming" },
  past: { gu: "પૂર્ણ", en: "Past" },
  completed: { gu: "પૂર્ણ થયેલ", en: "Completed" },

  // history / stats
  totalVihars: { gu: "કુલ વિહાર", en: "Total Vihars" },
  totalSeva: { gu: "કુલ સેવા", en: "Total Seva" },
  myStats: { gu: "મારી સેવાનો સરવાળો", en: "My contribution" },

  // profile
  language: { gu: "ભાષા", en: "Language" },
  gujarati: { gu: "ગુજરાતી", en: "Gujarati" },
  english: { gu: "અંગ્રેજી", en: "English" },
  logout: { gu: "લૉગ આઉટ", en: "Logout" },
  changePassword: { gu: "પાસવર્ડ બદલો", en: "Change password" },
  adminPanel: { gu: "એડમિન પેનલ", en: "Admin panel" },
  editProfile: { gu: "પ્રોફાઇલ સંપાદિત કરો", en: "Edit profile" },
  phone: { gu: "ફોન નંબર", en: "Phone number" },
  name: { gu: "નામ", en: "Name" },
  area: { gu: "વિસ્તાર", en: "Area" },
  bloodGroup: { gu: "બ્લડ ગ્રુપ", en: "Blood group" },
  emergencyContact: { gu: "ઇમરજન્સી સંપર્ક", en: "Emergency contact" },
  dob: { gu: "જન્મ તારીખ", en: "Date of birth" },
  save: { gu: "સાચવો", en: "Save" },

  // auth
  loginTitle: { gu: "લૉગિન કરો", en: "Log in" },
  password: { gu: "પાસવર્ડ (4 અંક)", en: "Password (4 digits)" },
  loginBtn: { gu: "લૉગિન", en: "Log in" },
  noAccount: { gu: "એકાઉન્ટ નથી? નોંધણી કરો", en: "No account? Register" },
  haveAccount: { gu: "પહેલેથી એકાઉન્ટ છે? લૉગિન", en: "Have an account? Log in" },
  registerTitle: { gu: "નવી નોંધણી", en: "Register" },
  registerBtn: { gu: "નોંધણી કરો", en: "Register" },
  welcome: { gu: "સેવામાં આપનું સ્વાગત છે", en: "Welcome to the seva" },

  // admin
  createVihar: { gu: "નવો વિહાર બનાવો", en: "Create Vihar" },
  viewParticipants: { gu: "સેવકો જુઓ", en: "View participants" },
  markAttendance: { gu: "હાજરી પૂરો", en: "Mark attendance" },
  shareWhatsapp: { gu: "વોટ્સએપ પર શેર કરો", en: "Share on WhatsApp" },
  sendReminder: { gu: "રિમાઇન્ડર મોકલો", en: "Send reminder" },
  addParticipant: { gu: "સેવક ઉમેરો", en: "Add participant" },
  remove: { gu: "કાઢો", en: "Remove" },
  present: { gu: "હાજર", en: "Present" },
  attendanceLocalNote: {
    gu: "હાજરી આ ઉપકરણ પર સાચવેલ છે",
    en: "Attendance is saved on this device",
  },
  shortage: { gu: "સેવકોની અછત", en: "Volunteer shortage" },
  createBtn: { gu: "વિહાર બનાવો", en: "Create vihar" },
  routeNo: { gu: "રૂટ નંબર", en: "Route no" },

  // generic states
  loading: { gu: "માહિતી લાવી રહ્યા છીએ...", en: "Loading..." },
  errorFetch: { gu: "માહિતી લાવવામાં ભૂલ", en: "Error fetching info" },
  retry: { gu: "ફરી પ્રયાસ કરો", en: "Retry" },
  offline: { gu: "ઑફલાઇન — સંગ્રહિત માહિતી બતાવી રહ્યા છીએ", en: "Offline — showing saved info" },
  emptyVihars: { gu: "હાલમાં કોઈ વિહાર નથી", en: "No vihars right now" },
  emptyHistory: { gu: "તમારી સેવાનો ઇતિહાસ અહીં દેખાશે", en: "Your seva history will appear here" },
  cancel: { gu: "રદ કરો", en: "Cancel" },
  confirm: { gu: "પુષ્ટિ કરો", en: "Confirm" },
  done: { gu: "થઈ ગયું", en: "Done" },
  required: { gu: "આવશ્યક", en: "Required" },
  somethingWrong: { gu: "કંઈક ખોટું થયું", en: "Something went wrong" },
  joinError: { gu: "સેવા નોંધવામાં ભૂલ", en: "Could not record seva" },
  savedOffline: { gu: "ઑફલાઇન — ફરી પ્રયાસ કરો", en: "Offline — please retry" },
  thana: { gu: "ઠાણા", en: "Thana" },
};

interface I18nState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof T) => string;
}

const I18nContext = createContext<I18nState | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("gu");

  useEffect(() => {
    (async () => {
      const saved = await storage.getItem<Lang>(STORAGE_KEYS.language, "gu");
      if (saved === "gu" || saved === "en") setLangState(saved);
    })();
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    storage.setItem(STORAGE_KEYS.language, l);
  };

  const value = useMemo<I18nState>(
    () => ({
      lang,
      setLang,
      t: (key) => (T[key] ? T[key][lang] : String(key)),
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nState {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside LanguageProvider");
  return ctx;
}
