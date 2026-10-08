import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import * as api from "@/src/core/api/endpoints";
import { useAuth } from "@/src/core/auth/auth-context";
import { useI18n } from "@/src/core/i18n";
import { qk, useVihars } from "@/src/core/vihar/hooks";
import {
  isToday,
  isUpcoming,
  parseViharDate,
  sortByRouteDesc,
  viharYearOf,
} from "@/src/core/vihar/utils";
import { AdminViharCard } from "@/src/shared/widgets/AdminViharCard";
import { Button } from "@/src/shared/widgets/Button";
import { DateField } from "@/src/shared/widgets/DateField";
import { Icon } from "@/src/shared/widgets/Icon";
import { EmptyView, LoadingView } from "@/src/shared/widgets/StateViews";
import { Txt } from "@/src/shared/widgets/Txt";
import { currentViharYear, ViharYearFilter } from "@/src/shared/widgets/ViharYearFilter";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

function isThisMonth(dateStr: string | undefined): boolean {
  const d = parseViharDate(dateStr);
  if (!d) return false;
  const n = new Date();
  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
}

export default function AdminHome() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const vihars = useVihars();
  const users = useQuery({ queryKey: qk.users, queryFn: () => api.listUsers() });
  const [dateFilter, setDateFilter] = useState("");
  const [yearFilter, setYearFilter] = useState(currentViharYear());

  const upcoming = useMemo(() => {
    let list = (vihars.data ?? []).filter(isUpcoming).sort(sortByRouteDesc);
    if (yearFilter !== "all") list = list.filter((v) => viharYearOf(v) === yearFilter);
    const filterDate = parseViharDate(dateFilter);
    if (filterDate) list = list.filter((v) => parseViharDate(v.vihar_date)?.getTime() === filterDate.getTime());
    return list;
  }, [vihars.data, dateFilter, yearFilter]);
  const today = useMemo(() => (vihars.data ?? []).find(isToday), [vihars.data]);

  const allVihars = vihars.data ?? [];
  const allUsers = users.data ?? [];
  const thisMonthVihars = allVihars.filter((v) => isThisMonth(v.vihar_date));

  const stats = [
    { icon: "map-marker-radius" as const, value: allVihars.length, label: t("totalVihars"), tab: "/admin/create-vihar" },
    { icon: "account-group" as const, value: allUsers.length, label: t("totalUsers"), tab: "/admin/users" },
    {
      icon: "navigation-variant" as const,
      value: `${allVihars.reduce((s, v) => s + (v.approx_kms || 0), 0).toFixed(1)} ${t("km")}`,
      label: t("totalKms"),
      tab: "/admin/reports",
    },
    {
      icon: "account-check" as const,
      value: allUsers.filter((u) => u.role === "user").length,
      label: t("activeParticipants"),
      tab: "/admin/users",
    },
    {
      icon: "human" as const,
      value: allVihars.reduce((s, v) => s + (v.sadhu_bhagvant || 0), 0),
      label: t("sadhuji"),
      tab: "/admin/reports",
    },
    {
      icon: "human-female" as const,
      value: allVihars.reduce((s, v) => s + (v.sadhviji_bhagvant || 0), 0),
      label: t("sadhviji"),
      tab: "/admin/reports",
    },
  ];

  const thisMonth = [
    { label: t("upcomingVihars"), value: thisMonthVihars.length },
    { label: t("newUsers"), value: allUsers.filter((u) => isThisMonth(u.created_at)).length },
    { label: t("km"), value: thisMonthVihars.reduce((s, v) => s + (v.approx_kms || 0), 0).toFixed(1) },
    { label: t("sadhuji"), value: thisMonthVihars.reduce((s, v) => s + (v.sadhu_bhagvant || 0), 0) },
    { label: t("sadhviji"), value: thisMonthVihars.reduce((s, v) => s + (v.sadhviji_bhagvant || 0), 0) },
  ];

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
        <View style={styles.banner}>
          <Txt size={12} color={colors.onBrandPrimary} style={{ opacity: 0.85 }}>
            {new Date().toLocaleDateString(lang === "gu" ? "gu-IN" : "en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Txt>
          <Txt w="700" size={fontSize.lg} color={colors.onBrandPrimary}>
            🙏 {t("jayJinendra")}, {user?.name || "Admin"}
          </Txt>
          <Txt size={13} color={colors.onBrandPrimary} style={{ opacity: 0.9 }}>
            {t("adminPanel")}
          </Txt>
        </View>

        <View style={styles.statGrid}>
          {stats.map((s) => (
            <Pressable key={s.label} style={styles.statTile} onPress={() => router.push(s.tab as any)} testID={`admin-stat-${s.label}`}>
              <Icon name={s.icon} size={22} color={colors.brandPrimary} />
              <Txt w="700" size={fontSize.xl} color={colors.onSurface}>
                {s.value}
              </Txt>
              <Txt size={12} color={colors.muted} center>
                {s.label}
              </Txt>
            </Pressable>
          ))}
        </View>

        <View style={styles.monthStrip}>
          <Txt w="700" size={fontSize.sm} color={colors.onSurface} style={{ marginBottom: spacing.sm }}>
            📅 {t("thisMonthSummary")}
          </Txt>
          <View style={styles.monthRow}>
            {thisMonth.map((m) => (
              <View key={m.label} style={styles.monthCell}>
                <Txt w="700" size={fontSize.lg} color={colors.brandPrimary}>
                  {m.value}
                </Txt>
                <Txt size={11} color={colors.muted} center>
                  {m.label}
                </Txt>
              </View>
            ))}
          </View>
        </View>

        <Button
          label={t("createVihar")}
          icon="plus-circle"
          onPress={() => router.push("/admin/create-vihar")}
          large
          testID="admin-create-vihar"
          haptic="success"
        />
        <View style={styles.row2}>
          <Button
            label={t("manageUsers")}
            icon="account-group"
            variant="secondary"
            onPress={() => router.push("/admin/users")}
            testID="admin-manage-users"
            style={styles.flex}
          />
          <Button
            label={t("reports")}
            icon="chart-box"
            variant="secondary"
            onPress={() => router.push("/admin/reports")}
            testID="admin-reports"
            style={styles.flex}
          />
        </View>

        {today ? (
          <View style={styles.block}>
            <Txt w="700" size={fontSize.lg} color={colors.onSurface}>
              {t("todayVihar")}
            </Txt>
            <AdminViharCard vihar={today} />
          </View>
        ) : null}

        <View style={styles.filterRow}>
          <Txt w="700" size={fontSize.lg} color={colors.onSurface} style={styles.flex}>
            {t("upcomingVihars")}
          </Txt>
          {dateFilter ? (
            <Pressable testID="admin-clear-date-filter" onPress={() => setDateFilter("")} hitSlop={8}>
              <Txt w="500" size={13} color={colors.brandPrimary}>
                {t("clearFilter")}
              </Txt>
            </Pressable>
          ) : null}
        </View>
        <ViharYearFilter vihars={vihars.data ?? []} value={yearFilter} onChange={setYearFilter} />
        <DateField label={t("filterByDate")} value={dateFilter} onChange={setDateFilter} testID="admin-date-filter" />

        {vihars.isLoading ? (
          <LoadingView label={t("loading")} />
        ) : upcoming.length === 0 ? (
          <EmptyView label={t("emptyVihars")} />
        ) : (
          upcoming.map((v) => <AdminViharCard key={v.id} vihar={v} />)
        )}
      </ScrollView>
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
  row2: { flexDirection: "row", gap: spacing.sm },
  block: { gap: spacing.sm },
  filterRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.sm },
  banner: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
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
  monthStrip: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  monthRow: { flexDirection: "row", flexWrap: "wrap" },
  monthCell: { flexBasis: "20%", flexGrow: 1, alignItems: "center", paddingVertical: spacing.xs },
}));
