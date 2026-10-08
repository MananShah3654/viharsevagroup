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
import { Button } from "@/src/shared/widgets/Button";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";
import type { Vihar } from "@/src/shared/models";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export function AdminViharCard({ vihar }: { vihar: Vihar }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const target = volunteerTarget(vihar);
  const jc = joinedCount(vihar);
  const short = jc < target;

  return (
    <View style={styles.card} testID={`admin-vihar-${vihar.id}`}>
      <View style={styles.cardHeaderRow}>
        <Pressable
          style={[styles.cardTop, styles.flex]}
          onPress={() => router.push(`/admin/participants/${vihar.id}`)}
          testID={`admin-open-${vihar.id}`}
        >
          <View style={styles.dateBadge}>
            <Txt w="700" size={16} color={colors.onBrandTertiary}>
              {formatDateShort(vihar).split(" ")[0]}
            </Txt>
            <Txt w="500" size={11} color={colors.onBrandTertiary}>
              {formatDateShort(vihar).split(" ")[1]}
            </Txt>
          </View>
          <View style={styles.flex}>
            <Txt w="700" size={fontSize.base} color={colors.onSurface} numberOfLines={1}>
              {vihar.from_upashray} → {vihar.to_upashray}
            </Txt>
            <View style={styles.statusLine}>
              <Icon name="account-group" size={15} color={short ? colors.warning : colors.success} />
              <Txt w="500" size={13} color={short ? colors.warning : colors.success}>
                {jc}/{target} {short ? `· ${t("shortage")}` : ""}
              </Txt>
            </View>
            {vihar.car_required || vihar.wheelchair > 0 || vihar.luggage || vihar.dori || vihar.activa ? (
              <View style={styles.badgeRow}>
                {vihar.car_required ? <Icon name="car" size={16} color={colors.muted} /> : null}
                {vihar.wheelchair > 0 ? <Icon name="wheelchair-accessibility" size={16} color={colors.muted} /> : null}
                {vihar.luggage ? <Icon name="bag-suitcase" size={16} color={colors.muted} /> : null}
                {vihar.dori ? <Icon name="link-variant" size={16} color={colors.muted} /> : null}
                {vihar.activa ? <Icon name="moped" size={16} color={colors.muted} /> : null}
              </View>
            ) : null}
          </View>
          <Icon name="chevron-right" size={22} color={colors.borderStrong} />
        </Pressable>
        <Pressable
          onPress={() => shareAnnouncement(vihar)}
          testID={`admin-share-${vihar.id}`}
          style={styles.whatsappBtn}
          hitSlop={8}
        >
          <Icon name="whatsapp" size={22} color={colors.success} />
        </Pressable>
      </View>
      <View style={styles.cardActions}>
        <Button
          label={t("previewParticipants")}
          variant="secondary"
          icon="eye-outline"
          onPress={() => router.push(`/admin/participants/${vihar.id}`)}
          testID={`admin-participants-${vihar.id}`}
        />
        <Button
          label={t("assignViharSevak")}
          variant="secondary"
          icon="account-multiple-plus"
          onPress={() => router.push(`/admin/participants/${vihar.id}?assign=1`)}
          testID={`admin-assign-${vihar.id}`}
        />
        <Button
          label={t("editVihar")}
          variant="secondary"
          icon="pencil"
          onPress={() => router.push(`/admin/edit-vihar/${vihar.id}`)}
          testID={`admin-edit-${vihar.id}`}
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  flex: { flex: 1 },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  cardTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  whatsappBtn: { padding: spacing.xs },
  dateBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  statusLine: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xs },
  badgeRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  cardActions: { gap: spacing.sm },
}));
