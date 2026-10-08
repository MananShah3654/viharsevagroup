// Sahebji name + sadhu/sadhviji/mumukshu/wheelchair counts + boolean flags —
// shared across every leg in split mode, or the whole vihar in single mode.
import { View } from "react-native";

import { useI18n } from "@/src/core/i18n";
import { Checkbox } from "@/src/shared/widgets/Checkbox";
import { Counter } from "@/src/shared/widgets/Counter";
import { FormField } from "@/src/shared/widgets/FormField";
import { makeStyles, spacing } from "@/src/theme";

export interface SharedValue {
  sahebji_name: string;
  sadhu_bhagvant: string;
  sadhviji_bhagvant: string;
  mumukshu: string;
  wheelchair: string;
  self: boolean;
  luggage: boolean;
  dori: boolean;
  car_required: boolean;
  activa: boolean;
}

interface Props {
  value: SharedValue;
  onChange: (patch: Partial<SharedValue>) => void;
}

export function SharedFields({ value, onChange }: Props) {
  const styles = useStyles();
  const { t } = useI18n();

  return (
    <View style={styles.wrap}>
      <FormField
        label={t("sahebjiName")}
        value={value.sahebji_name}
        onChange={(v) => onChange({ sahebji_name: v })}
        testID="vihar-sahebji-name"
      />
      <View style={styles.row}>
        <View style={styles.half}>
          <Counter
            label={t("sadhuji")}
            value={value.sadhu_bhagvant}
            onChange={(v) => onChange({ sadhu_bhagvant: v })}
            testID="vihar-sadhu"
          />
        </View>
        <View style={styles.half}>
          <Counter
            label={t("sadhviji")}
            value={value.sadhviji_bhagvant}
            onChange={(v) => onChange({ sadhviji_bhagvant: v })}
            testID="vihar-sadhviji"
          />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.half}>
          <Counter
            label={t("mumukshu")}
            value={value.mumukshu}
            onChange={(v) => onChange({ mumukshu: v })}
            testID="vihar-mumukshu"
          />
        </View>
        <View style={styles.half}>
          <Counter
            label={t("wheelchair")}
            value={value.wheelchair}
            onChange={(v) => onChange({ wheelchair: v })}
            testID="vihar-wheelchair"
          />
        </View>
      </View>
      <View style={styles.checkRow}>
        <Checkbox label={t("self")} value={value.self} onChange={(v) => onChange({ self: v })} testID="vihar-self" />
        <Checkbox label={t("luggage")} value={value.luggage} onChange={(v) => onChange({ luggage: v })} testID="vihar-luggage" />
      </View>
      <View style={styles.checkRow}>
        <Checkbox label={t("dori")} value={value.dori} onChange={(v) => onChange({ dori: v })} testID="vihar-dori" />
        <Checkbox label={t("carRequired")} value={value.car_required} onChange={(v) => onChange({ car_required: v })} testID="vihar-car-required" />
      </View>
      <Checkbox label={t("activa")} value={value.activa} onChange={(v) => onChange({ activa: v })} testID="vihar-activa" />
    </View>
  );
}

const useStyles = makeStyles(() => ({
  wrap: { gap: spacing.md },
  row: { flexDirection: "row", gap: spacing.md },
  half: { flex: 1 },
  checkRow: { flexDirection: "row", gap: spacing.lg },
}));
