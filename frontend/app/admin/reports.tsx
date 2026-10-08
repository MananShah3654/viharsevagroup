import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import * as api from "@/src/core/api/endpoints";
import { downloadFile } from "@/src/core/api/download";
import { useI18n } from "@/src/core/i18n";
import { qk } from "@/src/core/vihar/hooks";
import { sortByRouteDesc, viharYearOf } from "@/src/core/vihar/utils";
import { Button } from "@/src/shared/widgets/Button";
import { ChipRow } from "@/src/shared/widgets/ChipRow";
import { Icon } from "@/src/shared/widgets/Icon";
import { EmptyView, LoadingView } from "@/src/shared/widgets/StateViews";
import { useToast } from "@/src/shared/widgets/Toast";
import { Txt } from "@/src/shared/widgets/Txt";
import { ViharRow } from "@/src/shared/widgets/ViharRow";
import { ViharYearFilter } from "@/src/shared/widgets/ViharYearFilter";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

type Period = "weekly" | "monthly" | "yearly";

export default function AdminReportsScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [period, setPeriod] = useState<Period>("monthly");
  const [userId, setUserId] = useState<string | null>(null);
  const [year, setYear] = useState("all");
  const [downloading, setDownloading] = useState<"pdf" | "excel" | null>(null);

  const users = useQuery({ queryKey: qk.users, queryFn: () => api.listUsers() });
  const report = useQuery({
    queryKey: [...qk.report(period), userId],
    queryFn: () => api.getReport(period, userId ?? undefined),
  });
  const r = report.data;
  const allVihars = r?.vihars ?? [];
  const vihars = [...(year === "all" ? allVihars : allVihars.filter((v) => viharYearOf(v) === year))].sort(
    sortByRouteDesc,
  );

  const onDownload = async (kind: "pdf" | "excel") => {
    setDownloading(kind);
    try {
      const q = `period=${period}${userId ? `&user_id=${userId}` : ""}`;
      await downloadFile(
        `/reports/download/${kind}?${q}`,
        `vihar_report_${period}.${kind === "pdf" ? "pdf" : "xlsx"}`,
      );
      toast.show(kind === "pdf" ? t("pdfDownloaded") : t("excelDownloaded"), "success");
    } catch {
      toast.show(t("downloadFailed"), "error");
    }
    setDownloading(null);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="reports-back" onPress={() => router.back()} hitSlop={12}>
          <Icon name="arrow-left" size={26} color={colors.onSurface} />
        </Pressable>
        <Txt w="700" size={fontSize.lg} color={colors.onSurface} style={styles.flex}>
          {t("reports")}
        </Txt>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <ChipRow
          options={[
            { key: "weekly" as const, label: t("weekly") },
            { key: "monthly" as const, label: t("monthly") },
            { key: "yearly" as const, label: t("yearly") },
          ]}
          value={period}
          onChange={setPeriod}
        />

        <View style={styles.userChips}>
          <Pressable
            testID="report-user-all"
            onPress={() => setUserId(null)}
            style={[styles.userChip, { borderColor: userId === null ? colors.brandPrimary : colors.border }]}
          >
            <Txt w={userId === null ? "700" : "500"} size={14} color={userId === null ? colors.brandPrimary : colors.onSurfaceTertiary}>
              {t("allUsers")}
            </Txt>
          </Pressable>
          {(users.data ?? []).map((u) => (
            <Pressable
              key={u.id}
              testID={`report-user-${u.id}`}
              onPress={() => setUserId(u.id)}
              style={[styles.userChip, { borderColor: userId === u.id ? colors.brandPrimary : colors.border }]}
            >
              <Txt w={userId === u.id ? "700" : "500"} size={14} color={userId === u.id ? colors.brandPrimary : colors.onSurfaceTertiary}>
                {u.name || u.phone}
              </Txt>
            </Pressable>
          ))}
        </View>

        <View style={styles.statGrid}>
          <Stat label={t("totalVihars")} value={r?.total_vihars ?? 0} />
          <Stat label={t("totalKms")} value={Math.round(r?.total_kms ?? 0)} />
          <Stat label={t("thana")} value={r?.total_thana ?? 0} />
          <Stat label={t("sadhuji")} value={r?.total_sadhu_bhagvant ?? 0} />
          <Stat label={t("sadhviji")} value={r?.total_sadhviji_bhagvant ?? 0} />
          <Stat label={t("mumukshu")} value={r?.total_mumukshu ?? 0} />
        </View>

        <ViharYearFilter vihars={allVihars} value={year} onChange={setYear} />

        <View style={styles.downloadRow}>
          <Button
            label={t("downloadPdf")}
            icon="file-pdf-box"
            variant="secondary"
            loading={downloading === "pdf"}
            onPress={() => onDownload("pdf")}
            testID="reports-download-pdf"
            style={styles.flex}
          />
          <Button
            label={t("downloadExcel")}
            icon="file-excel"
            variant="secondary"
            loading={downloading === "excel"}
            onPress={() => onDownload("excel")}
            testID="reports-download-excel"
            style={styles.flex}
          />
        </View>

        <View style={styles.list}>
          {report.isLoading ? (
            <LoadingView label={t("loading")} />
          ) : vihars.length === 0 ? (
            <EmptyView label={t("emptyVihars")} />
          ) : (
            vihars.map((v) => <ViharRow key={v.id} vihar={v} onPress={() => router.push(`/vihar/${v.id}`)} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.statTile}>
      <Txt w="700" size={fontSize.xl} color={colors.brandPrimary}>
        {value}
      </Txt>
      <Txt size={fontSize.sm} color={colors.muted} center>
        {label}
      </Txt>
    </View>
  );
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
  userChips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  userChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  statTile: {
    flexBasis: "30%",
    flexGrow: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  downloadRow: { flexDirection: "row", gap: spacing.sm },
  list: { gap: spacing.sm },
}));
