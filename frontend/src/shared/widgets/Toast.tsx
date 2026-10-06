// Toast system — mounted once at the root (above tabs). Replaces Alert.
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { Icon } from "@/src/shared/widgets/Icon";
import { Txt } from "@/src/shared/widgets/Txt";

type ToastKind = "success" | "error" | "info";
interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  show: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastApi | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();

  const show = useCallback((message: string, kind: ToastKind = "info") => {
    const id = ++idRef.current;
    setItems((prev) => [...prev, { id, kind, message }]);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(
        kind === "error"
          ? Haptics.NotificationFeedbackType.Error
          : Haptics.NotificationFeedbackType.Success,
      );
    }
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const bg: Record<ToastKind, string> = {
    success: colors.success,
    error: colors.error,
    info: colors.surfaceInverse,
  };
  const fg: Record<ToastKind, string> = {
    success: colors.onSuccess,
    error: colors.onError,
    info: colors.onSurfaceInverse,
  };
  const iconFor: Record<ToastKind, any> = {
    success: "check-circle",
    error: "alert-circle",
    info: "information",
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <View pointerEvents="box-none" style={[styles.wrap, { top: insets.top + spacing.sm, pointerEvents: "box-none" }]}>
        {items.map((t) => (
          <Animated.View
            key={t.id}
            entering={FadeInUp}
            exiting={FadeOutUp}
            style={[styles.toast, { backgroundColor: bg[t.kind] }]}
          >
            <Icon name={iconFor[t.kind]} size={22} color={fg[t.kind]} />
            <Txt w="500" size={15} color={fg[t.kind]} style={styles.msg}>
              {t.message}
            </Txt>
          </Animated.View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

const useStyles = makeStyles(() => ({
  wrap: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    gap: spacing.sm,
    zIndex: 1000,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  msg: { flex: 1 },
}));
