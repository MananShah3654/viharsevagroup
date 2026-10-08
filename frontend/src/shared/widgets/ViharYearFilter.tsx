// Chip filter for the vihar "season" (Nov-Jul, labeled "25-26" style).
// Renders nothing only when there's no dated vihar data at all yet — stays
// visible even for a single season so "All" is always reachable (callers
// default `value` to the current season via currentViharYear()).
import { useMemo } from "react";

import { useI18n } from "@/src/core/i18n";
import { viharYearLabel, viharYearOf } from "@/src/core/vihar/utils";
import { ChipRow } from "@/src/shared/widgets/ChipRow";
import type { Vihar } from "@/src/shared/models";

/** The current vihar season's label (e.g. "26-27"), for default-selecting it. */
export function currentViharYear(): string {
  return viharYearLabel(new Date());
}

interface Props {
  vihars: Vihar[];
  value: string;
  onChange: (v: string) => void;
}

export function ViharYearFilter({ vihars, value, onChange }: Props) {
  const { t } = useI18n();

  const years = useMemo(() => {
    const set = new Set<string>();
    vihars.forEach((v) => {
      const y = viharYearOf(v);
      if (y) set.add(y);
    });
    return Array.from(set).sort();
  }, [vihars]);

  if (years.length === 0) return null;

  return (
    <ChipRow
      options={[{ key: "all", label: t("all") }, ...years.map((y) => ({ key: y, label: y }))]}
      value={value}
      onChange={onChange}
    />
  );
}
