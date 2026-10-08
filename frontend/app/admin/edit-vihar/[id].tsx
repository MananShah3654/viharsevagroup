import { Pressable, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { useI18n } from "@/src/core/i18n";
import { useVihar } from "@/src/core/vihar/hooks";
import { Icon } from "@/src/shared/widgets/Icon";
import { LoadingView, ErrorView } from "@/src/shared/widgets/StateViews";
import { Txt } from "@/src/shared/widgets/Txt";
import { ViharForm } from "@/src/shared/vihar-form/ViharForm";
import { fontSize, makeStyles, spacing, useTheme } from "@/src/theme";

export default function EditViharScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const q = useVihar(id!);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="edit-vihar-back" onPress={() => router.back()} hitSlop={12}>
          <Icon name="close" size={26} color={colors.onSurface} />
        </Pressable>
        <Txt w="700" size={fontSize.lg} color={colors.onSurface} style={styles.flex}>
          {t("editVihar")}
        </Txt>
      </View>

      {q.isLoading ? (
        <LoadingView label={t("loading")} />
      ) : q.isError || !q.data ? (
        <ErrorView label={t("errorFetch")} onRetry={() => q.refetch()} />
      ) : (
        <KeyboardAwareScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
          bottomOffset={24}
          keyboardShouldPersistTaps="handled"
        >
          <ViharForm initialVihar={q.data} />
        </KeyboardAwareScrollView>
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
  content: { padding: spacing.lg, gap: spacing.md },
}));
