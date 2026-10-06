// Thin offline banner shown under headers when connectivity is lost.
import { View } from "react-native";

import { makeStyles, spacing, useTheme } from "@/src/theme";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";

export function OfflineBanner({ label }: { label: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.wrap} testID="offline-banner">
      <Icon name="wifi-off" size={16} color={colors.onWarning} />
      <Txt w="500" size={13} color={colors.onWarning} style={styles.txt}>
        {label}
      </Txt>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.warning,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  txt: { flex: 1 },
}));
