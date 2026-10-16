// Admin-only vihar card: date/route/status + badges, a WhatsApp share icon,
// and the Preview Participants / Assign Vihar Sevak / Edit actions. Used on
// the Admin home list and (for admins) the regular Vihars tab, so every
// vihar listing an admin sees offers the same actions, not just the
// dedicated Admin section.
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";

import { useI18n } from "@/src/core/i18n";
import { shareAnnouncement } from "@/src/core/share/whatsapp";
import { formatDateShort, joinedCount, volunteerTarget } from "@/src/core/vihar/utils";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";
import type { Vihar } from "@/src/shared/models";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

function ActionIcon({
  icon,
  label,
  color,
  onPress,
  testID,
}: {
  icon: React.ComponentProps<typeof Icon>["name"];
  label: string;
  color: string;
  onPress: () => void;
  testID?: string;
}) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      hitSlop={6}
      style={({ pressed }) => [styles.actionIcon, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Icon name={icon} size={19} color={color} />
      <Txt w="700" size={11.5} color={color} numberOfLines={1}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function AdminViharCard({ vihar }: { vihar: Vihar }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const target = volunteerTarget(vihar);
  const jc = joinedCount(vihar);
  const short = jc < target;
  const [day, mon] = formatDateShort(vihar).split(" ");

  return (
    <View style={styles.card} testID={`admin-vihar-${vihar.id}`}>
      <Pressable
        style={styles.cardTop}
        onPress={() => router.push(`/admin/participants/${vihar.id}`)}
        testID={`admin-open-${vihar.id}`}
      >
        <View style={styles.dateBadge}>
          <Txt w="700" size={17} color={colors.brandPrimary}>
            {day}
          </Txt>
          <Txt w="700" size={10.5} color={colors.brandPrimary} style={styles.dateMonth}>
            {mon}
          </Txt>
        </View>
        <View style={styles.flex}>
          <Txt size={11.5} color={colors.muted}>
            {t("routeNo")} {vihar.route_no}
            {vihar.total_no ? `  ·  ${t("totalNo")} ${vihar.total_no}` : ""}
          </Txt>
          <Txt w="700" size={fontSize.base} color={colors.onSurface} numberOfLines={1}>
            {vihar.from_upashray} → {vihar.to_upashray}
          </Txt>
          <View style={styles.statusLine}>
            <View style={[styles.statusDot, { backgroundColor: short ? colors.warning : colors.success }]} />
            <Txt w="700" size={12.5} color={short ? colors.warning : colors.success}>
              {jc}/{target} {t("sevaks")}
              {short ? ` · ${t("shortage")}` : ""}
            </Txt>
            {vihar.car_required || vihar.wheelchair > 0 || vihar.luggage || vihar.dori || vihar.activa ? (
              <View style={styles.badgeRow}>
                {vihar.car_required ? <Icon name="car" size={14} color={colors.muted} /> : null}
                {vihar.wheelchair > 0 ? <Icon name="wheelchair-accessibility" size={14} color={colors.muted} /> : null}
                {vihar.luggage ? <Icon name="bag-suitcase" size={14} color={colors.muted} /> : null}
                {vihar.dori ? <Icon name="link-variant" size={14} color={colors.muted} /> : null}
                {vihar.activa ? <Icon name="moped" size={14} color={colors.muted} /> : null}
              </View>
            ) : null}
          </View>
        </View>
        <Icon name="chevron-right" size={20} color={colors.borderStrong} />
      </Pressable>

      <View style={styles.divider} />

      <View style={styles.cardActions}>
        <ActionIcon
          icon="eye-outline"
          label={t("preview")}
          color={colors.onSurfaceTertiary}
          onPress={() => router.push(`/admin/participants/${vihar.id}`)}
          testID={`admin-participants-${vihar.id}`}
        />
        <ActionIcon
          icon="account-multiple-plus"
          label={t("assign")}
          color={colors.onSurfaceTertiary}
          onPress={() => router.push(`/admin/participants/${vihar.id}?assign=1`)}
          testID={`admin-assign-${vihar.id}`}
        />
        <ActionIcon
          icon="pencil"
          label={t("edit")}
          color={colors.onSurfaceTertiary}
          onPress={() => router.push(`/admin/edit-vihar/${vihar.id}`)}
          testID={`admin-edit-${vihar.id}`}
        />
        <ActionIcon
          icon="whatsapp"
          label={t("share")}
          color={colors.success}
          onPress={() => shareAnnouncement(vihar)}
          testID={`admin-share-${vihar.id}`}
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  flex: { flex: 1 },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  dateBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.brandTertiary + "26",
    alignItems: "center",
    justifyContent: "center",
  },
  dateMonth: { textTransform: "uppercase", letterSpacing: 0.3 },
  statusLine: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: 4, flexWrap: "wrap" },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  badgeRow: { flexDirection: "row", gap: spacing.xs, marginLeft: spacing.xs },
  divider: { height: 1, backgroundColor: colors.border },
  cardActions: { flexDirection: "row", alignItems: "center" },
  actionIcon: { alignItems: "center", gap: 2, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm, flex: 1 },
}));
