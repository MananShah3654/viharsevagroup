// From/to/date/time/approx_kms block + a "Calculate" distance button, shared
// by the single-vihar form, each split-mode stage, and the edit-vihar form.
import { useState } from "react";
import { View } from "react-native";

import { useI18n } from "@/src/core/i18n";
import { calculateRoadDistance } from "@/src/core/vihar/distance";
import { Button } from "@/src/shared/widgets/Button";
import { DateField } from "@/src/shared/widgets/DateField";
import { FormField } from "@/src/shared/widgets/FormField";
import { TimeField } from "@/src/shared/widgets/TimeField";
import { useToast } from "@/src/shared/widgets/Toast";
import { makeStyles, spacing } from "@/src/theme";

export interface LegValue {
  from_upashray: string;
  to_upashray: string;
  vihar_date: string;
  vihar_time: string;
  approx_kms: string;
}

interface Props {
  value: LegValue;
  onChange: (patch: Partial<LegValue>) => void;
  testIDPrefix: string;
}

export function LegFields({ value, onChange, testIDPrefix }: Props) {
  const styles = useStyles();
  const { t } = useI18n();
  const toast = useToast();
  const [calculating, setCalculating] = useState(false);

  const canCalculate = !!value.from_upashray.trim() && !!value.to_upashray.trim();

  const onCalculate = async () => {
    setCalculating(true);
    const km = await calculateRoadDistance(value.from_upashray, value.to_upashray);
    setCalculating(false);
    if (km == null) {
      toast.show(t("somethingWrong"), "error");
      return;
    }
    onChange({ approx_kms: String(km) });
  };

  return (
    <View style={styles.wrap}>
      <DateField
        label={t("date")}
        value={value.vihar_date}
        onChange={(v) => onChange({ vihar_date: v })}
        required
        testID={`${testIDPrefix}-date`}
      />
      <TimeField
        label={t("time")}
        value={value.vihar_time}
        onChange={(v) => onChange({ vihar_time: v })}
        required
        testID={`${testIDPrefix}-time`}
      />
      <FormField
        label={t("from")}
        value={value.from_upashray}
        onChange={(v) => onChange({ from_upashray: v })}
        required
        testID={`${testIDPrefix}-from`}
      />
      <FormField
        label={t("to")}
        value={value.to_upashray}
        onChange={(v) => onChange({ to_upashray: v })}
        required
        testID={`${testIDPrefix}-to`}
      />
      <View style={styles.row}>
        <FormField
          label={`${t("distance")} (${t("km")})`}
          value={value.approx_kms}
          onChange={(v) => onChange({ approx_kms: v })}
          keyboardType="decimal-pad"
          placeholder="4.2"
          style={styles.flex}
          testID={`${testIDPrefix}-kms`}
        />
        <Button
          label={t("calculate")}
          onPress={onCalculate}
          disabled={!canCalculate}
          loading={calculating}
          variant="secondary"
          testID={`${testIDPrefix}-calculate`}
          style={styles.calcBtn}
        />
      </View>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  wrap: { gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.md, alignItems: "flex-end" },
  half: { flex: 1 },
  flex: { flex: 1 },
  calcBtn: { marginBottom: 2 },
}));
