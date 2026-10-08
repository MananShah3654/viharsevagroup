// Web variant: a real browser date-picker via <input type="date">. The
// native `@react-native-community/datetimepicker` module ships no web build,
// so this file (picked automatically by the bundler for web, same pattern as
// src/utils/storage/index.web.ts) renders a plain DOM input instead.
import { View } from "react-native";

import { parseViharDate } from "@/src/core/vihar/utils";
import { Txt } from "@/src/shared/widgets/Txt";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toDDMMYY(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = String(date.getFullYear()).slice(-2);
  return `${d}/${m}/${y}`;
}

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  testID?: string;
}

export function DateField({ label, value, onChange, required, testID }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const parsed = parseViharDate(value);

  return (
    <View style={styles.field}>
      <Txt w="500" size={15} color={colors.onSurfaceTertiary}>
        {label}
        {required ? <Txt color={colors.error}> *</Txt> : null}
      </Txt>
      {/* Intentional raw DOM element: react-native-web renders to the DOM on
          web, so a plain <input> works fine here and gives us the browser's
          native calendar picker for free. */}
      <input
        data-testid={testID}
        type="date"
        value={parsed ? toISO(parsed) : ""}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) {
            onChange("");
            return;
          }
          const [y, m, d] = v.split("-").map((p) => parseInt(p, 10));
          onChange(toDDMMYY(new Date(y, m - 1, d)));
        }}
        style={{
          backgroundColor: colors.surfaceTertiary,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.md,
          paddingLeft: spacing.md,
          paddingRight: spacing.md,
          minHeight: 52,
          fontSize: fontSize.base,
          fontFamily: "NotoSansGujarati-Regular",
          color: colors.onSurface,
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    </View>
  );
}

const useStyles = makeStyles(() => ({
  field: { gap: spacing.xs },
}));
