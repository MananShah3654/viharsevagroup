// Compact vihar list row: date badge, route (from -> to), distance, and the
// user's join status. Tapping opens the detail screen.
import { Pressable, View } from "react-native";

import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { useI18n } from "@/src/core/i18n";
import { formatDateShort, formatTime } from "@/src/core/vihar/utils";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";
import type { Vihar } from "@/src/shared/models";

export function ViharRow({ vihar, onPress }: { vihar: Vihar; onPress: () => void }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const joined = vihar.user_status === "in";

  return (
    <Pressable
      testID={`vihar-row-${vihar.id}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.dateBadge}>
        <Txt w="700" size={18} color={colors.onBrandTertiary}>
          {formatDateShort(vihar).split(" ")[0]}
        </Txt>
        <Txt w="500" size={12} color={colors.onBrandTertiary}>
          {formatDateShort(vihar).split(" ")[1]}
        </Txt>
      </View>

      <View style={styles.body}>
        <View style={styles.routeLine}>
          <Txt w="700" size={16} color={colors.onSurface} numberOfLines={1} style={styles.flex}>
            {vihar.from_upashray}
          </Txt>
          <Icon name="arrow-right" size={16} color={colors.muted} />
          <Txt w="700" size={16} color={colors.onSurface} numberOfLines={1} style={styles.flex}>
            {vihar.to_upashray}
          </Txt>
        </View>
        <View style={styles.meta}>
          <Icon name="clock-outline" size={14} color={colors.muted} />
          <Txt size={13} color={colors.muted}>
            {formatTime(vihar, lang)}
          </Txt>
          <Txt size={13} color={colors.muted}>
            ·
          </Txt>
          <Icon name="map-marker-distance" size={14} color={colors.muted} />
          <Txt size={13} color={colors.muted}>
            {vihar.approx_kms} {t("km")}
          </Txt>
        </View>
      </View>

      {joined ? (
        <View style={styles.joinedTag}>
          <Icon name="check-circle" size={18} color={colors.success} />
        </View>
      ) : (
        <Icon name="chevron-right" size={22} color={colors.borderStrong} />
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: spacing.xs },
  routeLine: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  flex: { flexShrink: 1 },
  meta: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  joinedTag: { paddingLeft: spacing.xs },
}));
