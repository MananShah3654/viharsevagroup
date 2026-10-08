// Native variant: tap to open the platform's calendar via
// @react-native-community/datetimepicker (iOS/Android only — see
// DateField.web.tsx for the web build, picked automatically by platform).
import { useState } from "react";
import { Pressable, View } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import { parseViharDate } from "@/src/core/vihar/utils";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

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
  const [open, setOpen] = useState(false);
  const parsed = parseViharDate(value);

  const onPicked = (event: DateTimePickerEvent, selected?: Date) => {
    setOpen(false);
    if (event.type === "set" && selected) onChange(toDDMMYY(selected));
  };

  return (
    <View style={styles.field}>
      <Txt w="500" size={15} color={colors.onSurfaceTertiary}>
        {label}
        {required ? <Txt color={colors.error}> *</Txt> : null}
      </Txt>
      <Pressable testID={testID} style={styles.input} onPress={() => setOpen(true)}>
        <Txt size={fontSize.base} color={value ? colors.onSurface : colors.muted} style={styles.flex}>
          {value || "DD/MM/YY"}
        </Txt>
        <Icon name="calendar" size={20} color={colors.muted} />
      </Pressable>
      {open ? (
        <DateTimePicker value={parsed ?? new Date()} mode="date" display="default" onChange={onPicked} />
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  field: { gap: spacing.xs },
  flex: { flex: 1 },
  input: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
}));
