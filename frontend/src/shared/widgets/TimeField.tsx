// Hour/minute counters + AM/PM toggle. Stores the same 24-hour "H:mm" string
// the rest of the app already uses (vihar_time), so formatTime/parseViharDate
// keep working unchanged — only the editing UI changes.
import { View } from "react-native";

import { ChipRow } from "@/src/shared/widgets/ChipRow";
import { Counter } from "@/src/shared/widgets/Counter";
import { Txt } from "@/src/shared/widgets/Txt";
import { makeStyles, spacing, useTheme } from "@/src/theme";

type Period = "AM" | "PM";

function parse(value: string): { hour12: number; minute: number; period: Period } {
  const [hStr, mStr] = (value || "").split(":");
  const hour24 = parseInt(hStr, 10);
  const minute = parseInt(mStr, 10);
  if (isNaN(hour24)) return { hour12: 5, minute: isNaN(minute) ? 30 : minute, period: "AM" };
  const period: Period = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour12, minute: isNaN(minute) ? 0 : minute, period };
}

function compose(hour12: number, minute: number, period: Period): string {
  let hour24 = hour12 % 12;
  if (period === "PM") hour24 += 12;
  return `${hour24}:${String(minute).padStart(2, "0")}`;
}

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  testID?: string;
}

export function TimeField({ label, value, onChange, required, testID }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { hour12, minute, period } = parse(value);

  return (
    <View style={styles.field}>
      <Txt w="500" size={15} color={colors.onSurfaceTertiary}>
        {label}
        {required ? <Txt color={colors.error}> *</Txt> : null}
      </Txt>
      <View style={styles.row}>
        <View style={styles.counterWrap}>
          <Counter
            label=""
            value={String(hour12)}
            onChange={(v) => onChange(compose(parseInt(v, 10), minute, period))}
            min={1}
            max={12}
            testID={`${testID}-hour`}
          />
        </View>
        <Txt w="700" size={18} color={colors.onSurface} style={styles.colon}>
          :
        </Txt>
        <View style={styles.counterWrap}>
          <Counter
            label=""
            value={String(minute)}
            onChange={(v) => onChange(compose(hour12, parseInt(v, 10), period))}
            min={0}
            max={55}
            step={5}
            format={(n) => String(n).padStart(2, "0")}
            testID={`${testID}-minute`}
          />
        </View>
        <View style={styles.periodWrap}>
          <ChipRow
            options={[
              { key: "AM" as const, label: "AM" },
              { key: "PM" as const, label: "PM" },
            ]}
            value={period}
            onChange={(p) => onChange(compose(hour12, minute, p))}
          />
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  field: { gap: spacing.xs },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  counterWrap: { flex: 1 },
  colon: { paddingHorizontal: 2 },
  periodWrap: { flexShrink: 0 },
}));
