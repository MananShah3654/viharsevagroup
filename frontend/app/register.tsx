import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { useAuth } from "@/src/core/auth/auth-context";
import { useI18n } from "@/src/core/i18n";
import { ApiError, OfflineError } from "@/src/core/api/client";
import { Button } from "@/src/shared/widgets/Button";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";
import { useToast } from "@/src/shared/widgets/Toast";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: "default" | "phone-pad" | "number-pad";
  secure?: boolean;
  maxLength?: number;
  placeholder?: string;
  testID: string;
}

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
    name: "",
    area: "",
    blood_group: "",
    emergency_contact: "",
    date_of_birth: "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async () => {
    if (form.phone.length < 10 || form.password.length !== 4 || !form.name.trim()) {
      toast.show(t("required"), "error");
      return;
    }
    setLoading(true);
    try {
      await signUp(form);
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

  const Field = ({
    label,
    value,
    onChange,
    keyboardType = "default",
    secure,
    maxLength,
    placeholder,
    testID,
  }: FieldProps) => (
    <View style={styles.field}>
      <Txt w="500" size={15} color={colors.onSurfaceTertiary}>
        {label}
      </Txt>
      <TextInput
        testID={testID}
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        secureTextEntry={secure}
        maxLength={maxLength}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
      />
    </View>
  );

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

      <Field label={t("name")} value={form.name} onChange={set("name")} testID="reg-name" />
      <Field
        label={t("phone")}
        value={form.phone}
        onChange={(v) => set("phone")(v.replace(/[^0-9]/g, ""))}
        keyboardType="phone-pad"
        maxLength={10}
        placeholder="9876543210"
        testID="reg-phone"
      />
      <Field
        label={t("password")}
        value={form.password}
        onChange={(v) => set("password")(v.replace(/[^0-9]/g, ""))}
        keyboardType="number-pad"
        secure
        maxLength={4}
        placeholder="••••"
        testID="reg-password"
      />
      <Field label={t("area")} value={form.area} onChange={set("area")} testID="reg-area" />
      <Field
        label={t("bloodGroup")}
        value={form.blood_group}
        onChange={set("blood_group")}
        placeholder="O+"
        testID="reg-blood"
      />
      <Field
        label={t("emergencyContact")}
        value={form.emergency_contact}
        onChange={(v) => set("emergency_contact")(v.replace(/[^0-9]/g, ""))}
        keyboardType="phone-pad"
        maxLength={10}
        testID="reg-emergency"
      />
      <Field
        label={t("dob")}
        value={form.date_of_birth}
        onChange={set("date_of_birth")}
        placeholder="DD/MM/YYYY"
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

const useStyles = makeStyles((colors) => ({
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
  field: { gap: spacing.xs },
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
  linkWrap: { paddingVertical: spacing.lg },
}));
