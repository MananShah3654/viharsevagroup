// Horizontal filter-chip row (sticky-header chrome). Single horizontal
// scroller, chips never wrap, selected changes color/border only.
import { ScrollView, Pressable } from "react-native";

import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { Txt } from "@/src/shared/widgets/Txt";

export interface ChipOption<T extends string> {
  key: T;
  label: string;
}

interface Props<T extends string> {
  options: ChipOption<T>[];
  value: T;
  onChange: (key: T) => void;
}

export function ChipRow<T extends string>({ options, value, onChange }: Props<T>) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.row}
      contentContainerStyle={styles.content}
    >
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            testID={`chip-${opt.key}`}
            onPress={() => onChange(opt.key)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.brandPrimary : colors.surfaceTertiary,
                borderColor: active ? colors.brandPrimary : colors.border,
              },
            ]}
          >
            <Txt
              w={active ? "700" : "500"}
              size={15}
              color={active ? colors.onBrandPrimary : colors.onSurfaceTertiary}
            >
              {opt.label}
            </Txt>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const useStyles = makeStyles(() => ({
  row: { maxHeight: 56 },
  content: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  chip: {
    flexShrink: 0,
    height: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
}));
