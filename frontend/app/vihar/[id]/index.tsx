import { useMemo } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

import { useAuth } from "@/src/core/auth/auth-context";
import { useI18n } from "@/src/core/i18n";
import { useOnline } from "@/src/core/offline/net";
import { useParticipate, useVihar } from "@/src/core/vihar/hooks";
import { formatDateLong, formatTime, joinedCount, volunteerTarget } from "@/src/core/vihar/utils";
import { Button } from "@/src/shared/widgets/Button";
import { CountPills } from "@/src/shared/widgets/CountPills";
import { Icon } from "@/src/shared/widgets/Icon";
import { OfflineBanner } from "@/src/shared/widgets/OfflineBanner";
import { ProgressBar } from "@/src/shared/widgets/ProgressBar";
import { ErrorView, LoadingView } from "@/src/shared/widgets/StateViews";
import { Txt } from "@/src/shared/widgets/Txt";
import { useConfirm } from "@/src/shared/widgets/Confirm";
import { useToast } from "@/src/shared/widgets/Toast";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function ViharDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const { isAdmin } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const online = useOnline();
  const confirm = useConfirm();
  const toast = useToast();

  const q = useVihar(id!);
  const participate = useParticipate();
  const vihar = q.data;

  const joined = vihar?.user_status === "in";
  const target = vihar ? volunteerTarget(vihar) : 0;
  const jc = vihar ? joinedCount(vihar) : 0;
  const remaining = Math.max(0, target - jc);

  const confirmedNames = useMemo(() => {
    if (!vihar?.participants) return [];
    return vihar.participants
      .filter((p) => p.status === "in")
      .map((p) => p.user?.name || p.user?.phone || "—");
  }, [vihar]);

  const needs = useMemo(() => {
    if (!vihar) return [] as { icon: any; label: string }[];
    const list: { icon: any; label: string }[] = [];
    if (vihar.wheelchair > 0) list.push({ icon: "wheelchair-accessibility", label: `${t("wheelchair")}: ${vihar.wheelchair}` });
    if (vihar.luggage) list.push({ icon: "bag-suitcase", label: lang === "gu" ? "સામાન" : "Luggage" });
    if (vihar.dori) list.push({ icon: "rope", label: lang === "gu" ? "ડોરી" : "Dori" });
    if (vihar.car_required) list.push({ icon: "car", label: lang === "gu" ? "કાર જરૂરી" : "Car required" });
    if (vihar.activa) list.push({ icon: "moped", label: "Activa" });
    if (vihar.self) list.push({ icon: "human-handsup", label: lang === "gu" ? "સ્વયં વ્હીલચેર" : "Self wheelchair" });
    return list;
  }, [vihar, lang, t]);

  const onToggle = async () => {
    if (!vihar) return;
    if (joined) {
      const ok = await confirm({
        title: t("cancelSeva"),
        confirmLabel: t("cancelSeva"),
        cancelLabel: t("cancel"),
        danger: true,
      });
      if (!ok) return;
      participate.mutate(
        { id: vihar.id, status: "out" },
        { onSuccess: () => toast.show(t("done"), "success"), onError: () => toast.show(t("joinError"), "error") },
      );
    } else {
      participate.mutate(
        { id: vihar.id, status: "in" },
        { onSuccess: () => toast.show(t("sevaRecorded"), "success"), onError: () => toast.show(t("joinError"), "error") },
      );
    }
  };

  const ctaHeight = 76 + insets.bottom;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="vihar-back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} hitSlop={12}>
          <Icon name="arrow-left" size={26} color={colors.onSurface} />
        </Pressable>
        <Txt w="700" size={fontSize.lg} color={colors.onSurface} numberOfLines={1} style={styles.flex}>
          {t("route")} {vihar?.route_no ?? ""}
        </Txt>
      </View>
      {!online ? <OfflineBanner label={t("offline")} /> : null}

      {q.isLoading ? (
        <LoadingView label={t("loading")} />
      ) : q.isError || !vihar ? (
        <ErrorView label={t("errorFetch")} onRetry={() => q.refetch()} />
      ) : (
        <>
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: ctaHeight + spacing.xl }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.routeCard}>
              <Txt w="700" size={fontSize.xxl} color={colors.onSurface} numberOfLines={2}>
                {vihar.from_upashray}
              </Txt>
              <View style={styles.arrowRow}>
                <Icon name="arrow-down-thick" size={22} color={colors.brandPrimary} />
                <Txt w="500" size={fontSize.base} color={colors.muted}>
                  {vihar.approx_kms} {t("km")}
                </Txt>
              </View>
              <Txt w="700" size={fontSize.xxl} color={colors.onSurface} numberOfLines={2}>
                {vihar.to_upashray}
              </Txt>
            </View>

            <View style={styles.metaRow}>
              <Meta icon="calendar" label={t("date")} value={formatDateLong(vihar)} />
              <Meta icon="clock-outline" label={t("time")} value={formatTime(vihar, lang)} />
            </View>
            {vihar.sahebji_name ? (
              <View style={styles.sahebCard}>
                <Icon name="star-four-points" size={18} color={colors.brandPrimary} />
                <Txt w="500" size={fontSize.base} color={colors.onSurface} style={styles.flex}>
                  {vihar.sahebji_name}
                </Txt>
              </View>
            ) : null}

            <CountPills vihar={vihar} />

            {needs.length > 0 ? (
              <View style={styles.block}>
                <Txt w="700" size={fontSize.lg} color={colors.onSurface}>
                  {t("instructions")}
                </Txt>
                {needs.map((n, i) => (
                  <View key={i} style={styles.needRow}>
                    <Icon name={n.icon} size={20} color={colors.brandPrimary} />
                    <Txt size={fontSize.base} color={colors.onSurface}>
                      {n.label}
                    </Txt>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.block}>
              <Txt w="700" size={fontSize.lg} color={colors.onSurface}>
                {t("sevaStatus")}
              </Txt>
              <View style={styles.statusTop}>
                <Txt w="500" size={fontSize.base} color={colors.muted}>
                  {t("sevaks")}
                </Txt>
                <Txt w="700" size={fontSize.base} color={colors.onSurface}>
                  {jc} / {target} {t("joined")}
                </Txt>
              </View>
              <ProgressBar value={target ? jc / target : 0} />
              <Txt size={fontSize.sm} color={remaining > 0 ? colors.warning : colors.success}>
                {remaining > 0 ? `${remaining} ${t("needMore")}` : t("fullyStaffed")}
              </Txt>

              {isAdmin ? (
                confirmedNames.length > 0 ? (
                  <View style={styles.volList}>
                    <Txt w="500" size={fontSize.sm} color={colors.muted}>
                      {t("confirmedVolunteers")}
                    </Txt>
                    {confirmedNames.map((name, i) => (
                      <View key={i} style={styles.volRow}>
                        <View style={styles.volAvatar}>
                          <Txt w="700" size={14} color={colors.onBrandTertiary}>
                            {name.charAt(0).toUpperCase()}
                          </Txt>
                        </View>
                        <Icon name="check-circle" size={18} color={colors.success} />
                        <Txt size={fontSize.base} color={colors.onSurface}>
                          {name}
                        </Txt>
                      </View>
                    ))}
                  </View>
                ) : null
              ) : (
                <Txt size={fontSize.sm} color={colors.muted} style={styles.note}>
                  {joined ? t("youJoined") : t("volunteerCountNote")}
                </Txt>
              )}
            </View>
          </ScrollView>

          {/* Sticky CTA */}
          <View style={[styles.cta, { paddingBottom: insets.bottom + spacing.sm }]}>
            {Platform.OS !== "web" ? (
              <BlurView intensity={30} tint="light" style={styles.ctaBlur} />
            ) : (
              <View style={[styles.ctaBlur, { backgroundColor: colors.surfaceSecondary }]} />
            )}
            <Button
              label={joined ? t("cancelSeva") : t("iWillJoin")}
              onPress={onToggle}
              loading={participate.isPending}
              large
              variant={joined ? "danger" : "primary"}
              icon={joined ? "close-circle" : undefined}
              testID="vihar-cta"
              haptic={joined ? Haptics.ImpactFeedbackStyle.Medium : "success"}
            />
          </View>
        </>
      )}
    </View>
  );
}

// medium haptic for cancel
function Meta({ icon, label, value }: { icon: any; label: string; value: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.meta}>
      <Icon name={icon} size={20} color={colors.brandPrimary} />
      <View>
        <Txt size={fontSize.sm} color={colors.muted}>
          {label}
        </Txt>
        <Txt w="700" size={fontSize.base} color={colors.onSurface}>
          {value}
        </Txt>
      </View>
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
  routeCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  arrowRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  metaRow: { flexDirection: "row", gap: spacing.md },
  meta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  sahebCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.brandTertiary,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  block: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  needRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  statusTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  note: { marginTop: spacing.xs },
  volList: { gap: spacing.sm, marginTop: spacing.sm },
  volRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  volAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  cta: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaBlur: { ...absFill() },
}));

function absFill() {
  return { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 };
}
