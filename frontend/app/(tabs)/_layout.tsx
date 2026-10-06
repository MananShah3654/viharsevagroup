import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";

import { useI18n } from "@/src/core/i18n";
import { usesNativeTabs } from "@/src/navigation";
import { Icon } from "@/src/shared/widgets/Icon";
import { fonts, useTheme } from "@/src/theme";

const ROUTES = [
  { name: "index", labelKey: "tabHome", icon: "home-variant", sf: "house.fill" },
  { name: "vihars", labelKey: "tabVihars", icon: "walk", sf: "figure.walk" },
  { name: "seva", labelKey: "tabSeva", icon: "hand-heart", sf: "hands.sparkles.fill" },
  { name: "history", labelKey: "tabHistory", icon: "history", sf: "clock.fill" },
  { name: "profile", labelKey: "tabProfile", icon: "account", sf: "person.fill" },
] as const;

export default function TabsLayout() {
  const { colors } = useTheme();
  const { t } = useI18n();

  if (usesNativeTabs) {
    return (
      <NativeTabs>
        {ROUTES.map((r) => (
          <NativeTabs.Trigger key={r.name} name={r.name}>
            <NativeTabs.Trigger.Icon sf={r.sf as any} />
            <NativeTabs.Trigger.Label>{t(r.labelKey as any)}</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
        ))}
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surfaceSecondary,
          borderTopColor: colors.border,
          ...(Platform.OS === "web" ? { height: 64 } : {}),
        },
        tabBarItemStyle: { alignSelf: "center" },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11 },
      }}
    >
      {ROUTES.map((r) => (
        <Tabs.Screen
          key={r.name}
          name={r.name}
          options={{
            title: t(r.labelKey as any),
            tabBarIcon: ({ color, size }) => <Icon name={r.icon as any} size={size} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
