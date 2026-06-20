import { useIsMobile } from "./useIsMobile";

/** Consistent shell classes for all portal pages. */
export function usePortalLayout() {
  const isMobile = useIsMobile();
  return {
    isMobile,
    shell: isMobile ? "nt-screen" : "page-shell",
    content: isMobile ? "" : "mx-auto max-w-3xl px-6 pb-20 pt-10 lg:px-8",
    pageBg: "",
  };
}
