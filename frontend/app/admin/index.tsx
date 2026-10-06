import { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "@/src/core/i18n";
import { useVihars } from "@/src/core/vihar/hooks";
import {
  formatDateShort,
  isToday,
  isUpcoming,
  joinedCount,
  sortByDateAsc,
  volunteerTarget,
} from "@/src/core/vihar/utils";
import { shareAnnouncement } from "@/src/core/share/whatsapp";
import { Button } from "@/src/shared/widgets/Button";
import { Icon } from "@/src/shared/widgets/Icon";
import { EmptyView, LoadingView } from "@/src/shared/widgets/StateViews";
import { Txt } from "@/src/shared/widgets/Txt";
import type { Vihar } from "@/src/shared/models";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function AdminHome() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const vihars = useVihars();

  const upcoming = useMemo(
    () => (vihars.data ?? []).filter(isUpcoming).sort(sortByDateAsc),
    [vihars.data],
  );
  const today = useMemo(() => (vihars.data ?? []).find(isToday), [vihars.data]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="admin-back" onPress={() => router.back()} hitSlop={12}>
          <Icon name="arrow-left" size={26} color={colors.onSurface} />
        </Pressable>
        <Txt w="700" size={fontSize.xl} color={colors.onSurface} style={styles.flex}>
          {t("adminPanel")}
        </Txt>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <Button
          label={t("createVihar")}
          icon="plus-circle"
          onPress={() => router.push("/admin/create-vihar")}
          large
          testID="admin-create-vihar"
          haptic="success"
        />

        {today ? (
          <View style={styles.block}>
            <Txt w="700" size={fontSize.lg} color={colors.onSurface}>
              {t("todayVihar")}
            </Txt>
            <AdminViharRow vihar={today} />
          </View>
        ) : null}

        <Txt w="700" size={fontSize.lg} color={colors.onSurface} style={styles.listTitle}>
          {t("upcomingVihars")}
        </Txt>

        {vihars.isLoading ? (
          <LoadingView label={t("loading")} />
        ) : upcoming.length === 0 ? (
          <EmptyView label={t("emptyVihars")} />
        ) : (
          upcoming.map((v) => <AdminViharRow key={v.id} vihar={v} />)
        )}
      </ScrollView>
    </View>
  );

  function AdminViharRow({ vihar }: { vihar: Vihar }) {
    const target = volunteerTarget(vihar);
    const jc = joinedCount(vihar);
    const short = jc < target;
    return (
      <View style={styles.card} testID={`admin-vihar-${vihar.id}`}>
        <Pressable
          style={styles.cardTop}
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
          </View>
          <Icon name="chevron-right" size={22} color={colors.borderStrong} />
        </Pressable>
        <View style={styles.cardActions}>
          <Button
            label={t("viewParticipants")}
            variant="secondary"
            icon="account-multiple"
            onPress={() => router.push(`/admin/participants/${vihar.id}`)}
            testID={`admin-participants-${vihar.id}`}
            style={{ flex: 1 }}
          />
          <Button
            label=""
            variant="secondary"
            icon="whatsapp"
            onPress={() => shareAnnouncement(vihar, lang)}
            testID={`admin-share-${vihar.id}`}
          />
        </View>
      </View>
    );
  }
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
  content: { padding: spacing.lg, gap: spacing.md },
  block: { gap: spacing.sm },
  listTitle: { marginTop: spacing.sm },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  dateBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  statusLine: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xs },
  cardActions: { flexDirection: "row", gap: spacing.sm },
}));
