// Labeled checkbox row. RN has no built-in checkbox; used for boolean vihar
// flags (self/luggage/dori/car_required/activa), User.car, etc.
import { Pressable, View } from "react-native";

import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";
import { makeStyles, spacing, useTheme } from "@/src/theme";

interface Props {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  testID?: string;
}

export function Checkbox({ label, value, onChange, testID }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      style={styles.row}
      onPress={() => onChange(!value)}
      hitSlop={8}
    >
      <Icon
        name={value ? "checkbox-marked" : "checkbox-blank-outline"}
        size={22}
        color={value ? colors.brandPrimary : colors.borderStrong}
      />
      <Txt w="500" size={15} color={colors.onSurface}>
        {label}
      </Txt>
    </Pressable>
  );
}

const useStyles = makeStyles(() => ({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xs },
}));
