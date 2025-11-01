import { useEffect, type PropsWithChildren } from "react";
import { useAuthStore } from "../model/store";

export function AuthProvider({ children }: PropsWithChildren) {
  const initialize = useAuthStore((s) => s.initialize);
  useEffect(() => {
    initialize();
  }, [initialize]);
  return children as any;
}
