// Public static page (no auth required) — the banner + leadership team grid
// from main's LandingPage.js, ported as an in-app "About Us" screen since
// this app has no public marketing homepage (it opens straight to login).
import { Linking, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { useI18n } from "@/src/core/i18n";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

const CONVENORS = [
  {
    image: require("@/assets/images/Rupeshbhai_vora.jpeg"),
    name: { gu: "રૂપેશભાઈ શૈલેષભાઈ વોરા", en: "Rupeshbhai Shaileshbhai Vora" },
    title: { gu: "કન્વીનર - ઓલ ઇન્ડિયા વિહાર સેવા ગ્રુપ", en: "Convenor - All India Vihar Seva Group" },
    phone: "+918905093981",
  },
  {
    image: require("@/assets/images/ShreyanshBhai_ramani.jpeg"),
    name: { gu: "શ્રેયાંસભાઈ દિલીપભાઈ રામાણી", en: "Shreyanshbhai Dilipbhai Ramani" },
    title: { gu: "કન્વીનર - ગુજરાત વિહાર સેવા ગ્રુપ", en: "Convenor - Gujarat Vihar Seva Group" },
    phone: "+918905093881",
  },
  {
    image: require("@/assets/images/Vardhaman.jpeg"),
    name: { gu: "વર્ધમાન શાહ", en: "Vardhaman Shah" },
    title: { gu: "કન્વીનર - નારણપુરા વિહાર સેવા ગ્રુપ", en: "Convenor - Naranpura Vihar Seva Group" },
    phone: "+918690703224",
  },
  {
    image: require("@/assets/images/Hardikbhai.jpeg"),
    name: { gu: "હાર્દિકભાઈ શાહ", en: "Hardikbhai Shah" },
    title: { gu: "કન્વીનર - નારણપુરા વિહાર સેવા ગ્રુપ", en: "Convenor - Naranpura Vihar Seva Group" },
    phone: "+919429131760",
  },
];

export default function AboutScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="about-back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} hitSlop={12}>
          <Icon name="arrow-left" size={26} color={colors.onSurface} />
        </Pressable>
        <Txt w="700" size={fontSize.lg} color={colors.onSurface} style={styles.flex}>
          {t("aboutUs")}
        </Txt>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}>
        <Image
          source={require("@/assets/images/banner.jpeg")}
          style={styles.banner}
          contentFit="cover"
        />

        <View style={styles.titleBlock}>
          <Image source={require("@/assets/images/logo_vsg.png")} style={styles.logo} contentFit="contain" />
          <Txt w="700" size={fontSize.xl} color={colors.onSurface} center>
            {t("appName")}
          </Txt>
          <Txt size={14} color={colors.muted} center style={styles.tagline}>
            {t("tagline")}
          </Txt>
        </View>

        <Txt w="700" size={fontSize.lg} color={colors.onSurface} style={styles.sectionTitle}>
          {t("ourTeam")}
        </Txt>

        <View style={styles.grid}>
          {CONVENORS.map((c) => (
            <View key={c.phone} style={styles.card}>
              <Image source={c.image} style={styles.avatar} contentFit="cover" />
              <Txt w="700" size={fontSize.base} color={colors.onSurface} center style={styles.name}>
                {c.name[lang]}
              </Txt>
              <Txt size={12} color={colors.muted} center style={styles.role}>
                {c.title[lang]}
              </Txt>
              <Pressable
                testID={`about-call-${c.phone}`}
                onPress={() => Linking.openURL(`tel:${c.phone}`)}
                style={styles.phoneRow}
                hitSlop={8}
              >
                <Icon name="phone" size={14} color={colors.brandPrimary} />
                <Txt w="500" size={13} color={colors.brandPrimary}>
                  {c.phone}
                </Txt>
              </Pressable>
            </View>
          ))}
        </View>

        <Txt size={13} color={colors.muted} center style={styles.footer}>
          © {new Date().getFullYear()} Vihar Seva Group
        </Txt>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  flex: { flex: 1 },
  banner: { width: "100%", height: 180 },
  titleBlock: { alignItems: "center", gap: spacing.xs, padding: spacing.lg },
  logo: { width: 64, height: 64, marginBottom: spacing.xs },
  tagline: { paddingHorizontal: spacing.xl },
  sectionTitle: { paddingHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.sm },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  card: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  avatar: { width: 72, height: 72, borderRadius: radius.pill, marginBottom: spacing.xs },
  name: {},
  role: { minHeight: 32 },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: spacing.xs },
  footer: { marginTop: spacing.xl },
}));
