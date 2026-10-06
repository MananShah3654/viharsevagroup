// Primary / secondary / outline buttons with press feedback + haptics.
// Large (56pt) touch target for the older demographic.

import * as Haptics from "expo-haptics";
import { ActivityIndicator, Platform, Pressable, ViewStyle } from "react-native";

import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";

type Variant = "primary" | "secondary" | "outline" | "danger";

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Icon>["name"];
  haptic?: Haptics.ImpactFeedbackStyle | "success";
  testID?: string;
  style?: ViewStyle;
  large?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  icon,
  haptic,
  testID,
  style,
  large,
}: Props) {
  const styles = useStyles();
  const { colors } = useTheme();

  const bg: Record<Variant, string> = {
    primary: colors.brandPrimary,
    secondary: colors.surfaceTertiary,
    outline: "transparent",
    danger: colors.error,
  };
  const fg: Record<Variant, string> = {
    primary: colors.onBrandPrimary,
    secondary: colors.onSurfaceTertiary,
    outline: colors.brandPrimary,
    danger: colors.onError,
  };

  const handle = () => {
    if (disabled || loading) return;
    if (Platform.OS !== "web" && haptic) {
      if (haptic === "success") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.impactAsync(haptic);
      }
    }
    onPress();
  };

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={handle}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        large && styles.large,
        {
          backgroundColor: bg[variant],
          borderColor: variant === "outline" ? colors.brandPrimary : "transparent",
          borderWidth: variant === "outline" ? 1.5 : 0,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg[variant]} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={22} color={fg[variant]} /> : null}
          <Txt w="700" size={large ? 18 : 16} color={fg[variant]}>
            {label}
          </Txt>
        </>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  large: {
    minHeight: 60,
    borderRadius: radius.lg,
  },
}));
