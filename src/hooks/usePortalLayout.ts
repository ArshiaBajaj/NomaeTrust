import { useIsMobile } from "./useIsMobile";

/** Consistent shell classes for all portal pages. */
export function usePortalLayout() {
  const isMobile = useIsMobile();
  return {
    isMobile,
    shell: isMobile ? "mobile-screen" : "page-shell",
    content: isMobile ? "mobile-screen-pad" : "px-6 pb-20 pt-10 lg:px-8",
    pageBg: isMobile ? "mobile-page-bg" : "bg-bg",
  };
}
