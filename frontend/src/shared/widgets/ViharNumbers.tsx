import { View } from "react-native";

import { useI18n } from "@/src/core/i18n";
import { viharYearOf } from "@/src/core/vihar/utils";
import type { Vihar } from "@/src/shared/models";
import { Txt } from "@/src/shared/widgets/Txt";
import { makeStyles, spacing, useTheme } from "@/src/theme";

/** Original numbers continue for life; yearly numbers restart every August 1. */
export function ViharNumbers({ vihar, onDark = false }: { vihar: Vihar; onDark?: boolean }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useI18n();
  const season = viharYearOf(vihar);
  const labelColor = onDark ? "rgba(255,255,255,0.8)" : colors.muted;
  const valueColor = onDark ? "#FFFFFF" : colors.onSurface;

  return (
    <View style={styles.columns} testID={`vihar-numbers-${vihar.id}`}>
      <View style={styles.column}>
        <Txt size={11} color={labelColor}>{t("originalNo")}</Txt>
        <Txt w="700" size={15} color={valueColor} testID={`vihar-original-no-${vihar.id}`}>
          {vihar.total_no || "—"}
        </Txt>
      </View>
      <View style={styles.column}>
        <Txt size={11} color={labelColor}>
          {t("yearlyNo")}{season ? ` (${season})` : ""}
        </Txt>
        <Txt w="700" size={15} color={valueColor} testID={`vihar-yearly-no-${vihar.id}`}>
          {vihar.route_no || "—"}
        </Txt>
      </View>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  columns: { flexDirection: "row", gap: spacing.md },
  column: { flex: 1, minWidth: 0, gap: 2 },
}));
