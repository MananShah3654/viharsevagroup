import { Platform, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

import { useAuth } from "@/src/core/auth/auth-context";
import { useI18n } from "@/src/core/i18n";
import { usesNativeTabs } from "@/src/navigation";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";
import { useConfirm } from "@/src/shared/widgets/Confirm";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

const COVER =
  "https://images.unsplash.com/photo-1596486935250-3ca1fb5c45b8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwxfHxjYWxtJTIwYWJzdHJhY3QlMjB3YXJtJTIwc2FuZCUyMHRleHR1cmV8ZW58MHx8fHwxNzkxMjgzODEyfDA&ixlib=rb-4.1.0&q=85";

export default function ProfileScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, lang, setLang } = useI18n();
  const { user, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const confirm = useConfirm();

  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const initials = (user?.name || user?.phone || "?").trim().charAt(0).toUpperCase();

  const pickLang = (l: "gu" | "en") => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
    setLang(l);
  };

  const onLogout = async () => {
    const ok = await confirm({
      title: t("logout"),
      confirmLabel: t("logout"),
      cancelLabel: t("cancel"),
      danger: true,
    });
    if (ok) {
      await signOut();
      router.replace("/login");
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomChrome + spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cover}>
          <Image source={{ uri: COVER }} style={styles.coverImg} contentFit="cover" />
          <LinearGradient
            colors={["rgba(217,119,47,0.35)", "rgba(43,37,33,0.55)"]}
            style={styles.coverImg}
          />
        </View>

        <View style={[styles.avatarWrap, { marginTop: -44 }]}>
          <View style={styles.avatar}>
            <Txt w="700" size={34} color={colors.onBrandPrimary}>
              {initials}
            </Txt>
          </View>
          <Txt w="700" size={fontSize.xl} color={colors.onSurface} style={styles.name}>
            {user?.name || user?.phone}
          </Txt>
          <Txt size={fontSize.base} color={colors.muted}>
            {user?.phone}
            {user?.area ? ` · ${user.area}` : ""}
          </Txt>
          {isAdmin ? (
            <View style={styles.adminTag}>
              <Icon name="shield-check" size={14} color={colors.onBrandPrimary} />
              <Txt w="500" size={12} color={colors.onBrandPrimary}>
                Admin
              </Txt>
            </View>
          ) : null}
        </View>

        <View style={styles.block}>
          <Txt w="500" size={fontSize.sm} color={colors.muted} style={styles.blockLabel}>
            {t("language")}
          </Txt>
          <View style={styles.langRow}>
            <LangChip label={t("gujarati")} active={lang === "gu"} onPress={() => pickLang("gu")} testID="lang-gu" />
            <LangChip label={t("english")} active={lang === "en"} onPress={() => pickLang("en")} testID="lang-en" />
          </View>
        </View>

        <View style={styles.block}>
          {isAdmin ? (
            <Row icon="shield-account" label={t("adminPanel")} onPress={() => router.push("/admin")} testID="profile-admin" />
          ) : null}
          <Row icon="logout" label={t("logout")} onPress={onLogout} danger testID="profile-logout" />
        </View>
      </ScrollView>
    </View>
  );
}

function LangChip({ label, active, onPress, testID }: { label: string; active: boolean; onPress: () => void; testID: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={[styles.langChip, { backgroundColor: active ? colors.brandPrimary : colors.surfaceTertiary, borderColor: active ? colors.brandPrimary : colors.border }]}
    >
      <Txt w={active ? "700" : "500"} size={16} color={active ? colors.onBrandPrimary : colors.onSurfaceTertiary}>
        {label}
      </Txt>
    </Pressable>
  );
}

function Row({
  icon,
  label,
  onPress,
  danger,
  testID,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  onPress: () => void;
  danger?: boolean;
  testID: string;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const tint = danger ? colors.error : colors.onSurface;
  return (
    <Pressable testID={testID} onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}>
      <Icon name={icon} size={24} color={tint} />
      <Txt w="500" size={fontSize.base} color={tint} style={styles.flex}>
        {label}
      </Txt>
      <Icon name="chevron-right" size={22} color={colors.borderStrong} />
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  cover: { height: 150, width: "100%" },
  coverImg: { ...abs() },
  avatarWrap: { alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.lg },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.surface,
  },
  name: { marginTop: spacing.xs },
  adminTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
  },
  block: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  blockLabel: { paddingHorizontal: spacing.sm, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  langRow: { flexDirection: "row", gap: spacing.sm, padding: spacing.sm },
  langChip: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 56,
    paddingHorizontal: spacing.sm,
  },
  flex: { flex: 1 },
}));

function abs() {
  return { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 };
}
