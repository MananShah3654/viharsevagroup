// Public static page (no auth required) for Play Store compliance. Content
// ported verbatim from main's ChildSafety.js — kept English-only.
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";

import { useI18n } from "@/src/core/i18n";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";
import { fontSize, makeStyles, spacing, useTheme } from "@/src/theme";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Txt w="700" size={fontSize.base} color={colors.brandPrimary} style={styles.sectionTitle}>
        {title}
      </Txt>
      <Txt size={15} color={colors.onSurface} style={styles.sectionBody}>
        {children}
      </Txt>
    </View>
  );
}

export default function ChildSafetyScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="child-safety-back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} hitSlop={12}>
          <Icon name="arrow-left" size={26} color={colors.onSurface} />
        </Pressable>
        <Txt w="700" size={fontSize.lg} color={colors.onSurface} style={styles.flex}>
          {t("childSafety")}
        </Txt>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Image source={require("@/assets/images/logo_vsg.png")} style={styles.logo} contentFit="contain" />

        <Txt size={15} color={colors.onSurface} style={styles.intro}>
          At Vihar Seva Group, we are committed to ensuring a safe environment for all users,
          especially minors. We have a zero-tolerance policy toward child sexual abuse and
          exploitation (CSAE) and strictly prohibit any content or behavior that endangers children.
        </Txt>

        <Section title="1. Prohibited Content">
          {"Users are strictly forbidden from:\n" +
            "• Uploading, sharing, or distributing any child sexual abuse material (CSAM)\n" +
            "• Engaging in grooming, exploitation, or inappropriate interaction with minors\n" +
            "• Promoting or facilitating any form of child abuse or exploitation"}
        </Section>

        <Section title="2. Content Moderation">
          {"We actively monitor content on our platform using:\n" +
            "• Automated detection systems\n" +
            "• Manual review processes\n\n" +
            "Any content that violates our policies is removed immediately."}
        </Section>

        <Section title="3. Reporting Mechanism">
          {"Users can report harmful or suspicious content or behavior by:\n" +
            "• Using the in-app reporting feature (if available)\n" +
            "• Contacting us via email (see contact below)\n\n" +
            "All reports are reviewed promptly, and appropriate action is taken."}
        </Section>

        <Section title="4. Enforcement Actions">
          {"If a user is found violating our child safety policies, we will:\n" +
            "• Remove the offending content\n" +
            "• Suspend or permanently ban the user account\n" +
            "• Report the activity to relevant authorities where required"}
        </Section>

        <Section title="5. Cooperation with Law Enforcement">
          We comply with applicable laws and cooperate fully with law enforcement agencies in cases
          involving child safety and exploitation.
        </Section>

        <Section title="6. Child Safety Contact">
          {"If you have concerns regarding child safety on our platform, please contact us:\n\n" +
            "Vihar Seva Group\n" +
            "Email: mananshah3654@gmail.com"}
        </Section>

        <Txt size={14} color={colors.onSurface} style={styles.notice}>
          We are dedicated to maintaining a safe and respectful community for everyone.
        </Txt>

        <Txt size={13} color={colors.muted} center style={styles.footer}>
          © {new Date().getFullYear()} Vihar Seva Group. All rights reserved.
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
  content: { padding: spacing.lg, gap: spacing.xs },
  logo: { width: 72, height: 72, alignSelf: "center", marginBottom: spacing.md },
  intro: { marginBottom: spacing.lg, lineHeight: 22 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { marginBottom: spacing.xs, paddingBottom: spacing.xs, borderBottomWidth: 2, borderBottomColor: colors.brandTertiary },
  sectionBody: { lineHeight: 22 },
  notice: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.brandPrimary,
    fontStyle: "italic",
  },
  footer: { marginTop: spacing.md },
}));
