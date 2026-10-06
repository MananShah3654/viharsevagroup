// Row of count pills (Sadhuji / Sadhviji / Wheelchair / Mumukshu) for a vihar.
import { View } from "react-native";

import { makeStyles, radius, spacing } from "@/src/theme";
import { useI18n } from "@/src/core/i18n";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";
import type { Vihar } from "@/src/shared/models";

interface Pill {
  icon: React.ComponentProps<typeof Icon>["name"];
  labelKey: "sadhuji" | "sadhviji" | "wheelchair" | "mumukshu";
  value: number;
}

export function CountPills({
  vihar,
  onDark = false,
}: {
  vihar: Vihar;
  onDark?: boolean;
}) {
  const styles = useStyles();
  const { t } = useI18n();

  const pills: Pill[] = [
    { icon: "human", labelKey: "sadhuji", value: vihar.sadhu_bhagvant || 0 },
    { icon: "human-female", labelKey: "sadhviji", value: vihar.sadhviji_bhagvant || 0 },
    { icon: "wheelchair-accessibility", labelKey: "wheelchair", value: vihar.wheelchair || 0 },
    { icon: "account-star", labelKey: "mumukshu", value: vihar.mumukshu || 0 },
  ].filter((p) => p.value > 0);

  const fg = onDark ? "#FFFFFF" : undefined;
  const subColor = onDark ? "rgba(255,255,255,0.85)" : undefined;

  return (
    <View style={styles.row}>
      {pills.map((p) => (
        <View
          key={p.labelKey}
          testID={`count-${p.labelKey}`}
          style={[styles.pill, onDark && styles.pillDark]}
        >
          <Icon name={p.icon} size={18} color={fg} />
          <Txt w="700" size={16} color={fg}>
            {p.value}
          </Txt>
          <Txt size={13} color={subColor}>
            {t(p.labelKey)}
          </Txt>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  pillDark: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
}));
