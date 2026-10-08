import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import * as api from "@/src/core/api/endpoints";
import { downloadFile } from "@/src/core/api/download";
import { useI18n } from "@/src/core/i18n";
import { useOnline } from "@/src/core/offline/net";
import { qk, useMyVihars } from "@/src/core/vihar/hooks";
import { isUpcoming, sortByDateAsc, sortByDateDesc, viharYearOf } from "@/src/core/vihar/utils";
import { usesNativeTabs } from "@/src/navigation";
import { Button } from "@/src/shared/widgets/Button";
import { ChipRow } from "@/src/shared/widgets/ChipRow";
import { Icon } from "@/src/shared/widgets/Icon";
import { OfflineBanner } from "@/src/shared/widgets/OfflineBanner";
import { EmptyView, LoadingView } from "@/src/shared/widgets/StateViews";
import { useToast } from "@/src/shared/widgets/Toast";
import { Txt } from "@/src/shared/widgets/Txt";
import { ViharRow } from "@/src/shared/widgets/ViharRow";
import { currentViharYear, ViharYearFilter } from "@/src/shared/widgets/ViharYearFilter";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function HistoryScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const online = useOnline();
  const toast = useToast();
  const [tab, setTab] = useState<"upcoming" | "completed">("completed");
  const [year, setYear] = useState(currentViharYear());
  const [downloading, setDownloading] = useState<"pdf" | "excel" | null>(null);

  const mine = useMyVihars();
  const report = useQuery({ queryKey: qk.report("yearly"), queryFn: () => api.getReport("yearly") });

  const onDownload = async (kind: "pdf" | "excel") => {
    setDownloading(kind);
    try {
      await downloadFile(
        `/reports/download/${kind}?period=yearly`,
        `my_vihar_report_yearly.${kind === "pdf" ? "pdf" : "xlsx"}`,
      );
      toast.show(kind === "pdf" ? t("pdfDownloaded") : t("excelDownloaded"), "success");
    } catch {
      toast.show(t("downloadFailed"), "error");
    }
    setDownloading(null);
  };

  const list = useMemo(() => {
    const all = mine.data ?? [];
    let filtered = tab === "upcoming" ? all.filter(isUpcoming) : all.filter((v) => !isUpcoming(v));
    if (year !== "all") filtered = filtered.filter((v) => viharYearOf(v) === year);
    return [...filtered].sort(tab === "upcoming" ? sortByDateAsc : sortByDateDesc);
  }, [mine.data, tab, year]);

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

        <View style={styles.downloadRow}>
          <Button
            label={t("downloadPdf")}
            icon="file-pdf-box"
            variant="secondary"
            loading={downloading === "pdf"}
            onPress={() => onDownload("pdf")}
            testID="history-download-pdf"
            style={styles.flex}
          />
          <Button
            label={t("downloadExcel")}
            icon="file-excel"
            variant="secondary"
            loading={downloading === "excel"}
            onPress={() => onDownload("excel")}
            testID="history-download-excel"
            style={styles.flex}
          />
        </View>

        <ChipRow
          options={[
            { key: "completed" as const, label: t("completed") },
            { key: "upcoming" as const, label: t("upcoming") },
          ]}
          value={tab}
          onChange={setTab}
        />
        <ViharYearFilter vihars={mine.data ?? []} value={year} onChange={setYear} />

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
  downloadRow: { flexDirection: "row", gap: spacing.sm },
  flex: { flex: 1 },
}));
