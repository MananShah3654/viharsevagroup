import { useMemo, useState } from "react";
import { FlatList, Pressable, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";

import * as api from "@/src/core/api/endpoints";
import { useAuth } from "@/src/core/auth/auth-context";
import { useI18n } from "@/src/core/i18n";
import { ApiError, OfflineError } from "@/src/core/api/client";
import { qk } from "@/src/core/vihar/hooks";
import { Button } from "@/src/shared/widgets/Button";
import { Checkbox } from "@/src/shared/widgets/Checkbox";
import { Icon } from "@/src/shared/widgets/Icon";
import { EmptyView, LoadingView } from "@/src/shared/widgets/StateViews";
import { Txt } from "@/src/shared/widgets/Txt";
import { useConfirm } from "@/src/shared/widgets/Confirm";
import { useToast } from "@/src/shared/widgets/Toast";
import type { User } from "@/src/shared/models";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function UsersScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const confirm = useConfirm();
  const toast = useToast();
  const qc = useQueryClient();
  const { user: me } = useAuth();

  const users = useQuery({ queryKey: qk.users, queryFn: () => api.listUsers() });
  const [search, setSearch] = useState("");
  const [carOnly, setCarOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = users.data ?? [];
    if (carOnly) list = list.filter((u) => u.car);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((u) => (u.name || "").toLowerCase().includes(s) || (u.phone || "").includes(s));
    }
    return [...list].sort((a, b) => (a.name || a.phone).localeCompare(b.name || b.phone));
  }, [users.data, search, carOnly]);

  const onToggleRole = async (u: User) => {
    const makingAdmin = u.role !== "admin";
    const ok = await confirm({
      title: makingAdmin ? t("makeAdmin") : t("makeUser"),
      message: u.name || u.phone,
      confirmLabel: makingAdmin ? t("makeAdmin") : t("makeUser"),
      cancelLabel: t("cancel"),
    });
    if (!ok) return;
    try {
      await api.setUserRole(u.phone, makingAdmin ? "admin" : "user");
      qc.invalidateQueries({ queryKey: qk.users });
      toast.show(t("roleUpdated"), "success");
    } catch (e) {
      toast.show(e instanceof ApiError ? e.message : t("somethingWrong"), "error");
    }
  };

  const onDelete = async (u: User) => {
    const ok = await confirm({
      title: t("userDeleted"),
      message: t("confirmDeleteUser"),
      confirmLabel: t("remove"),
      cancelLabel: t("cancel"),
      danger: true,
    });
    if (!ok) return;
    try {
      await api.deleteUser(u.id);
      qc.invalidateQueries({ queryKey: qk.users });
      toast.show(t("userDeleted"), "success");
    } catch (e) {
      if (e instanceof OfflineError) toast.show(t("offline"), "error");
      else if (e instanceof ApiError) toast.show(e.message, "error");
      else toast.show(t("somethingWrong"), "error");
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="users-back" onPress={() => router.back()} hitSlop={12}>
          <Icon name="arrow-left" size={26} color={colors.onSurface} />
        </Pressable>
        <Txt w="700" size={fontSize.lg} color={colors.onSurface} style={styles.flex}>
          {t("manageUsers")}
        </Txt>
        <Pressable testID="users-add" onPress={() => router.push("/admin/users/new")} hitSlop={12}>
          <Icon name="account-plus" size={24} color={colors.brandPrimary} />
        </Pressable>
      </View>

      <View style={styles.filters}>
        <View style={styles.searchWrap}>
          <Icon name="magnify" size={20} color={colors.muted} />
          <TextInput
            testID="users-search"
            style={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder={t("searchUsers")}
            placeholderTextColor={colors.muted}
          />
        </View>
        <Checkbox label={t("filterByCar")} value={carOnly} onChange={setCarOnly} testID="users-car-filter" />
      </View>

      {users.isLoading ? (
        <LoadingView label={t("loading")} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={<EmptyView label={t("emptyVihars")} icon="account-search" />}
          renderItem={({ item }) => {
            const isSelf = !!me && item.id === me.id;
            return (
              <View style={styles.row} testID={`user-${item.id}`}>
                <Pressable
                  style={styles.rowMain}
                  onPress={() => router.push(`/admin/users/${item.id}`)}
                  testID={`user-edit-${item.id}`}
                >
                  {item.photo ? (
                    <Image source={{ uri: item.photo }} style={styles.avatarImg} contentFit="cover" />
                  ) : (
                    <View style={styles.avatar}>
                      <Txt w="700" size={16} color={colors.onBrandTertiary}>
                        {(item.name || item.phone || "?").charAt(0).toUpperCase()}
                      </Txt>
                    </View>
                  )}
                  <View style={styles.flex}>
                    <Txt w="500" size={fontSize.base} color={colors.onSurface}>
                      {item.name || item.phone}
                    </Txt>
                    <Txt size={13} color={colors.muted}>
                      {item.phone}
                      {item.area ? ` · ${item.area}` : ""}
                      {item.age ? ` · ${item.age}` : ""}
                      {item.car ? " · 🚗" : ""}
                      {item.role === "admin" ? ` · ${t("adminPanel")}` : ""}
                    </Txt>
                  </View>
                </Pressable>
                {/* Role toggle: promote any regular user; demote any admin
                    except the currently signed-in one (no self-demotion). */}
                {item.role === "user" || (item.role === "admin" && !isSelf) ? (
                  <Pressable testID={`user-role-${item.id}`} onPress={() => onToggleRole(item)} hitSlop={8} style={styles.iconBtn}>
                    <Icon name={item.role === "admin" ? "shield-off-outline" : "shield-account"} size={20} color={colors.brandPrimary} />
                  </Pressable>
                ) : null}
                {/* Delete only applies to regular users — admins can't be
                    deleted (backend blocks it; main hides the button too). */}
                {item.role === "user" ? (
                  <Pressable testID={`user-delete-${item.id}`} onPress={() => onDelete(item)} hitSlop={8} style={styles.iconBtn}>
                    <Icon name="delete-outline" size={20} color={colors.error} />
                  </Pressable>
                ) : null}
              </View>
            );
          }}
        />
      )}
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
  filters: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 50,
  },
  search: {
    flex: 1,
    fontSize: fontSize.base,
    fontFamily: "NotoSansGujarati-Regular",
    color: colors.onSurface,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  rowMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.md },
  iconBtn: { padding: spacing.xs },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
}));
