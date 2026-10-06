// Online/offline awareness via NetInfo. Safe on web.

import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export function useOnline(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    NetInfo.fetch().then((state) => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return () => unsub();
  }, []);
  return online;
}
