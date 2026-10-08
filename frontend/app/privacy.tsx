// Public static page (no auth required) for Play Store compliance. Content
// ported verbatim from main's PrivacyPolicy.js — kept English-only, matching
// the original (a legal/compliance page, not part of the Gujarati-first UX).
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

export default function PrivacyPolicyScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="privacy-back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} hitSlop={12}>
          <Icon name="arrow-left" size={26} color={colors.onSurface} />
        </Pressable>
        <Txt w="700" size={fontSize.lg} color={colors.onSurface} style={styles.flex}>
          {t("privacyPolicy")}
        </Txt>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Image source={require("@/assets/images/logo_vsg.png")} style={styles.logo} contentFit="contain" />
        <Txt size={13} color={colors.muted} center style={styles.updated}>
          Last updated: February 2026
        </Txt>

        <Section title="1. Introduction">
          Vihar Seva Group ("we", "our", or "us") operates the Vihar Seva Group mobile application and
          website (the "Service"). This Privacy Policy explains how we collect, use, and protect
          information when you use our Service. By using the Service, you agree to this policy.
        </Section>

        <Section title="2. Information We Collect">
          {"We collect the following information when you register or use our app:\n" +
            "• Name — your full name for identification within the group\n" +
            "• Phone number — used as your login identifier\n" +
            "• City / Location — to assign you to the relevant Vihar Seva region\n" +
            "• Vihar route data — routes submitted by administrators for Jain pilgrimage paths\n\n" +
            "We do not collect: payment information, precise GPS location, photos, contacts, or any sensitive personal data."}
        </Section>

        <Section title="3. How We Use Your Information">
          {"• To authenticate you and provide access to the app\n" +
            "• To display vihar route information relevant to your region\n" +
            "• To allow administrators to manage vihar seva activities\n" +
            "• To improve the Service and fix issues\n\n" +
            "We do not sell, rent, or share your personal information with third parties for marketing purposes."}
        </Section>

        <Section title="4. Data Storage and Security">
          Your data is stored securely on cloud servers (MongoDB Atlas). We use industry-standard
          encryption (HTTPS/TLS) for all data transmission. Access to user data is restricted to
          authorised administrators only. Passwords are stored as secure hashes and are never stored or
          transmitted in plain text.
        </Section>

        <Section title="5. Data Sharing">
          {"We do not share your personal information with any third parties except:\n" +
            "• Cloud infrastructure providers (for hosting and storage)\n" +
            "• When required by law or government authorities"}
        </Section>

        <Section title="6. User Rights">
          {"You have the right to:\n" +
            "• Access your personal data stored in the app\n" +
            "• Request correction of inaccurate data\n" +
            "• Request deletion of your account and associated data\n\n" +
            "To exercise these rights, contact us at the email below."}
        </Section>

        <Section title="7. Children's Privacy">
          Our Service is not directed to children under the age of 13. We do not knowingly collect
          personal information from children. If you believe a child has provided us personal
          information, please contact us and we will delete it promptly.
        </Section>

        <Section title="8. Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify users of significant
          changes by updating the "Last updated" date at the top of this page. Continued use of the
          Service after changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="9. Contact Us">
          {"If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact:\n\n" +
            "Vihar Seva Group\n" +
            "Email: viharsevagroup@gmail.com\n" +
            "Phone: +91 89050 93981"}
        </Section>

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
  logo: { width: 72, height: 72, alignSelf: "center", marginBottom: spacing.sm },
  updated: { marginBottom: spacing.lg },
  section: { marginBottom: spacing.lg },
  sectionTitle: { marginBottom: spacing.xs, paddingBottom: spacing.xs, borderBottomWidth: 2, borderBottomColor: colors.brandTertiary },
  sectionBody: { lineHeight: 22 },
  footer: { marginTop: spacing.md },
}));
