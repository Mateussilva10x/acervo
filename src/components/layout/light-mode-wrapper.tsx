"use client";

import { useEffect } from "react";

export function LightModeWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    return () => {
      // Restore dark class if store says so after unmount
    };
  }, []);

  return <>{children}</>;
}
