import { useEffect, useMemo, useState } from "react";
import { FlatList, Modal, Pressable, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "@/src/core/api/endpoints";
import { PUSH_API, STORAGE_KEYS } from "@/src/core/config";
import { useI18n } from "@/src/core/i18n";
import { qk, useVihar } from "@/src/core/vihar/hooks";
import { formatDateLong, formatTime } from "@/src/core/vihar/utils";
import { shareAnnouncement } from "@/src/core/share/whatsapp";
import { storage } from "@/src/utils/storage";
import { Button } from "@/src/shared/widgets/Button";
import { Icon } from "@/src/shared/widgets/Icon";
import { EmptyView, LoadingView } from "@/src/shared/widgets/StateViews";
import { Txt } from "@/src/shared/widgets/Txt";
import { useConfirm } from "@/src/shared/widgets/Confirm";
import { useToast } from "@/src/shared/widgets/Toast";
import type { Participation, User } from "@/src/shared/models";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function ParticipantsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const styles = useStyles();
  const { colors } = useTheme();
  const { t, lang } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const confirm = useConfirm();
  const toast = useToast();
  const qc = useQueryClient();

  const vihar = useVihar(id!);
  const participants = useQuery({
    queryKey: qk.participants(id!),
    queryFn: () => api.getParticipants(id!),
    enabled: !!id,
  });

  const [addOpen, setAddOpen] = useState(false);
  const [attendance, setAttendance] = useState<string[]>([]);
  const attKey = STORAGE_KEYS.attendancePrefix + id;

  useEffect(() => {
    storage.getItem<string[]>(attKey, []).then((v) => setAttendance(v ?? []));
  }, [attKey]);

  const optedIn = useMemo(
    () => (participants.data?.participants ?? []).filter((p) => p.status === "in"),
    [participants.data],
  );

  const toggleAttendance = (userId: string) => {
    setAttendance((prev) => {
      const next = prev.includes(userId) ? prev.filter((x) => x !== userId) : [...prev, userId];
      storage.setItem(attKey, next);
      return next;
    });
  };

  const onRemove = async (p: Participation) => {
    const ok = await confirm({
      title: t("remove"),
      message: p.user?.name || p.user?.phone,
      confirmLabel: t("remove"),
      cancelLabel: t("cancel"),
      danger: true,
    });
    if (!ok) return;
    try {
      await api.removeParticipant(id!, p.participation_id || p.id!);
      qc.invalidateQueries({ queryKey: qk.participants(id!) });
      qc.invalidateQueries({ queryKey: qk.vihar(id!) });
      toast.show(t("done"), "success");
    } catch {
      toast.show(t("somethingWrong"), "error");
    }
  };

  const sendReminder = async () => {
    const recipients = optedIn.map((p) => p.user_id);
    if (recipients.length === 0) {
      toast.show(t("emptyVihars"), "info");
      return;
    }
    const v = vihar.data;
    try {
      await fetch(`${PUSH_API}/push/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients,
          title: "🙏 વિહાર સેવા",
          message: v ? `${formatDateLong(v)} · ${formatTime(v, "gu")}\n${v.from_upashray} → ${v.to_upashray}` : "",
          vihar_id: id,
        }),
      });
      toast.show(t("done"), "success");
    } catch {
      toast.show(t("somethingWrong"), "error");
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="participants-back" onPress={() => router.back()} hitSlop={12}>
          <Icon name="arrow-left" size={26} color={colors.onSurface} />
        </Pressable>
        <Txt w="700" size={fontSize.lg} color={colors.onSurface} style={styles.flex} numberOfLines={1}>
          {t("viewParticipants")}
        </Txt>
        <Pressable testID="participants-share" onPress={() => vihar.data && shareAnnouncement(vihar.data, lang)} hitSlop={12}>
          <Icon name="whatsapp" size={24} color={colors.success} />
        </Pressable>
      </View>

      {participants.isLoading ? (
        <LoadingView label={t("loading")} />
      ) : (
        <FlatList
          data={participants.data?.participants ?? []}
          keyExtractor={(p) => p.participation_id || p.id || p.user_id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 150 }]}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListHeaderComponent={
            <View style={styles.summary}>
              <Txt w="700" size={fontSize.base} color={colors.onSurface}>
                {participants.data?.opted_in ?? 0} {t("joined")}
              </Txt>
              <Txt size={fontSize.sm} color={colors.muted}>
                {t("attendanceLocalNote")}
              </Txt>
            </View>
          }
          ListEmptyComponent={<EmptyView label={t("emptyVihars")} icon="account-multiple" />}
          renderItem={({ item }) => {
            const present = attendance.includes(item.user_id);
            const inList = item.status === "in";
            return (
              <View style={styles.pRow} testID={`participant-${item.user_id}`}>
                <Pressable
                  testID={`attendance-${item.user_id}`}
                  onPress={() => toggleAttendance(item.user_id)}
                  style={[styles.check, { backgroundColor: present ? colors.success : colors.surfaceTertiary, borderColor: present ? colors.success : colors.border }]}
                >
                  <Icon name={present ? "check" : "circle-outline"} size={18} color={present ? colors.onSuccess : colors.muted} />
                </Pressable>
                <View style={styles.flex}>
                  <Txt w="500" size={fontSize.base} color={colors.onSurface}>
                    {item.user?.name || item.user?.phone || "—"}
                  </Txt>
                  <Txt size={13} color={inList ? colors.success : colors.muted}>
                    {inList ? t("youJoined") : "out"} {present ? `· ${t("present")}` : ""}
                  </Txt>
                </View>
                <Pressable testID={`remove-${item.user_id}`} onPress={() => onRemove(item)} hitSlop={8}>
                  <Icon name="delete-outline" size={22} color={colors.error} />
                </Pressable>
              </View>
            );
          }}
        />
      )}

      {/* Bottom actions */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Button label={t("addParticipant")} icon="account-plus" variant="secondary" onPress={() => setAddOpen(true)} testID="open-add" style={{ flex: 1 }} />
        <Button label={t("sendReminder")} icon="bell-ring" onPress={sendReminder} testID="send-reminder" style={{ flex: 1 }} />
      </View>

      <AddParticipantModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        viharId={id!}
        existing={(participants.data?.participants ?? []).map((p) => p.user_id)}
        onAdded={() => {
          qc.invalidateQueries({ queryKey: qk.participants(id!) });
          qc.invalidateQueries({ queryKey: qk.vihar(id!) });
        }}
      />
    </View>
  );
}

function AddParticipantModal({
  visible,
  onClose,
  viharId,
  existing,
  onAdded,
}: {
  visible: boolean;
  onClose: () => void;
  viharId: string;
  existing: string[];
  onAdded: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const users = useQuery({ queryKey: qk.users, queryFn: () => api.listUsers(), enabled: visible });

  const filtered = useMemo(() => {
    const all = (users.data ?? []).filter((u) => !existing.includes(u.id));
    if (!search.trim()) return all;
    const s = search.toLowerCase();
    return all.filter((u) => (u.name || "").toLowerCase().includes(s) || (u.phone || "").includes(s));
  }, [users.data, existing, search]);

  const add = async (u: User) => {
    setBusy(u.id);
    try {
      await api.assignUsers(viharId, [u.id], "in");
      onAdded();
      toast.show(t("done"), "success");
    } catch {
      toast.show(t("somethingWrong"), "error");
    }
    setBusy(null);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <View style={[styles.modalScreen, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.modalHeader}>
          <Txt w="700" size={fontSize.lg} color={colors.onSurface} style={styles.flex}>
            {t("addParticipant")}
          </Txt>
          <Pressable testID="add-close" onPress={onClose} hitSlop={12}>
            <Icon name="close" size={26} color={colors.onSurface} />
          </Pressable>
        </View>
        <View style={styles.searchWrap}>
          <Icon name="magnify" size={20} color={colors.muted} />
          <TextInput
            testID="user-search"
            style={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder={t("name")}
            placeholderTextColor={colors.muted}
          />
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
            renderItem={({ item }) => (
              <Pressable testID={`add-user-${item.id}`} onPress={() => add(item)} style={styles.userRow}>
                <View style={styles.userAvatar}>
                  <Txt w="700" size={16} color={colors.onBrandTertiary}>
                    {(item.name || item.phone || "?").charAt(0).toUpperCase()}
                  </Txt>
                </View>
                <View style={styles.flex}>
                  <Txt w="500" size={fontSize.base} color={colors.onSurface}>
                    {item.name || item.phone}
                  </Txt>
                  <Txt size={13} color={colors.muted}>
                    {item.phone}
                    {item.area ? ` · ${item.area}` : ""}
                  </Txt>
                </View>
                <Icon name={busy === item.id ? "loading" : "plus-circle"} size={24} color={colors.brandPrimary} />
              </Pressable>
            )}
          />
        )}
      </View>
    </Modal>
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
  list: { padding: spacing.lg },
  summary: { marginBottom: spacing.md, gap: spacing.xs },
  pRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  check: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  modalScreen: { flex: 1, backgroundColor: colors.surface },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
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
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
}));
