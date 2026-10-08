import { useState } from "react";
import { Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

import * as api from "@/src/core/api/endpoints";
import { useI18n } from "@/src/core/i18n";
import { ApiError, OfflineError } from "@/src/core/api/client";
import { qk } from "@/src/core/vihar/hooks";
import { validateMandatoryUserFields } from "@/src/core/validation/mandatoryFields";
import { Button } from "@/src/shared/widgets/Button";
import { Checkbox } from "@/src/shared/widgets/Checkbox";
import { FormField } from "@/src/shared/widgets/FormField";
import { Icon } from "@/src/shared/widgets/Icon";
import { LoadingView } from "@/src/shared/widgets/StateViews";
import { Txt } from "@/src/shared/widgets/Txt";
import { useToast } from "@/src/shared/widgets/Toast";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export default function AdminUserFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const qc = useQueryClient();

  const users = useQuery({ queryKey: qk.users, queryFn: () => api.listUsers(), enabled: !isNew });
  const existing = isNew ? undefined : users.data?.find((u) => u.id === id);

  const [form, setForm] = useState({
    phone: existing?.phone ?? "",
    name: existing?.name ?? "",
    password: "",
    confirm_password: "",
    area: existing?.area ?? "",
    blood_group: existing?.blood_group ?? "",
    emergency_contact: existing?.emergency_contact ?? "",
    date_of_birth: existing?.date_of_birth ?? "",
    age: existing?.age != null ? String(existing.age) : "",
    address: existing?.address ?? "",
    car: !!existing?.car,
    photo: existing?.photo ?? "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (v: any) => setForm((f) => ({ ...f, [k]: v }));

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], base64: true, quality: 0.7 });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_PHOTO_BYTES) {
      toast.show(t("photoTooLarge"), "error");
      return;
    }
    set("photo")(`data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`);
  };

  const onSubmit = async () => {
    const error = validateMandatoryUserFields(
      form,
      { requireArea: true, requirePassword: isNew, requireConfirm: isNew },
      t,
    );
    if (error) {
      toast.show(error, "error");
      return;
    }
    // Editing: password is optional, but if the admin typed one at all it
    // must still be valid and confirmed — main's "change password" section
    // enforces this live; we check it here since it's not covered by
    // requirePassword/requireConfirm above (those only apply to new users).
    if (!isNew && form.password) {
      if (!/^\d{4}$/.test(form.password)) {
        toast.show(t("passwordInvalid"), "error");
        return;
      }
      if (form.password !== form.confirm_password) {
        toast.show(t("passwordMismatch"), "error");
        return;
      }
    }
    setLoading(true);
    try {
      const payload = {
        phone: form.phone,
        name: form.name,
        area: form.area,
        blood_group: form.blood_group,
        emergency_contact: form.emergency_contact,
        date_of_birth: form.date_of_birth,
        age: form.age ? parseInt(form.age, 10) : undefined,
        address: form.address,
        car: form.car,
        photo: form.photo || undefined,
        ...(form.password ? { password: form.password } : {}),
      };
      if (isNew) {
        await api.createUser(payload as api.AdminUserPayload);
      } else {
        await api.updateUser(id!, payload);
      }
      qc.invalidateQueries({ queryKey: qk.users });
    } catch (e) {
      if (e instanceof OfflineError) toast.show(t("offline"), "error");
      else if (e instanceof ApiError) toast.show(e.message, "error");
      else toast.show(t("somethingWrong"), "error");
      setLoading(false);
      return;
    }
    setLoading(false);
    toast.show(isNew ? t("userCreated") : t("userUpdated"), "success");
    router.back();
  };

  if (!isNew && users.isLoading) {
    return <LoadingView label={t("loading")} />;
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="user-form-back" onPress={() => router.back()} hitSlop={12}>
          <Icon name="close" size={26} color={colors.onSurface} />
        </Pressable>
        <Txt w="700" size={fontSize.lg} color={colors.onSurface} style={styles.flex}>
          {isNew ? t("addUser") : t("editUser")}
        </Txt>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable testID="user-form-photo" onPress={pickPhoto} style={styles.photoWrap}>
          {form.photo ? (
            <Image source={{ uri: form.photo }} style={styles.photo} contentFit="cover" />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Icon name="camera-plus" size={28} color={colors.muted} />
            </View>
          )}
        </Pressable>

        <FormField label={t("name")} value={form.name} onChange={set("name")} required testID="user-form-name" />
        <FormField
          label={t("phone")}
          value={form.phone}
          onChange={(v) => set("phone")(v.replace(/[^0-9]/g, ""))}
          keyboardType="phone-pad"
          maxLength={10}
          required
          editable={isNew}
          testID="user-form-phone"
        />
        <FormField
          label={isNew ? t("password") : t("newPassword")}
          value={form.password}
          onChange={(v) => set("password")(v.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          secure
          maxLength={4}
          placeholder="••••"
          required={isNew}
          testID="user-form-password"
        />
        <FormField
          label={t("confirmPassword")}
          value={form.confirm_password}
          onChange={(v) => set("confirm_password")(v.replace(/[^0-9]/g, ""))}
          keyboardType="number-pad"
          secure
          maxLength={4}
          placeholder="••••"
          required={isNew}
          testID="user-form-confirm-password"
        />
        <FormField label={t("area")} value={form.area} onChange={set("area")} required testID="user-form-area" />
        <FormField
          label={t("bloodGroup")}
          value={form.blood_group}
          onChange={set("blood_group")}
          placeholder="O+"
          required
          testID="user-form-blood"
        />
        <FormField
          label={t("emergencyContact")}
          value={form.emergency_contact}
          onChange={(v) => set("emergency_contact")(v.replace(/[^0-9]/g, ""))}
          keyboardType="phone-pad"
          maxLength={10}
          required
          testID="user-form-emergency"
        />
        <FormField
          label={t("dob")}
          value={form.date_of_birth}
          onChange={set("date_of_birth")}
          placeholder="DD/MM/YYYY"
          required
          testID="user-form-dob"
        />
        <FormField
          label={t("age")}
          value={form.age}
          onChange={set("age")}
          keyboardType="number-pad"
          testID="user-form-age"
        />
        <FormField
          label={t("address")}
          value={form.address}
          onChange={set("address")}
          multiline
          testID="user-form-address"
        />
        <Checkbox label={t("car")} value={form.car} onChange={set("car")} testID="user-form-car" />

        <Button
          label={t("save")}
          onPress={onSubmit}
          loading={loading}
          large
          testID="user-form-submit"
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
  photoWrap: { alignItems: "center" },
  photo: { width: 80, height: 80, borderRadius: radius.pill },
  photoPlaceholder: {
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
}));
