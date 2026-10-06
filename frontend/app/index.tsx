import { Redirect } from "expo-router";
import { View } from "react-native";

import { useAuth } from "@/src/core/auth/auth-context";
import { useI18n } from "@/src/core/i18n";
import { LoadingView } from "@/src/shared/widgets/StateViews";
import { useTheme } from "@/src/theme";

export default function Index() {
  const { token, loading } = useAuth();
  const { t } = useI18n();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <LoadingView label={t("loading")} />
      </View>
    );
  }
  return <Redirect href={token ? "/(tabs)" : "/login"} />;
}
