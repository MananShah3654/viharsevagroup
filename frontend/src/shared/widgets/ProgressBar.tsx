// Thick volunteer progress bar (>=12pt) with animated fill.
import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { makeStyles, radius, useTheme } from "@/src/theme";

interface Props {
  value: number; // 0..1
  height?: number;
  trackColor?: string;
  fillColor?: string;
}

export function ProgressBar({ value, height = 14, trackColor, fillColor }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const w = useSharedValue(0);

  useEffect(() => {
    w.value = withTiming(Math.max(0, Math.min(1, value)), { duration: 600 });
  }, [value]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: radius.pill, backgroundColor: trackColor ?? colors.surfaceTertiary },
      ]}
    >
      <Animated.View
        style={[
          { height, borderRadius: radius.pill, backgroundColor: fillColor ?? colors.brandPrimary },
          fillStyle,
        ]}
      />
    </View>
  );
}

const useStyles = makeStyles(() => ({
  track: { width: "100%", overflow: "hidden" },
}));
