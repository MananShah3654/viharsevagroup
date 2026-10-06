import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useI18n } from "@/src/core/i18n";
import { useOnline } from "@/src/core/offline/net";
import { useVihars } from "@/src/core/vihar/hooks";
import { isPast, isToday, isUpcoming, sortByDateAsc, sortByDateDesc } from "@/src/core/vihar/utils";
import { usesNativeTabs } from "@/src/navigation";
import { ChipRow } from "@/src/shared/widgets/ChipRow";
import { OfflineBanner } from "@/src/shared/widgets/OfflineBanner";
import { EmptyView, ErrorView, LoadingView } from "@/src/shared/widgets/StateViews";
import { Txt } from "@/src/shared/widgets/Txt";
import { ViharRow } from "@/src/shared/widgets/ViharRow";
import { fontSize, makeStyles, spacing, useTheme } from "@/src/theme";

type Filter = "all" | "today" | "upcoming" | "past";

export default function ViharsScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const online = useOnline();
  const vihars = useVihars();
  const [filter, setFilter] = useState<Filter>("all");

  const data = useMemo(() => {
    const all = vihars.data ?? [];
    let list = all;
    if (filter === "today") list = all.filter(isToday);
    else if (filter === "upcoming") list = all.filter(isUpcoming);
    else if (filter === "past") list = all.filter(isPast);
    return [...list].sort(filter === "past" ? sortByDateDesc : sortByDateAsc);
  }, [vihars.data, filter]);

  const bottomChrome = usesNativeTabs ? insets.bottom : 0;

  const options = [
    { key: "all" as const, label: t("all") },
    { key: "upcoming" as const, label: t("upcoming") },
    { key: "today" as const, label: t("today") },
    { key: "past" as const, label: t("past") },
  ];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Txt w="700" size={fontSize.xl} color={colors.onSurface}>
          {t("tabVihars")}
        </Txt>
        <ChipRow options={options} value={filter} onChange={setFilter} />
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
          renderItem={({ item }) => (
            <ViharRow vihar={item} onPress={() => router.push(`/vihar/${item.id}`)} />
          )}
          contentContainerStyle={[styles.list, { paddingBottom: bottomChrome + spacing.xxl }]}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          showsVerticalScrollIndicator={false}
          refreshing={vihars.isRefetching}
          onRefresh={() => vihars.refetch()}
          ListEmptyComponent={<EmptyView label={t("emptyVihars")} />}
        />
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  list: { padding: spacing.lg, flexGrow: 1 },
}));
