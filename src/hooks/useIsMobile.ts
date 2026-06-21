/**
 * NomaeTrust is locked to its phone UI on every screen size — the app always
 * renders inside the centered phone frame, so this is always true.
 */
export function useIsMobile(): boolean {
  return true;
}
