import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import * as api from "@/src/core/api/endpoints";
import { useI18n } from "@/src/core/i18n";
import { useOnline } from "@/src/core/offline/net";
import { qk, useMyVihars } from "@/src/core/vihar/hooks";
import { isUpcoming, sortByDateAsc, sortByDateDesc } from "@/src/core/vihar/utils";
import { usesNativeTabs } from "@/src/navigation";
import { ChipRow } from "@/src/shared/widgets/ChipRow";
import { Icon } from "@/src/shared/widgets/Icon";
import { OfflineBanner } from "@/src/shared/widgets/OfflineBanner";
import { EmptyView, LoadingView } from "@/src/shared/widgets/StateViews";
import { Txt } from "@/src/shared/widgets/Txt";
import { ViharRow } from "@/src/shared/widgets/ViharRow";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function HistoryScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const online = useOnline();
  const [tab, setTab] = useState<"upcoming" | "completed">("completed");

  const mine = useMyVihars();
  const report = useQuery({ queryKey: qk.report("yearly"), queryFn: () => api.getReport("yearly") });

  const list = useMemo(() => {
    const all = mine.data ?? [];
    const filtered = tab === "upcoming" ? all.filter(isUpcoming) : all.filter((v) => !isUpcoming(v));
    return [...filtered].sort(tab === "upcoming" ? sortByDateAsc : sortByDateDesc);
  }, [mine.data, tab]);

  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const r = report.data;

  const stats = [
    { icon: "walk" as const, value: r?.total_vihars ?? 0, label: t("totalVihars") },
    { icon: "map-marker-distance" as const, value: `${Math.round(r?.total_kms ?? 0)}`, label: `${t("totalSeva")} (${t("km")})` },
    { icon: "human" as const, value: r?.total_sadhu_bhagvant ?? 0, label: t("sadhuji") },
    { icon: "human-female" as const, value: r?.total_sadhviji_bhagvant ?? 0, label: t("sadhviji") },
  ];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Txt w="700" size={fontSize.xl} color={colors.onSurface}>
          {t("tabHistory")}
        </Txt>
      </View>
      {!online ? <OfflineBanner label={t("offline")} /> : null}

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomChrome + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        refreshControl={undefined}
      >
        <View style={styles.statGrid}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statTile} testID={`stat-${s.label}`}>
              <Icon name={s.icon} size={22} color={colors.brandPrimary} />
              <Txt w="700" size={fontSize.xxl} color={colors.brandPrimary}>
                {s.value}
              </Txt>
              <Txt size={fontSize.sm} color={colors.muted} center>
                {s.label}
              </Txt>
            </View>
          ))}
        </View>

        <ChipRow
          options={[
            { key: "completed" as const, label: t("completed") },
            { key: "upcoming" as const, label: t("upcoming") },
          ]}
          value={tab}
          onChange={setTab}
        />

        <View style={styles.list}>
          {mine.isLoading ? (
            <LoadingView label={t("loading")} />
          ) : list.length === 0 ? (
            <EmptyView label={t("emptyHistory")} icon="history" />
          ) : (
            list.map((v) => <ViharRow key={v.id} vihar={v} onPress={() => router.push(`/vihar/${v.id}`)} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  content: { padding: spacing.lg, gap: spacing.md },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  statTile: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  list: { gap: spacing.sm, marginTop: spacing.xs },
}));
