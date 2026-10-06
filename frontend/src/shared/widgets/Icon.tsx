// Single icon wrapper so the whole app imports icons from one place.
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { useTheme } from "@/src/theme";

interface Props {
  name: React.ComponentProps<typeof MaterialDesignIcons>["name"];
  size?: number;
  color?: string;
}

export function Icon({ name, size = 24, color }: Props) {
  const { colors } = useTheme();
  return <MaterialDesignIcons name={name} size={size} color={color ?? colors.onSurface} />;
}
