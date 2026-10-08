import { useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { useI18n } from "@/src/core/i18n";
import * as api from "@/src/core/api/endpoints";
import { ApiError, OfflineError } from "@/src/core/api/client";
import { Button } from "@/src/shared/widgets/Button";
import { FormField } from "@/src/shared/widgets/FormField";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";
import { useToast } from "@/src/shared/widgets/Toast";
import { fontSize, makeStyles, spacing, useTheme } from "@/src/theme";

export default function ChangePasswordScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const toast = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({ old_password: "", new_password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v.replace(/[^0-9]/g, "") }));

  const onSubmit = async () => {
    if (!form.old_password || !form.new_password || !form.confirm_password) {
      toast.show(t("required"), "error");
      return;
    }
    if (!/^\d{4}$/.test(form.new_password)) {
      toast.show(t("passwordInvalid"), "error");
      return;
    }
    if (form.new_password !== form.confirm_password) {
      toast.show(t("passwordMismatch"), "error");
      return;
    }
    setLoading(true);
    try {
      await api.changePassword(form.old_password, form.new_password);
    } catch (e) {
      if (e instanceof OfflineError) toast.show(t("offline"), "error");
      else if (e instanceof ApiError) toast.show(e.message, "error");
      else toast.show(t("somethingWrong"), "error");
      setLoading(false);
      return;
    }
    setLoading(false);
    toast.show(t("passwordChanged"), "success");
    router.back();
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="change-password-back" onPress={() => router.back()} hitSlop={12}>
          <Icon name="close" size={26} color={colors.onSurface} />
        </Pressable>
        <Txt w="700" size={fontSize.lg} color={colors.onSurface} style={styles.flex}>
          {t("changePassword")}
        </Txt>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
      >
        <FormField
          label={t("oldPassword")}
          value={form.old_password}
          onChange={set("old_password")}
          keyboardType="number-pad"
          secure
          maxLength={4}
          placeholder="••••"
          required
          testID="change-pw-old"
        />
        <FormField
          label={t("newPassword")}
          value={form.new_password}
          onChange={set("new_password")}
          keyboardType="number-pad"
          secure
          maxLength={4}
          placeholder="••••"
          required
          testID="change-pw-new"
        />
        <FormField
          label={t("confirmPassword")}
          value={form.confirm_password}
          onChange={set("confirm_password")}
          keyboardType="number-pad"
          secure
          maxLength={4}
          placeholder="••••"
          required
          testID="change-pw-confirm"
        />

        <Button
          label={t("save")}
          onPress={onSubmit}
          loading={loading}
          large
          testID="change-pw-submit"
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
}));
