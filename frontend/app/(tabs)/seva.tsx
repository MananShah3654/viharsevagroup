import { useMemo } from "react";
import { FlatList, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "@/src/core/i18n";
import { useOnline } from "@/src/core/offline/net";
import { useParticipate, useVihars } from "@/src/core/vihar/hooks";
import { formatDateShort, formatTime, isUpcoming, sortByDateAsc } from "@/src/core/vihar/utils";
import { usesNativeTabs } from "@/src/navigation";
import { Button } from "@/src/shared/widgets/Button";
import { CountPills } from "@/src/shared/widgets/CountPills";
import { Icon } from "@/src/shared/widgets/Icon";
import { OfflineBanner } from "@/src/shared/widgets/OfflineBanner";
import { EmptyView, ErrorView, LoadingView } from "@/src/shared/widgets/StateViews";
import { Txt } from "@/src/shared/widgets/Txt";
import { useToast } from "@/src/shared/widgets/Toast";
import type { Vihar } from "@/src/shared/models";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function SevaScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const online = useOnline();
  const vihars = useVihars();
  const participate = useParticipate();
  const toast = useToast();

  const data = useMemo(
    () => (vihars.data ?? []).filter((v) => isUpcoming(v) && v.user_status !== "in").sort(sortByDateAsc),
    [vihars.data],
  );

  const bottomChrome = usesNativeTabs ? insets.bottom : 0;

  const join = (v: Vihar) =>
    participate.mutate(
      { id: v.id, status: "in" },
      {
        onSuccess: () => toast.show(t("sevaRecorded"), "success"),
        onError: () => toast.show(t("joinError"), "error"),
      },
    );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Txt w="700" size={fontSize.xl} color={colors.onSurface}>
          {t("tabSeva")}
        </Txt>
        <Txt size={fontSize.sm} color={colors.muted}>
          {t("upcomingVihars")}
        </Txt>
      </View>
      {!online ? <OfflineBanner label={t("offline")} /> : null}

      {vihars.isLoading ? (
        <LoadingView label={t("loading")} />
      ) : vihars.isError ? (
        <ErrorView label={t("errorFetch")} onRetry={() => vihars.refetch()} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(v) => v.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomChrome + spacing.xxl }]}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          showsVerticalScrollIndicator={false}
          refreshing={vihars.isRefetching}
          onRefresh={() => vihars.refetch()}
          ListEmptyComponent={<EmptyView label={t("emptyVihars")} icon="hand-heart" />}
          renderItem={({ item }) => (
            <View style={styles.card} testID={`seva-card-${item.id}`}>
              <View style={styles.row}>
                <View style={styles.dateBadge}>
                  <Txt w="700" size={18} color={colors.onBrandTertiary}>
                    {formatDateShort(item).split(" ")[0]}
                  </Txt>
                  <Txt w="500" size={12} color={colors.onBrandTertiary}>
                    {formatDateShort(item).split(" ")[1]}
                  </Txt>
                </View>
                <View style={styles.flex}>
                  <Txt w="700" size={16} color={colors.onSurface} numberOfLines={1}>
                    {item.from_upashray} → {item.to_upashray}
                  </Txt>
                  <View style={styles.meta}>
                    <Icon name="clock-outline" size={14} color={colors.muted} />
                    <Txt size={13} color={colors.muted}>
                      {formatTime(item, lang)}
                    </Txt>
                    <Txt size={13} color={colors.muted}>
                      · {item.approx_kms} {t("km")}
                    </Txt>
                  </View>
                </View>
              </View>
              <CountPills vihar={item} />
              <View style={styles.actions}>
                <Button
                  label={t("iWillJoin")}
                  onPress={() => join(item)}
                  loading={participate.isPending && participate.variables?.id === item.id}
                  testID={`seva-join-${item.id}`}
                  haptic="success"
                  style={{ flex: 1 }}
                />
                <Button
                  label=""
                  icon="chevron-right"
                  variant="secondary"
                  onPress={() => router.push(`/vihar/${item.id}`)}
                  testID={`seva-detail-${item.id}`}
                />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  list: { padding: spacing.lg, flexGrow: 1 },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  row: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  flex: { flex: 1, gap: spacing.xs },
  meta: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  dateBadge: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: { flexDirection: "row", gap: spacing.sm },
}));
