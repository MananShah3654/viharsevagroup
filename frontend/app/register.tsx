import { useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { useAuth } from "@/src/core/auth/auth-context";
import { useI18n } from "@/src/core/i18n";
import { ApiError, OfflineError } from "@/src/core/api/client";
import { validateMandatoryUserFields } from "@/src/core/validation/mandatoryFields";
import { Button } from "@/src/shared/widgets/Button";
import { FormField } from "@/src/shared/widgets/FormField";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";
import { useToast } from "@/src/shared/widgets/Toast";
import { fontSize, makeStyles, spacing, useTheme } from "@/src/theme";

export default function RegisterScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { signUp } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    phone: "",
    password: "",
    confirm_password: "",
    name: "",
    area: "",
    blood_group: "",
    emergency_contact: "",
    date_of_birth: "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async () => {
    const error = validateMandatoryUserFields(
      form,
      { requireArea: true, requirePassword: true, requireConfirm: true },
      t,
    );
    if (error) {
      toast.show(error, "error");
      return;
    }
    setLoading(true);
    try {
      const { confirm_password, ...payload } = form;
      await signUp(payload);
    } catch (e) {
      if (e instanceof OfflineError) toast.show(t("offline"), "error");
      else if (e instanceof ApiError) toast.show(e.message, "error");
      else toast.show(t("somethingWrong"), "error");
      setLoading(false);
      return;
    }
    setLoading(false);
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: colors.surface }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.xl }]}
      bottomOffset={24}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Pressable testID="register-back" onPress={() => router.back()} hitSlop={12}>
          <Icon name="arrow-left" size={26} color={colors.onSurface} />
        </Pressable>
        <Txt w="700" size={fontSize.xl} color={colors.onSurface}>
          {t("registerTitle")}
        </Txt>
      </View>

      <FormField label={t("name")} value={form.name} onChange={set("name")} required testID="reg-name" />
      <FormField
        label={t("phone")}
        value={form.phone}
        onChange={(v) => set("phone")(v.replace(/[^0-9]/g, ""))}
        keyboardType="phone-pad"
        maxLength={10}
        placeholder="9876543210"
        required
        testID="reg-phone"
      />
      <FormField
        label={t("password")}
        value={form.password}
        onChange={(v) => set("password")(v.replace(/[^0-9]/g, ""))}
        keyboardType="number-pad"
        secure
        maxLength={4}
        placeholder="••••"
        required
        testID="reg-password"
      />
      <FormField
        label={t("confirmPassword")}
        value={form.confirm_password}
        onChange={(v) => set("confirm_password")(v.replace(/[^0-9]/g, ""))}
        keyboardType="number-pad"
        secure
        maxLength={4}
        placeholder="••••"
        required
        testID="reg-confirm-password"
      />
      <FormField label={t("area")} value={form.area} onChange={set("area")} required testID="reg-area" />
      <FormField
        label={t("bloodGroup")}
        value={form.blood_group}
        onChange={set("blood_group")}
        placeholder="O+"
        required
        testID="reg-blood"
      />
      <FormField
        label={t("emergencyContact")}
        value={form.emergency_contact}
        onChange={(v) => set("emergency_contact")(v.replace(/[^0-9]/g, ""))}
        keyboardType="phone-pad"
        maxLength={10}
        required
        testID="reg-emergency"
      />
      <FormField
        label={t("dob")}
        value={form.date_of_birth}
        onChange={set("date_of_birth")}
        placeholder="DD/MM/YYYY"
        required
        testID="reg-dob"
      />

      <Button
        label={t("registerBtn")}
        onPress={onSubmit}
        loading={loading}
        large
        testID="register-submit-button"
        style={{ marginTop: spacing.lg }}
        haptic="success"
      />
      <Pressable testID="go-login" onPress={() => router.back()} style={styles.linkWrap} hitSlop={12}>
        <Txt w="500" size={15} center color={colors.brandPrimary}>
          {t("haveAccount")}
        </Txt>
      </Pressable>
    </KeyboardAwareScrollView>
  );
}

const useStyles = makeStyles(() => ({
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  linkWrap: { paddingVertical: spacing.lg },
}));
