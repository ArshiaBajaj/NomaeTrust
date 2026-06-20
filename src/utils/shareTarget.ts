export type ExtensionSource = "discord" | "reddit" | "extension" | "web";

/** Parse incoming Web Share Target / deep-link params for News Watch. */
export type SharedNewsPayload = {
  headline: string;
  url: string;
  fromShare: boolean;
  fromPlatform: ExtensionSource | null;
};

export function parseSharedNewsPayload(search: string): SharedNewsPayload {
  const params = new URLSearchParams(search);
  const url = (params.get("url") ?? "").trim();
  const title = (params.get("headline") ?? params.get("title") ?? "").trim();
  const text = (params.get("text") ?? "").trim();

  // Share sheets often put the URL in text when url param is empty
  const textLooksLikeUrl = /^https?:\/\//i.test(text);
  const resolvedUrl = url || (textLooksLikeUrl ? text : "");
  const resolvedHeadline =
    title ||
    (text && !textLooksLikeUrl ? text : "") ||
    (resolvedUrl ? headlineFromUrl(resolvedUrl) : "");

  const fromParam = params.get("from");
  const fromPlatform: ExtensionSource | null =
    fromParam === "discord" ||
    fromParam === "reddit" ||
    fromParam === "extension" ||
    fromParam === "web"
      ? fromParam
      : null;

  const fromShare = Boolean(
    params.get("share") === "1" ||
      fromPlatform ||
      params.has("url") ||
      params.has("title") ||
      params.has("headline") ||
      params.has("text"),
  );

  return {
    headline: resolvedHeadline,
    url: resolvedUrl,
    fromShare,
    fromPlatform,
  };
}

export function extensionSourceLabel(source: ExtensionSource | null): string | null {
  if (!source) return null;
  if (source === "discord") return "Discord";
  if (source === "reddit") return "Reddit";
  if (source === "extension") return "Browser extension";
  return "News Watch";
}

function headlineFromUrl(raw: string): string {
  try {
    const parsed = new URL(raw);
    const slug = parsed.pathname.split("/").filter(Boolean).pop() ?? "";
    if (!slug) return `Shared link from ${parsed.hostname}`;
    return decodeURIComponent(slug)
      .replace(/[-_+]/g, " ")
      .replace(/\.\w+$/, "")
      .slice(0, 200);
  } catch {
    return "Shared news story";
  }
}

export const AUTO_VERIFY_SHARE_KEY = "nomae-auto-verify-share";

export function isAutoVerifyShareEnabled(): boolean {
  const stored = localStorage.getItem(AUTO_VERIFY_SHARE_KEY);
  return stored !== "0";
}

export function setAutoVerifyShare(enabled: boolean): void {
  localStorage.setItem(AUTO_VERIFY_SHARE_KEY, enabled ? "1" : "0");
}

export function isStandalonePwa(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean(
      "standalone" in navigator &&
        (navigator as Navigator & { standalone?: boolean }).standalone,
    )
  );
}

export function isIosDevice(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
