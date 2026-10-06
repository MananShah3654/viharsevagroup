// Loading / Empty / Error state views, consistent across screens.
import { ActivityIndicator, View } from "react-native";

import { makeStyles, spacing, useTheme } from "@/src/theme";
import { Button } from "@/src/shared/widgets/Button";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";

export function LoadingView({ label }: { label: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.center} testID="loading-view">
      <ActivityIndicator size="large" color={colors.brandPrimary} />
      <Txt size={16} color={colors.muted} style={styles.gap}>
        {label}
      </Txt>
    </View>
  );
}

export function EmptyView({
  label,
  icon = "walk",
  action,
}: {
  label: string;
  icon?: React.ComponentProps<typeof Icon>["name"];
  action?: React.ReactNode;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.center} testID="empty-view">
      <Icon name={icon} size={56} color={colors.borderStrong} />
      <Txt size={16} color={colors.muted} center style={styles.gap}>
        {label}
      </Txt>
      {action}
    </View>
  );
}

export function ErrorView({ label, onRetry }: { label: string; onRetry: () => void }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.center} testID="error-view">
      <Icon name="alert-circle-outline" size={56} color={colors.error} />
      <Txt size={16} color={colors.onSurface} center style={styles.gap}>
        {label}
      </Txt>
      <Button label={"ફરી પ્રયાસ કરો"} onPress={onRetry} icon="refresh" testID="error-retry" />
    </View>
  );
}

const useStyles = makeStyles(() => ({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  gap: { marginTop: spacing.xs },
}));
