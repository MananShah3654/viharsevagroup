import { useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";

import { useAuth } from "@/src/core/auth/auth-context";
import { useI18n } from "@/src/core/i18n";
import * as api from "@/src/core/api/endpoints";
import { ApiError, OfflineError } from "@/src/core/api/client";
import { validateMandatoryUserFields } from "@/src/core/validation/mandatoryFields";
import { Button } from "@/src/shared/widgets/Button";
import { Checkbox } from "@/src/shared/widgets/Checkbox";
import { FormField } from "@/src/shared/widgets/FormField";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";
import { useToast } from "@/src/shared/widgets/Toast";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export default function EditProfileScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const { user, setUser } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    photo: user?.photo ?? "",
    age: user?.age != null ? String(user.age) : "",
    area: user?.area ?? "",
    address: user?.address ?? "",
    blood_group: user?.blood_group ?? "",
    emergency_contact: user?.emergency_contact ?? "",
    date_of_birth: user?.date_of_birth ?? "",
    car: !!user?.car,
  });
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (v: any) => setForm((f) => ({ ...f, [k]: v }));

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.show(t("somethingWrong"), "error");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.7,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > MAX_PHOTO_BYTES) {
      toast.show(t("photoTooLarge"), "error");
      return;
    }
    const mime = asset.mimeType ?? "image/jpeg";
    set("photo")(`data:${mime};base64,${asset.base64}`);
  };

  const onSubmit = async () => {
    const error = validateMandatoryUserFields(
      { ...form, phone: user?.phone ?? "" },
      { requireArea: false },
      t,
    );
    if (error) {
      toast.show(error, "error");
      return;
    }
    setLoading(true);
    try {
      const updated = await api.updateMe({
        name: form.name,
        photo: form.photo || undefined,
        age: form.age ? parseInt(form.age, 10) : undefined,
        area: form.area,
        address: form.address,
        blood_group: form.blood_group,
        emergency_contact: form.emergency_contact,
        date_of_birth: form.date_of_birth,
        car: form.car,
      });
      setUser(updated);
    } catch (e) {
      if (e instanceof OfflineError) toast.show(t("offline"), "error");
      else if (e instanceof ApiError) toast.show(e.message, "error");
      else toast.show(t("somethingWrong"), "error");
      setLoading(false);
      return;
    }
    setLoading(false);
    toast.show(t("profileUpdated"), "success");
    router.back();
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="edit-profile-back" onPress={() => router.back()} hitSlop={12}>
          <Icon name="close" size={26} color={colors.onSurface} />
        </Pressable>
        <Txt w="700" size={fontSize.lg} color={colors.onSurface} style={styles.flex}>
          {t("editProfile")}
        </Txt>
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable testID="edit-profile-photo" onPress={pickPhoto} style={styles.photoWrap}>
          {form.photo ? (
            <Image source={{ uri: form.photo }} style={styles.photo} contentFit="cover" />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Icon name="camera-plus" size={28} color={colors.muted} />
            </View>
          )}
          <Txt w="500" size={14} color={colors.brandPrimary} style={styles.photoLabel}>
            {t("photo")}
          </Txt>
        </Pressable>
        {form.photo ? (
          <Pressable testID="edit-profile-photo-remove" onPress={() => set("photo")("")} hitSlop={8}>
            <Txt w="500" size={13} center color={colors.error}>
              {t("removePhoto")}
            </Txt>
          </Pressable>
        ) : null}

        <FormField label={t("name")} value={form.name} onChange={set("name")} testID="edit-name" />
        <FormField
          label={t("age")}
          value={form.age}
          onChange={set("age")}
          keyboardType="number-pad"
          testID="edit-age"
        />
        <FormField label={t("area")} value={form.area} onChange={set("area")} testID="edit-area" />
        <FormField
          label={t("address")}
          value={form.address}
          onChange={set("address")}
          multiline
          testID="edit-address"
        />
        <FormField
          label={t("bloodGroup")}
          value={form.blood_group}
          onChange={set("blood_group")}
          placeholder="O+"
          required
          testID="edit-blood"
        />
        <FormField
          label={t("emergencyContact")}
          value={form.emergency_contact}
          onChange={(v) => set("emergency_contact")(v.replace(/[^0-9]/g, ""))}
          keyboardType="phone-pad"
          maxLength={10}
          required
          testID="edit-emergency"
        />
        <FormField
          label={t("dob")}
          value={form.date_of_birth}
          onChange={set("date_of_birth")}
          placeholder="DD/MM/YYYY"
          required
          testID="edit-dob"
        />
        <Checkbox label={t("car")} value={form.car} onChange={set("car")} testID="edit-car" />

        <Button
          label={t("save")}
          onPress={onSubmit}
          loading={loading}
          large
          testID="edit-profile-submit"
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
  photoWrap: { alignItems: "center", gap: spacing.xs },
  photo: { width: 88, height: 88, borderRadius: radius.pill },
  photoPlaceholder: {
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  photoLabel: { marginTop: spacing.xs },
}));
