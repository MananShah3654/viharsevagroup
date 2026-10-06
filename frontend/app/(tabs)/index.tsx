import { useMemo } from "react";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/src/core/auth/auth-context";
import { useI18n } from "@/src/core/i18n";
import { useOnline } from "@/src/core/offline/net";
import { useMyVihars, useParticipate, useVihars } from "@/src/core/vihar/hooks";
import { isToday, isUpcoming, sortByDateAsc } from "@/src/core/vihar/utils";
import { usesNativeTabs } from "@/src/navigation";
import { Icon } from "@/src/shared/widgets/Icon";
import { OfflineBanner } from "@/src/shared/widgets/OfflineBanner";
import { EmptyView, ErrorView, LoadingView } from "@/src/shared/widgets/StateViews";
import { TodayViharCard } from "@/src/shared/widgets/TodayViharCard";
import { Txt } from "@/src/shared/widgets/Txt";
import { ViharRow } from "@/src/shared/widgets/ViharRow";
import { useToast } from "@/src/shared/widgets/Toast";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function HomeScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const online = useOnline();
  const toast = useToast();

  const vihars = useVihars();
  const mine = useMyVihars();
  const participate = useParticipate();

  const today = useMemo(
    () => (vihars.data ?? []).find((v) => isToday(v)),
    [vihars.data],
  );
  const upcoming = useMemo(
    () => (vihars.data ?? []).filter((v) => isUpcoming(v) && !isToday(v)).sort(sortByDateAsc).slice(0, 5),
    [vihars.data],
  );
  const myUpcoming = useMemo(
    () => (mine.data ?? []).filter(isUpcoming).sort(sortByDateAsc).slice(0, 3),
    [mine.data],
  );

  const bottomChrome = usesNativeTabs ? insets.bottom : 0;

  const onJoinToday = () => {
    if (!today) return;
    const next = today.user_status === "in" ? "out" : "in";
    participate.mutate(
      { id: today.id, status: next },
      {
        onSuccess: () =>
          toast.show(next === "in" ? t("sevaRecorded") : t("done"), "success"),
        onError: () => toast.show(t("joinError"), "error"),
      },
    );
  };

  return (
    <View style={styles.screen}>
      {/* Sticky header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.flex}>
          <Txt w="700" size={fontSize.xl} color={colors.onSurface} numberOfLines={1}>
            {t("appName")}
          </Txt>
          <Txt size={fontSize.base} color={colors.muted}>
            {t("pranam")}, {user?.name || user?.phone} 🙏
          </Txt>
        </View>
        {isAdmin ? (
          <Pressable testID="home-admin-button" onPress={() => router.push("/admin")} style={styles.adminBtn} hitSlop={8}>
            <Icon name="shield-account" size={24} color={colors.onBrandTertiary} />
          </Pressable>
        ) : null}
      </View>
      {!online ? <OfflineBanner label={t("offline")} /> : null}

      {vihars.isLoading ? (
        <LoadingView label={t("loading")} />
      ) : vihars.isError ? (
        <ErrorView label={t("errorFetch")} onRetry={() => vihars.refetch()} />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomChrome + spacing.xxl }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={vihars.isRefetching}
              onRefresh={() => {
                vihars.refetch();
                mine.refetch();
              }}
              tintColor={colors.brandPrimary}
            />
          }
        >
          <Txt w="700" size={fontSize.lg} color={colors.onSurface} style={styles.sectionTitle}>
            {t("todayVihar")}
          </Txt>
          {today ? (
            <TodayViharCard
              vihar={today}
              onPress={() => router.push(`/vihar/${today.id}`)}
              onJoin={onJoinToday}
              joining={participate.isPending}
            />
          ) : (
            <View style={styles.emptyCard}>
              <Icon name="white-balance-sunny" size={40} color={colors.borderStrong} />
              <Txt size={fontSize.base} color={colors.muted} center>
                {t("noTodayVihar")}
              </Txt>
            </View>
          )}

          {myUpcoming.length > 0 ? (
            <Section title={t("myUpcomingSeva")}>
              {myUpcoming.map((v) => (
                <ViharRow key={v.id} vihar={v} onPress={() => router.push(`/vihar/${v.id}`)} />
              ))}
            </Section>
          ) : null}

          <Section
            title={t("upcomingVihars")}
            onSeeAll={() => router.push("/(tabs)/vihars")}
            seeAllLabel={t("seeAll")}
          >
            {upcoming.length > 0 ? (
              upcoming.map((v) => (
                <ViharRow key={v.id} vihar={v} onPress={() => router.push(`/vihar/${v.id}`)} />
              ))
            ) : (
              <EmptyView label={t("emptyVihars")} />
            )}
          </Section>
        </ScrollView>
      )}
    </View>
  );
}

function Section({
  title,
  children,
  onSeeAll,
  seeAllLabel,
}: {
  title: string;
  children: React.ReactNode;
  onSeeAll?: () => void;
  seeAllLabel?: string;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Txt w="700" size={fontSize.lg} color={colors.onSurface}>
          {title}
        </Txt>
        {onSeeAll ? (
          <Pressable onPress={onSeeAll} hitSlop={8} testID="see-all">
            <Txt w="500" size={14} color={colors.brandPrimary}>
              {seeAllLabel}
            </Txt>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.list}>{children}</View>
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
  adminBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: spacing.lg, gap: spacing.md },
  sectionTitle: { marginBottom: spacing.xs },
  emptyCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
  },
  section: { gap: spacing.sm, marginTop: spacing.md },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  list: { gap: spacing.sm },
}));
