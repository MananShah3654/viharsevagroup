// "આજનો વિહાર" hero card: image + dark gradient scrim + white content,
// counts, volunteer progress, and the join CTA.
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import { useI18n } from "@/src/core/i18n";
import { formatDateShort, formatTime, joinedCount, volunteerTarget } from "@/src/core/vihar/utils";
import { Button } from "@/src/shared/widgets/Button";
import { CountPills } from "@/src/shared/widgets/CountPills";
import { Icon } from "@/src/shared/widgets/Icon";
import { ProgressBar } from "@/src/shared/widgets/ProgressBar";
import { Txt } from "@/src/shared/widgets/Txt";
import type { Vihar } from "@/src/shared/models";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

const HERO_LIGHT =
  "https://images.unsplash.com/photo-1767852354895-9c13787e5d2c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwxfHx3YWxraW5nJTIwcGF0aCUyMHN1bnJpc2UlMjBzZXJlbmUlMjBuYXR1cmUlMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc5MTI4MzgxMnww&ixlib=rb-4.1.0&q=85";

export function TodayViharCard({
  vihar,
  onPress,
  onJoin,
  joining,
}: {
  vihar: Vihar;
  onPress: () => void;
  onJoin: () => void;
  joining: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, lang } = useI18n();

  const joined = vihar.user_status === "in";
  const target = volunteerTarget(vihar);
  const jc = joinedCount(vihar);
  const remaining = Math.max(0, target - jc);

  return (
    <Pressable testID="today-vihar-card" onPress={onPress} style={styles.card}>
      <Image source={{ uri: HERO_LIGHT }} style={styles.image} contentFit="cover" transition={300} />
      <LinearGradient
        colors={["rgba(43,37,33,0.15)", "rgba(43,37,33,0.75)", "rgba(43,37,33,0.95)"]}
        locations={[0, 0.5, 1]}
        style={styles.scrim}
      />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.datePill}>
            <Icon name="calendar" size={16} color="#FFFFFF" />
            <Txt w="700" size={15} color="#FFFFFF">
              {formatDateShort(vihar)}
            </Txt>
          </View>
          <View style={styles.datePill}>
            <Icon name="clock-outline" size={16} color="#FFFFFF" />
            <Txt w="700" size={15} color="#FFFFFF">
              {formatTime(vihar, lang)}
            </Txt>
          </View>
        </View>

        <View style={styles.route}>
          <Txt w="700" size={fontSize.xl} color="#FFFFFF" numberOfLines={1}>
            {vihar.from_upashray}
          </Txt>
          <View style={styles.arrowRow}>
            <Icon name="arrow-down" size={20} color="rgba(255,255,255,0.9)" />
            <Txt w="500" size={14} color="rgba(255,255,255,0.9)">
              {vihar.approx_kms} {t("km")}
            </Txt>
          </View>
          <Txt w="700" size={fontSize.xl} color="#FFFFFF" numberOfLines={1}>
            {vihar.to_upashray}
          </Txt>
        </View>

        <CountPills vihar={vihar} onDark />

        <View style={styles.progressWrap}>
          <View style={styles.progressTop}>
            <Txt w="500" size={14} color="rgba(255,255,255,0.9)">
              {t("sevaks")}
            </Txt>
            <Txt w="700" size={14} color="#FFFFFF">
              {jc} / {target} {t("joined")}
            </Txt>
          </View>
          <ProgressBar value={target ? jc / target : 0} height={14} trackColor="rgba(255,255,255,0.25)" />
          <Txt size={13} color="rgba(255,255,255,0.9)" style={styles.remaining}>
            {remaining > 0 ? `${remaining} ${t("needMore")}` : t("fullyStaffed")}
          </Txt>
        </View>

        <Button
          label={joined ? t("sevaRecorded") : t("iWillJoin")}
          onPress={onJoin}
          loading={joining}
          large
          variant={joined ? "secondary" : "primary"}
          icon={joined ? "check-circle" : undefined}
          testID="home-join-button"
          haptic="success"
        />
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    borderRadius: radius.lg,
    overflow: "hidden",
    minHeight: 420,
    backgroundColor: colors.surfaceInverse,
  },
  image: { ...stretch() },
  scrim: { ...stretch() },
  content: { padding: spacing.lg, gap: spacing.md, marginTop: "auto" },
  topRow: { flexDirection: "row", gap: spacing.sm },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  route: { gap: spacing.xs },
  arrowRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  progressWrap: { gap: spacing.xs },
  progressTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  remaining: { marginTop: spacing.xs },
}));

function stretch() {
  return { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 };
}
