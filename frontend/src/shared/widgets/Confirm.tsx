// Confirm dialog (bottom-sheet style modal) — mounted once at root. Replaces
// Alert for confirmations. Promise-based: const ok = await confirm({...}).
import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { makeStyles, radius, spacing, useTheme } from "@/src/theme";
import { Button } from "@/src/shared/widgets/Button";
import { Txt } from "@/src/shared/widgets/Txt";

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();

  const confirm = useCallback<ConfirmFn>((o) => {
    setOpts(o);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (val: boolean) => {
    resolver.current?.(val);
    resolver.current = null;
    setOpts(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal visible={!!opts} transparent animationType="fade" onRequestClose={() => close(false)}>
        <Pressable style={styles.backdrop} onPress={() => close(false)}>
          <Pressable
            style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.handle} />
            <Txt w="700" size={20} color={colors.onSurface} style={styles.title}>
              {opts?.title}
            </Txt>
            {opts?.message ? (
              <Txt size={16} color={colors.muted} style={styles.message}>
                {opts.message}
              </Txt>
            ) : null}
            <View style={styles.actions}>
              <Button
                label={opts?.cancelLabel ?? "Cancel"}
                variant="secondary"
                onPress={() => close(false)}
                testID="confirm-cancel"
                style={{ flex: 1 }}
              />
              <Button
                label={opts?.confirmLabel ?? "OK"}
                variant={opts?.danger ? "danger" : "primary"}
                onPress={() => close(true)}
                testID="confirm-ok"
                style={{ flex: 1 }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside ConfirmProvider");
  return ctx;
}

const useStyles = makeStyles((colors) => ({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surfaceSecondary,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.sm,
  },
  title: { marginTop: spacing.xs },
  message: { marginBottom: spacing.sm, lineHeight: 22 },
  actions: { flexDirection: "row", gap: spacing.md, marginTop: spacing.sm },
}));
