// The whole create/edit vihar form body, used by both admin/create-vihar.tsx
// and admin/edit-vihar/[id].tsx as thin wrappers. Split mode (creating N
// vihars sharing metadata, one per leg) is only available when creating.
import { useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";

import * as api from "@/src/core/api/endpoints";
import { useI18n } from "@/src/core/i18n";
import { ApiError, OfflineError } from "@/src/core/api/client";
import { qk } from "@/src/core/vihar/hooks";
import { parseViharDate, viharYearLabel } from "@/src/core/vihar/utils";
import { formatViharForWhatsapp } from "@/src/core/vihar/whatsapp-format";
import { shareText, viharRsvpLink } from "@/src/core/share/whatsapp";
import { Button } from "@/src/shared/widgets/Button";
import { Checkbox } from "@/src/shared/widgets/Checkbox";
import { FormField } from "@/src/shared/widgets/FormField";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";
import { useToast } from "@/src/shared/widgets/Toast";
import { LegFields, LegValue } from "@/src/shared/vihar-form/LegFields";
import { SharedFields, SharedValue } from "@/src/shared/vihar-form/SharedFields";
import { fontSize, makeStyles, spacing, useTheme } from "@/src/theme";
import type { Vihar } from "@/src/shared/models";

function makeEmptyLeg(): LegValue {
  return { from_upashray: "", to_upashray: "", vihar_date: "", vihar_time: "", approx_kms: "" };
}

interface Props {
  initialVihar?: Vihar;
}

export function ViharForm({ initialVihar }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const isEdit = !!initialVihar;

  const [routeNo, setRouteNo] = useState(initialVihar?.route_no ?? "");
  const [splitMode, setSplitMode] = useState(false);
  const [leg, setLeg] = useState<LegValue>(
    initialVihar
      ? {
          from_upashray: initialVihar.from_upashray,
          to_upashray: initialVihar.to_upashray,
          vihar_date: initialVihar.vihar_date,
          vihar_time: initialVihar.vihar_time,
          approx_kms: String(initialVihar.approx_kms ?? ""),
        }
      : makeEmptyLeg(),
  );

  // Season-scoped route number and lifetime total number depend on which
  // date the vihar actually falls on, so refetch whenever that date changes
  // (route_no resets each vihar season; total_no never does).
  const nextRoute = useQuery({
    queryKey: ["nextRoute", leg.vihar_date],
    queryFn: () => api.nextRouteNumber(leg.vihar_date || undefined),
    enabled: !isEdit,
  });
  const routePlaceholder = isEdit ? initialVihar!.route_no : nextRoute.data?.next_route_number ?? "";
  const totalPlaceholder = isEdit ? initialVihar!.total_no ?? "" : nextRoute.data?.next_total_number ?? "";
  const numberingDate = parseViharDate(leg.vihar_date);
  const numberingSeason = numberingDate ? viharYearLabel(numberingDate) : "";
  const [legs, setLegs] = useState<LegValue[]>([makeEmptyLeg(), makeEmptyLeg()]);
  const [shared, setShared] = useState<SharedValue>({
    sahebji_name: initialVihar?.sahebji_name ?? "",
    sadhu_bhagvant: String(initialVihar?.sadhu_bhagvant ?? ""),
    sadhviji_bhagvant: String(initialVihar?.sadhviji_bhagvant ?? ""),
    mumukshu: String(initialVihar?.mumukshu ?? ""),
    wheelchair: String(initialVihar?.wheelchair ?? ""),
    self: !!initialVihar?.self,
    luggage: !!initialVihar?.luggage,
    dori: !!initialVihar?.dori,
    car_required: !!initialVihar?.car_required,
    activa: !!initialVihar?.activa,
  });
  const [loading, setLoading] = useState(false);

  const updateLeg = (index: number, patch: Partial<LegValue>) => {
    setLegs((prev) => {
      const next = [...prev];
      const old = next[index];
      next[index] = { ...old, ...patch };

      if (patch.to_upashray !== undefined && index + 1 < next.length) {
        const nextLeg = next[index + 1];
        if (!nextLeg.from_upashray || nextLeg.from_upashray === old.to_upashray) {
          next[index + 1] = { ...nextLeg, from_upashray: patch.to_upashray };
        }
      }
      if (index === 0 && patch.vihar_date !== undefined) {
        for (let i = 1; i < next.length; i++) {
          if (!next[i].vihar_date || next[i].vihar_date === old.vihar_date) {
            next[i] = { ...next[i], vihar_date: patch.vihar_date };
          }
        }
      }
      return next;
    });
  };

  const onCopyToWhatsapp = async () => {
    const message = formatViharForWhatsapp({ route_no: routeNo || routePlaceholder, total_no: totalPlaceholder || undefined, ...shared, ...leg });
    await Clipboard.setStringAsync(message);
    toast.show(t("copiedToClipboard"), "success");
  };

  const addStage = () => setLegs((prev) => [...prev, makeEmptyLeg()]);
  const removeStage = (index: number) =>
    setLegs((prev) => (prev.length > 2 ? prev.filter((_, i) => i !== index) : prev));

  const sharedPayload = () => ({
    sahebji_name: shared.sahebji_name,
    sadhu_bhagvant: parseInt(shared.sadhu_bhagvant, 10) || 0,
    sadhviji_bhagvant: parseInt(shared.sadhviji_bhagvant, 10) || 0,
    mumukshu: parseInt(shared.mumukshu, 10) || 0,
    wheelchair: parseInt(shared.wheelchair, 10) || 0,
    self: shared.self,
    luggage: shared.luggage,
    dori: shared.dori,
    car_required: shared.car_required,
    activa: shared.activa,
  });

  const legPayload = (l: LegValue) => ({
    vihar_date: l.vihar_date,
    vihar_time: l.vihar_time,
    from_upashray: l.from_upashray,
    to_upashray: l.to_upashray,
    approx_kms: parseFloat(l.approx_kms) || 0,
  });

  const onSubmit = async () => {
    if (splitMode) {
      for (let i = 0; i < legs.length; i++) {
        const l = legs[i];
        if (!l.vihar_date || !l.vihar_time || !l.from_upashray || !l.to_upashray) {
          toast.show(`${t("stage")} ${i + 1}: ${t("required")}`, "error");
          return;
        }
      }
      setLoading(true);
      let createdCount = 0;
      for (let i = 0; i < legs.length; i++) {
        try {
          await api.createVihar({ ...sharedPayload(), ...legPayload(legs[i]) });
          createdCount++;
        } catch (e) {
          const detail =
            e instanceof ApiError ? e.message : e instanceof OfflineError ? t("offline") : t("somethingWrong");
          toast.show(`${t("stage")} ${i + 1}: ${detail}`, "error");
          setLoading(false);
          return;
        }
      }
      qc.invalidateQueries({ queryKey: qk.vihars });
      setLoading(false);
      toast.show(`${createdCount} ${t("done")}`, "success");
      router.back();
      return;
    }

    if (!leg.vihar_date || !leg.vihar_time || !leg.from_upashray || !leg.to_upashray) {
      toast.show(t("required"), "error");
      return;
    }
    setLoading(true);
    let created: Vihar | null = null;
    try {
      if (isEdit) {
        await api.updateVihar(initialVihar!.id, {
          ...(routeNo ? { route_no: routeNo } : {}),
          ...sharedPayload(),
          ...legPayload(leg),
        });
      } else {
        // Only send route_no when the admin manually typed an override —
        // otherwise let the server auto-generate it (season-scoped) at
        // submit time, since the previewed placeholder can go stale if the
        // date was changed after the preview loaded.
        created = await api.createVihar({
          ...(routeNo ? { route_no: routeNo } : {}),
          ...sharedPayload(),
          ...legPayload(leg),
        });
      }
    } catch (e) {
      if (e instanceof OfflineError) toast.show(t("offline"), "error");
      else if (e instanceof ApiError) toast.show(e.message, "error");
      else toast.show(t("somethingWrong"), "error");
      setLoading(false);
      return;
    }
    qc.invalidateQueries({ queryKey: qk.vihars });
    if (isEdit) qc.invalidateQueries({ queryKey: qk.vihar(initialVihar!.id) });
    setLoading(false);
    toast.show(isEdit ? t("viharUpdated") : t("done"), "success");
    if (!isEdit && created) {
      // Straight into the WhatsApp share sheet with the same full-detail
      // message main's "Copy to WhatsApp" produces, plus the app's RSVP join
      // link — so the admin doesn't have to hunt for a separate step right
      // after creating the vihar. Built from what was actually typed (not
      // the server's echoed-back record), so date/time can't drift from
      // what's on screen.
      const message = formatViharForWhatsapp({
        route_no: created.route_no || routeNo || routePlaceholder,
        total_no: created.total_no,
        ...shared,
        ...leg,
      });
      await shareText(`${message}\n\nસેવામાં જોડાઓ 👇\n${viharRsvpLink(created)}`);
    }
    router.back();
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.numberColumns}>
        <View style={styles.numberColumn}>
          <Txt w="500" size={15} color={colors.onSurfaceTertiary}>{t("originalNo")}</Txt>
          <Txt w="700" size={18} testID="vihar-total-no">{totalPlaceholder || "—"}</Txt>
        </View>
        <FormField
          label={`${t("yearlyNo")}${numberingSeason ? ` (${numberingSeason})` : ""}`}
          value={routeNo}
          onChange={setRouteNo}
          keyboardType="number-pad"
          placeholder={routePlaceholder}
          testID="vihar-route-no"
          style={styles.numberColumn}
        />
      </View>
      <Txt size={12} color={colors.muted}>{t("numberingNote")}</Txt>

      {!isEdit ? (
        <Pressable
          testID="vihar-split-toggle"
          onPress={() => setSplitMode((v) => !v)}
          style={styles.splitToggle}
        >
          <Icon
            name={splitMode ? "checkbox-marked" : "checkbox-blank-outline"}
            size={22}
            color={splitMode ? colors.brandPrimary : colors.borderStrong}
          />
          <Txt w="500" size={fontSize.base} color={colors.onSurface}>
            {t("splitVihar")}
          </Txt>
        </Pressable>
      ) : null}

      {splitMode ? (
        <>
          <SharedFields value={shared} onChange={(p) => setShared((s) => ({ ...s, ...p }))} />
          {legs.map((l, i) => (
            <View key={i} style={styles.stageCard}>
              <View style={styles.stageHeader}>
                <Txt w="700" size={fontSize.base} color={colors.onSurface}>
                  {t("stage")} {i + 1}
                </Txt>
                {legs.length > 2 ? (
                  <Pressable testID={`vihar-remove-stage-${i}`} onPress={() => removeStage(i)} hitSlop={8}>
                    <Icon name="trash-can-outline" size={20} color={colors.error} />
                  </Pressable>
                ) : null}
              </View>
              <LegFields value={l} onChange={(p) => updateLeg(i, p)} testIDPrefix={`vihar-stage-${i}`} />
            </View>
          ))}
          <Button label={t("addStage")} onPress={addStage} variant="secondary" testID="vihar-add-stage" />
        </>
      ) : (
        <>
          <LegFields value={leg} onChange={(p) => setLeg((l) => ({ ...l, ...p }))} testIDPrefix="vihar" />
          <SharedFields value={shared} onChange={(p) => setShared((s) => ({ ...s, ...p }))} />
          <Button
            label={t("copyToWhatsapp")}
            icon="content-copy"
            variant="secondary"
            onPress={onCopyToWhatsapp}
            testID="vihar-copy-whatsapp"
          />
        </>
      )}

      <Button
        label={isEdit ? t("save") : t("createBtn")}
        onPress={onSubmit}
        loading={loading}
        large
        testID="vihar-form-submit"
        style={{ marginTop: spacing.lg }}
        haptic="success"
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: { gap: spacing.md },
  numberColumns: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  numberColumn: { flex: 1, minWidth: 0, gap: spacing.xs },
  splitToggle: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xs },
  stageCard: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  stageHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
}));
