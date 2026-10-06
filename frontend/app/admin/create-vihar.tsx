import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "@/src/core/api/endpoints";
import { useI18n } from "@/src/core/i18n";
import { ApiError, OfflineError } from "@/src/core/api/client";
import { qk } from "@/src/core/vihar/hooks";
import { Button } from "@/src/shared/widgets/Button";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";
import { useToast } from "@/src/shared/widgets/Toast";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function CreateViharScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const qc = useQueryClient();

  const nextRoute = useQuery({
    queryKey: ["nextRoute"],
    queryFn: () => api.nextRouteNumber(),
  });

  const [form, setForm] = useState({
    route_no: "",
    vihar_date: "",
    vihar_time: "",
    from_upashray: "",
    to_upashray: "",
    approx_kms: "",
    sadhu_bhagvant: "",
    sadhviji_bhagvant: "",
    mumukshu: "",
    wheelchair: "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const routePlaceholder = nextRoute.data?.next_route_number ?? "";

  const onSubmit = async () => {
    if (!form.vihar_date || !form.vihar_time || !form.from_upashray || !form.to_upashray) {
      toast.show(t("required"), "error");
      return;
    }
    setLoading(true);
    try {
      await api.createVihar({
        route_no: form.route_no || routePlaceholder || undefined,
        vihar_date: form.vihar_date,
        vihar_time: form.vihar_time,
        from_upashray: form.from_upashray,
        to_upashray: form.to_upashray,
        approx_kms: parseFloat(form.approx_kms) || 0,
        sadhu_bhagvant: parseInt(form.sadhu_bhagvant, 10) || 0,
        sadhviji_bhagvant: parseInt(form.sadhviji_bhagvant, 10) || 0,
        mumukshu: parseInt(form.mumukshu, 10) || 0,
        wheelchair: parseInt(form.wheelchair, 10) || 0,
      } as any);
    } catch (e) {
      if (e instanceof OfflineError) toast.show(t("offline"), "error");
      else if (e instanceof ApiError) toast.show(e.message, "error");
      else toast.show(t("somethingWrong"), "error");
      setLoading(false);
      return;
    }
    qc.invalidateQueries({ queryKey: qk.vihars });
    setLoading(false);
    toast.show(t("done"), "success");
    router.back();
  };

  const Field = ({
    label,
    k,
    keyboardType = "default",
    placeholder,
    half,
  }: {
    label: string;
    k: keyof typeof form;
    keyboardType?: "default" | "number-pad" | "decimal-pad";
    placeholder?: string;
    half?: boolean;
  }) => (
    <View style={[styles.field, half && styles.half]}>
      <Txt w="500" size={14} color={colors.onSurfaceTertiary}>
        {label}
      </Txt>
      <TextInput
        testID={`vihar-${k}`}
        style={styles.input}
        value={form[k]}
        onChangeText={set(k)}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
      />
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="create-back" onPress={() => router.back()} hitSlop={12}>
          <Icon name="close" size={26} color={colors.onSurface} />
        </Pressable>
        <Txt w="700" size={fontSize.lg} color={colors.onSurface} style={styles.flex}>
          {t("createVihar")}
        </Txt>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
      >
        <Field label={`${t("routeNo")} (${routePlaceholder})`} k="route_no" keyboardType="number-pad" placeholder={routePlaceholder} />
        <View style={styles.row}>
          <Field label={t("date")} k="vihar_date" placeholder="DD/MM/YY" half />
          <Field label={t("time")} k="vihar_time" placeholder="5:30" half />
        </View>
        <Field label={t("from")} k="from_upashray" />
        <Field label={t("to")} k="to_upashray" />
        <Field label={`${t("distance")} (${t("km")})`} k="approx_kms" keyboardType="decimal-pad" placeholder="4.2" />
        <View style={styles.row}>
          <Field label={t("sadhuji")} k="sadhu_bhagvant" keyboardType="number-pad" half />
          <Field label={t("sadhviji")} k="sadhviji_bhagvant" keyboardType="number-pad" half />
        </View>
        <View style={styles.row}>
          <Field label={t("mumukshu")} k="mumukshu" keyboardType="number-pad" half />
          <Field label={t("wheelchair")} k="wheelchair" keyboardType="number-pad" half />
        </View>

        <Button
          label={t("createBtn")}
          onPress={onSubmit}
          loading={loading}
          large
          testID="create-submit"
          style={{ marginTop: spacing.lg }}
          haptic="success"
        />
      </KeyboardAwareScrollView>
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
  row: { flexDirection: "row", gap: spacing.md },
  field: { gap: spacing.xs },
  half: { flex: 1 },
  input: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    fontSize: fontSize.base,
    fontFamily: "NotoSansGujarati-Regular",
    color: colors.onSurface,
  },
}));
