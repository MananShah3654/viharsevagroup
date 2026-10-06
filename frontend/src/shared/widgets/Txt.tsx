// Themed Text that applies the Gujarati font family. Pick weight via `w`.
// Use everywhere instead of bare <Text> so Gujarati conjuncts render crisply.

import { Text, TextProps, TextStyle } from "react-native";

import { fonts, fontSize, useTheme } from "@/src/theme";

type Weight = "400" | "500" | "700";

interface Props extends TextProps {
  w?: Weight;
  size?: number;
  color?: string;
  center?: boolean;
}

const familyFor = (w: Weight) =>
  w === "700" ? fonts.bold : w === "500" ? fonts.medium : fonts.regular;

export function Txt({ w = "400", size = fontSize.base, color, center, style, ...rest }: Props) {
  const { colors } = useTheme();
  const base: TextStyle = {
    fontFamily: familyFor(w),
    fontSize: size,
    color: color ?? colors.onSurface,
  };
  if (center) base.textAlign = "center";
  return <Text {...rest} style={[base, style]} />;
}
