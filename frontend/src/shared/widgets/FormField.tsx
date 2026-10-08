// Shared labeled text input used by every form screen (register, profile,
// create-vihar, add-user, ...). Extracted from duplicated local `Field`
// components so validation styling/behavior stays consistent everywhere.
import { TextInput, View, ViewStyle } from "react-native";

import { Txt } from "@/src/shared/widgets/Txt";
import { fontSize, makeStyles, radius, spacing, useTheme } from "@/src/theme";

export interface FormFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: "default" | "phone-pad" | "number-pad" | "decimal-pad" | "email-address";
  secure?: boolean;
  maxLength?: number;
  placeholder?: string;
  testID?: string;
  required?: boolean;
  multiline?: boolean;
  editable?: boolean;
  style?: ViewStyle;
}

export function FormField({
  label,
  value,
  onChange,
  keyboardType = "default",
  secure,
  maxLength,
  placeholder,
  testID,
  required,
  multiline,
  editable = true,
  style,
}: FormFieldProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={[styles.field, style]}>
      <Txt w="500" size={15} color={colors.onSurfaceTertiary}>
        {label}
        {required ? <Txt color={colors.error}> *</Txt> : null}
      </Txt>
      <TextInput
        testID={testID}
        style={[styles.input, multiline && styles.multiline, !editable && styles.disabled]}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        secureTextEntry={secure}
        maxLength={maxLength}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        numberOfLines={multiline ? 4 : undefined}
        textAlignVertical={multiline ? "top" : undefined}
        editable={editable}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  field: { gap: spacing.xs },
  input: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 52,
    fontSize: fontSize.base,
    fontFamily: "NotoSansGujarati-Regular",
    color: colors.onSurface,
  },
  multiline: {
    minHeight: 96,
    paddingTop: spacing.sm,
  },
  disabled: {
    opacity: 0.6,
  },
}));
