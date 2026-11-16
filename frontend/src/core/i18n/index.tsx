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

  // mandatory-field validation messages
  phoneRequired: { gu: "10 અંકનો ફોન નંબર દાખલ કરો", en: "Enter a 10-digit phone number" },
  nameRequired: { gu: "નામ દાખલ કરો", en: "Please enter your name" },
  areaRequired: { gu: "વિસ્તાર દાખલ કરો", en: "Please enter your area" },
  bloodGroupRequired: { gu: "બ્લડ ગ્રુપ દાખલ કરો", en: "Please enter your blood group" },
  emergencyContactRequired: {
    gu: "10 અંકનો ઇમરજન્સી સંપર્ક નંબર દાખલ કરો",
    en: "Enter a 10-digit emergency contact number",
  },
  dobRequired: { gu: "જન્મ તારીખ દાખલ કરો", en: "Please enter your date of birth" },
  passwordRequired: { gu: "પાસવર્ડ દાખલ કરો", en: "Please enter a password" },
  passwordInvalid: { gu: "પાસવર્ડ બરાબર 4 અંકનો હોવો જોઈએ", en: "Password must be exactly 4 digits" },
  confirmPassword: { gu: "પાસવર્ડની પુષ્ટિ કરો", en: "Confirm password" },
  confirmPasswordRequired: { gu: "પાસવર્ડની પુષ્ટિ કરો", en: "Please confirm your password" },
  passwordMismatch: { gu: "પાસવર્ડ મેળ ખાતા નથી", en: "Passwords do not match" },

  // profile edit
  photo: { gu: "ફોટો", en: "Photo" },
  age: { gu: "ઉંમર", en: "Age" },
  address: { gu: "સરનામું", en: "Address" },
  car: { gu: "ગાડી", en: "Car" },
  profileUpdated: { gu: "પ્રોફાઇલ અપડેટ થઈ", en: "Profile updated" },
  removePhoto: { gu: "ફોટો કાઢો", en: "Remove photo" },
  photoTooLarge: { gu: "ફોટો 5MB કરતાં નાનો હોવો જોઈએ", en: "Photo must be under 5MB" },

  // change password
  oldPassword: { gu: "જૂનો પાસવર્ડ", en: "Old password" },
  newPassword: { gu: "નવો પાસવર્ડ", en: "New password" },
  passwordChanged: { gu: "પાસવર્ડ બદલાઈ ગયો", en: "Password changed" },

  // vihar form additions
  sahebjiName: { gu: "સાહેબજીનું નામ", en: "Sahebji name" },
  self: { gu: "જાતે", en: "Self" },
  luggage: { gu: "સામાન", en: "Luggage" },
  dori: { gu: "ડોરી", en: "Dori" },
  carRequired: { gu: "કાર જરૂરી", en: "Car required" },
  activa: { gu: "એક્ટિવા", en: "Activa" },
  calculate: { gu: "ગણતરી કરો", en: "Calculate" },
  splitVihar: { gu: "બહુવિધ તબક્કામાં વહેંચો", en: "Split into multiple stages" },
  stage: { gu: "તબક્કો", en: "Stage" },
  addStage: { gu: "તબક્કો ઉમેરો", en: "Add stage" },
  removeStage: { gu: "તબક્કો કાઢો", en: "Remove stage" },
  editVihar: { gu: "વિહાર સંપાદિત કરો", en: "Edit vihar" },
  deleteVihar: { gu: "વિહાર કાઢો", en: "Delete vihar" },
  confirmDeleteVihar: {
    gu: "શું તમે ખરેખર આ વિહાર કાઢવા માંગો છો?",
    en: "Are you sure you want to delete this vihar?",
  },
  viharDeleted: { gu: "વિહાર કાઢી નાખ્યો", en: "Vihar deleted" },
  viharUpdated: { gu: "વિહાર અપડેટ થયો", en: "Vihar updated" },

  // admin user management
  manageUsers: { gu: "સેવકોનું સંચાલન", en: "Manage users" },
  addUser: { gu: "સેવક ઉમેરો", en: "Add user" },
  editUser: { gu: "સેવક સંપાદિત કરો", en: "Edit user" },
  userCreated: { gu: "સેવક ઉમેરાયો", en: "User created" },
  userUpdated: { gu: "સેવક અપડેટ થયો", en: "User updated" },
  userDeleted: { gu: "સેવક કાઢી નાખ્યો", en: "User deleted" },
  confirmDeleteUser: {
    gu: "શું તમે ખરેખર આ સેવકને કાઢવા માંગો છો?",
    en: "Are you sure you want to delete this user?",
  },
  makeAdmin: { gu: "એડમિન બનાવો", en: "Make admin" },
  makeUser: { gu: "સેવક બનાવો", en: "Make user" },
  confirmMakeAdmin: {
    gu: "શું તમે ખરેખર {name} ને એડમિન બનાવવા માંગો છો?",
    en: "Are you sure you want to make {name} an admin?",
  },
  confirmMakeUser: {
    gu: "શું તમે ખરેખર {name} ને સેવક બનાવવા માંગો છો?",
    en: "Are you sure you want to make {name} a regular user?",
  },
  roleUpdated: { gu: "ભૂમિકા અપડેટ થઈ", en: "Role updated" },
  filterByCar: { gu: "ગાડી સાથે વિહારસેવક", en: "Viharsevak with car" },
  searchUsers: { gu: "નામ અથવા ફોન દ્વારા શોધો", en: "Search by name or phone" },

  // reports
  reports: { gu: "અહેવાલો", en: "Reports" },
  period: { gu: "સમયગાળો", en: "Period" },
  weekly: { gu: "સાપ્તાહિક", en: "Weekly" },
  monthly: { gu: "માસિક", en: "Monthly" },
  yearly: { gu: "વાર્ષિક", en: "Yearly" },
  allUsers: { gu: "બધા સેવકો", en: "All users" },
  totalKms: { gu: "કુલ કિમી", en: "Total KMs" },
  downloadPdf: { gu: "PDF ડાઉનલોડ કરો", en: "Download PDF" },
  downloadExcel: { gu: "Excel ડાઉનલોડ કરો", en: "Download Excel" },
  pdfDownloaded: { gu: "PDF ડાઉનલોડ થયું", en: "PDF downloaded" },
  excelDownloaded: { gu: "Excel ડાઉનલોડ થયું", en: "Excel downloaded" },
  downloadFailed: { gu: "ડાઉનલોડ નિષ્ફળ ગયું", en: "Download failed" },

  // static pages
  privacyPolicy: { gu: "ગોપનીયતા નીતિ", en: "Privacy Policy" },
  childSafety: { gu: "બાળ સુરક્ષા ધોરણો", en: "Child Safety Standards" },

  // admin dashboard home
  totalUsers: { gu: "કુલ સેવકો", en: "Total Users" },
  activeParticipants: { gu: "સક્રિય સહભાગીઓ", en: "Active Participants" },
  thisMonthSummary: { gu: "આ મહિનાની સારાંશ", en: "This Month Summary" },
  newUsers: { gu: "નવા સેવકો", en: "New Users" },
  jayJinendra: { gu: "જય જિનેન્દ્ર", en: "Jay Jinendra" },
  copyToWhatsapp: { gu: "વોટ્સએપ માટે કૉપિ કરો", en: "Copy to WhatsApp" },
  copiedToClipboard: { gu: "ક્લિપબોર્ડ પર કૉપિ થયું", en: "Copied to clipboard" },
  previewParticipants: { gu: "સેવકો જુઓ", en: "Preview Participants" },
  aboutUs: { gu: "અમારા વિશે", en: "About Us" },
  ourTeam: { gu: "અમારી લીડરશિપ ટીમ", en: "Our Leadership Team" },
  tagline: { gu: "જૈન શ્રમણ શ્રમણી ભગવંતોની સુરક્ષા અને ભક્તિ સાથે સેવા", en: "Serving Jain Shraman Shramani Bhagvant with Safety and Devotion" },
  assignViharSevak: { gu: "વિહાર સેવક સોંપો", en: "Assign Vihar Sevak" },
  filterByDate: { gu: "તારીખ પ્રમાણે ફિલ્ટર કરો", en: "Filter by date" },
  clearFilter: { gu: "ફિલ્ટર હટાવો", en: "Clear filter" },
  preview: { gu: "જુઓ", en: "Preview" },
  assign: { gu: "સોંપો", en: "Assign" },
  edit: { gu: "સંપાદિત કરો", en: "Edit" },
  share: { gu: "શેર કરો", en: "Share" },
  totalNo: { gu: "કુલ ક્રમાંક", en: "Total No." },
  originalNo: { gu: "મૂળ ક્રમાંક", en: "Original no." },
  yearlyNo: { gu: "વાર્ષિક ક્રમાંક", en: "Yearly no." },
  numberingNote: {
    gu: "મૂળ ક્રમાંક સતત ચાલે છે. વાર્ષિક ક્રમાંક દર વર્ષે ૧ ઑગસ્ટથી ફરી ૧ થાય છે.",
    en: "Original numbers continue across all years. Yearly numbers restart at 1 every August 1.",
  },
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
