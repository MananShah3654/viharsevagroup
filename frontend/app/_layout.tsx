import "react-native-reanimated";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { LogBox } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { ErrorBoundary } from "@/src/components/error-boundary";
import { queryClient } from "@/src/query-client";
import { AuthProvider, useAuth } from "@/src/core/auth/auth-context";
import { LanguageProvider } from "@/src/core/i18n";
import { registerForPush } from "@/src/core/push/register";
import { ToastProvider } from "@/src/shared/widgets/Toast";
import { ConfirmProvider } from "@/src/shared/widgets/Confirm";
import { useTheme } from "@/src/theme";

LogBox.ignoreAllLogs(true);
SplashScreen.preventAutoHideAsync().catch(() => {});

// --- Push: foreground handler (module scope) ---
if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

// --- Push: Android channel (module scope) ---
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
  });
}

function AuthGate() {
  const { token, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const seg0 = segments[0];
    const inAuth = seg0 === "login" || seg0 === "register";
    if (!token && !inAuth) {
      router.replace("/login");
    } else if (token && inAuth) {
      router.replace("/(tabs)");
    }
  }, [token, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="vihar/[id]/index" />
      <Stack.Screen name="admin/create-vihar" options={{ presentation: "modal" }} />
    </Stack>
  );
}

function PushTapHandler() {
  const router = useRouter();
  useEffect(() => {
    if (Platform.OS === "web") return;
    const open = (url?: string) => {
      if (!url) return;
      if (url.startsWith("http")) Linking.openURL(url);
      else router.push(url as any);
    };
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data: any = response.notification.request.content.data || {};
      open(data.deeplink || data.action_url);
    });
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const data: any = response.notification.request.content.data || {};
      open(data.deeplink || data.action_url);
    });
    return () => sub.remove();
  }, []);
  return null;
}

function PushRegistrar() {
  const { token, user } = useAuth();
  useEffect(() => {
    if (!token || !user?.id) return;
    // Register the native push token under the backend user id, so admin
    // reminders (which target participation.user_id) reach the right device.
    registerForPush(user.id);
  }, [token, user?.id]);
  return null;
}

function ThemedRoot() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <PushTapHandler />
      <PushRegistrar />
      <AuthGate />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "NotoSansGujarati-Regular": require("../assets/fonts/NotoSansGujarati-Regular.ttf"),
    "NotoSansGujarati-Medium": require("../assets/fonts/NotoSansGujarati-Medium.ttf"),
    "NotoSansGujarati-Bold": require("../assets/fonts/NotoSansGujarati-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <KeyboardProvider>
              <LanguageProvider>
                <AuthProvider>
                  <ToastProvider>
                    <ConfirmProvider>
                      <ThemedRoot />
                    </ConfirmProvider>
                  </ToastProvider>
                </AuthProvider>
              </LanguageProvider>
            </KeyboardProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
