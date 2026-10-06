// Design tokens for Naranpura Vihar Seva. Light + dark, warm saffron palette.
// Keys match the "color" block of /app/design_guidelines.json. Build sheets
// with makeStyles((colors) => ...) and read useTheme().colors for color props.

import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const light = {
  surface: "#FCFBF8",
  onSurface: "#2B2521",
  surfaceSecondary: "#FFFFFF",
  onSurfaceSecondary: "#2B2521",
  surfaceTertiary: "#F5EBE1",
  onSurfaceTertiary: "#4A3F37",
  surfaceInverse: "#3D352F",
  onSurfaceInverse: "#FFFFFF",
  muted: "#70665B",

  brand: "#D9772F",
  onBrand: "#FFFFFF",
  brandPrimary: "#D9772F",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#BA5F1F",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#F2DDCB",
  onBrandTertiary: "#8C4A19",

  success: "#2E7D32",
  onSuccess: "#FFFFFF",
  warning: "#ED6C02",
  onWarning: "#FFFFFF",
  error: "#D32F2F",
  onError: "#FFFFFF",
  info: "#0288D1",
  onInfo: "#FFFFFF",

  border: "#EADFD3",
  borderStrong: "#C2B2A3",
  divider: "#EADFD3",
};

const dark: typeof light = {
  surface: "#1F1B18",
  onSurface: "#F5EBE1",
  surfaceSecondary: "#2A2522",
  onSurfaceSecondary: "#F5EBE1",
  surfaceTertiary: "#3B3530",
  onSurfaceTertiary: "#D6C7B8",
  surfaceInverse: "#EADFD3",
  onSurfaceInverse: "#1F1B18",
  muted: "#968A7D",

  brand: "#D9772F",
  onBrand: "#FFFFFF",
  brandPrimary: "#D9772F",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#E08F4F",
  onBrandSecondary: "#1F1B18",
  brandTertiary: "#593012",
  onBrandTertiary: "#F2DDCB",

  success: "#4CAF50",
  onSuccess: "#1F1B18",
  warning: "#FF9800",
  onWarning: "#1F1B18",
  error: "#F44336",
  onError: "#FFFFFF",
  info: "#29B6F6",
  onInfo: "#1F1B18",

  border: "#3B3530",
  borderStrong: "#5C524A",
  divider: "#3B3530",
};

export type ThemeColors = typeof light;

export const defaultScheme = "light" satisfies ColorScheme;

export const themes: { light: ThemeColors; dark?: ThemeColors } = { light, dark };

// Font families (static instances loaded in app/_layout.tsx via expo-font).
export const fonts = {
  regular: "NotoSansGujarati-Regular",
  medium: "NotoSansGujarati-Medium",
  bold: "NotoSansGujarati-Bold",
};

// Shared sizing tokens from design_guidelines.json.
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40, xxxl: 56 };
export const radius = { sm: 8, md: 16, lg: 24, pill: 999 };
export const fontSize = { sm: 14, base: 16, lg: 18, xl: 22, xxl: 28, huge: 34 };

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}

setColorScheme?.(themes.dark ? null : defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = system && themes[system] ? system : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.light };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}
