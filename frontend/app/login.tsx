import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { LinearGradient } from "expo-linear-gradient";

import { useAuth } from "@/src/core/auth/auth-context";
import { useI18n } from "@/src/core/i18n";
import { ApiError, OfflineError } from "@/src/core/api/client";
import { Button } from "@/src/shared/widgets/Button";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";
import { useToast } from "@/src/shared/widgets/Toast";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function LoginScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { signIn } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (phone.trim().length < 10 || password.length < 4) {
      toast.show(t("required"), "error");
      return;
    }
    setLoading(true);
    try {
      await signIn(phone.trim(), password);
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
      contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.xxl }]}
      bottomOffset={24}
      keyboardShouldPersistTaps="handled"
    >
      <LinearGradient
        colors={[colors.brandPrimary, colors.brandSecondary]}
        style={styles.logo}
      >
        <Icon name="hands-pray" size={44} color={colors.onBrandPrimary} />
      </LinearGradient>

      <Txt w="700" size={fontSize.xxl} center color={colors.onSurface} style={styles.title}>
        {t("appName")}
      </Txt>
      <Txt size={fontSize.base} center color={colors.muted} style={styles.subtitle}>
        {t("welcome")}
      </Txt>

      <View style={styles.form}>
        <Txt w="500" size={15} color={colors.onSurfaceTertiary}>
          {t("phone")}
        </Txt>
        <TextInput
          testID="login-phone-input"
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="9876543210"
          placeholderTextColor={colors.muted}
          maxLength={10}
        />

        <Txt w="500" size={15} color={colors.onSurfaceTertiary} style={styles.label}>
          {t("password")}
        </Txt>
        <TextInput
          testID="login-password-input"
          style={styles.input}
          value={password}
          onChangeText={(v) => setPassword(v.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          secureTextEntry
          placeholder="••••"
          placeholderTextColor={colors.muted}
          maxLength={4}
        />

        <Button
          label={t("loginBtn")}
          onPress={onSubmit}
          loading={loading}
          large
          testID="login-submit-button"
          style={{ marginTop: spacing.lg }}
          haptic="success"
        />

        <Pressable
          testID="go-register"
          onPress={() => router.push("/register")}
          style={styles.linkWrap}
          hitSlop={12}
        >
          <Txt w="500" size={15} center color={colors.brandPrimary}>
            {t("noAccount")}
          </Txt>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: "center",
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.xl },
  form: { width: "100%", gap: spacing.xs },
  label: { marginTop: spacing.md },
  input: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 54,
    fontSize: fontSize.lg,
    fontFamily: "NotoSansGujarati-Regular",
    color: colors.onSurface,
  },
  linkWrap: { paddingVertical: spacing.lg },
}));
