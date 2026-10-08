// Stepper counter (-/value/+) for small integer fields: sadhu/sadhviji
// bhagvant, mumukshu, wheelchair. Replaces a bare number TextInput.
import { Pressable, View } from "react-native";

import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

interface Props {
  label: string;
  value: string; // kept as a string to match the surrounding form state
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Format the displayed number, e.g. zero-padding minutes ("05"). */
  format?: (n: number) => string;
  testID?: string;
}

export function Counter({ label, value, onChange, min = 0, max = 99, step = 1, format, testID }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const n = parseInt(value, 10) || 0;

  const set = (next: number) => onChange(String(Math.max(min, Math.min(max, next))));

  return (
    <View style={styles.field}>
      <Txt w="500" size={15} color={colors.onSurfaceTertiary}>
        {label}
      </Txt>
      <View style={styles.row}>
        <Pressable
          testID={`${testID}-minus`}
          onPress={() => set(n - step)}
          disabled={n <= min}
          style={[styles.btn, n <= min && styles.btnDisabled]}
          hitSlop={8}
        >
          <Icon name="minus" size={18} color={n <= min ? colors.muted : colors.onSurface} />
        </Pressable>
        <Txt testID={testID} w="700" size={18} color={colors.onSurface} style={styles.value} center>
          {format ? format(n) : n}
        </Txt>
        <Pressable
          testID={`${testID}-plus`}
          onPress={() => set(n + step)}
          disabled={n >= max}
          style={[styles.btn, n >= max && styles.btnDisabled]}
          hitSlop={8}
        >
          <Icon name="plus" size={18} color={n >= max ? colors.muted : colors.onSurface} />
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  field: { gap: spacing.xs },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    height: 52,
  },
  btn: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  btnDisabled: { opacity: 0.4 },
  value: { flex: 1 },
}));
