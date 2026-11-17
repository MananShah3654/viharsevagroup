// Short share link: /r/<first 8 characters of the vihar id>. Looks the vihar up
// in the list the app already loads and forwards to its detail screen.
import { View } from "react-native";
import { Redirect, useLocalSearchParams } from "expo-router";

import { useI18n } from "@/src/core/i18n";
import { useVihars } from "@/src/core/vihar/hooks";
import { ErrorView, LoadingView } from "@/src/shared/widgets/StateViews";
import { useTheme } from "@/src/theme";

export default function ShortViharLink() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const { t } = useI18n();
  const { colors } = useTheme();
  const q = useVihars();

  const wanted = String(code ?? "").toLowerCase();
  const vihar = wanted.length >= 6 ? q.data?.find((v) => v.id.toLowerCase().startsWith(wanted)) : undefined;

  if (vihar) return <Redirect href={`/vihar/${vihar.id}`} />;
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {q.isLoading ? (
        <LoadingView label={t("loading")} />
      ) : (
        <ErrorView label={t("errorFetch")} onRetry={() => q.refetch()} />
      )}
    </View>
  );
}
