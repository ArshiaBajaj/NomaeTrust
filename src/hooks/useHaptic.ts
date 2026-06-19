import { useCallback } from "react";

type HapticStyle = "light" | "medium" | "heavy" | "success" | "error";

const PATTERNS: Record<HapticStyle, number | number[]> = {
  light: 8,
  medium: 16,
  heavy: 28,
  success: [8, 40, 12],
  error: [20, 60, 20],
};

export function useHaptic() {
  return useCallback((style: HapticStyle = "light") => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(PATTERNS[style]);
    }
  }, []);
}
