const DEFAULT_API = "http://localhost:3001";
const DEFAULT_KEY = "";

async function getSettings() {
  return chrome.storage.sync.get({
    apiUrl: DEFAULT_API,
    apiKey: DEFAULT_KEY,
    frontendUrl: "http://localhost:5173",
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "NOMAE_VERIFY") return;

  (async () => {
    try {
      const { apiUrl, apiKey } = await getSettings();
      const base = (apiUrl || DEFAULT_API).replace(/\/$/, "");

      const headers = { "Content-Type": "application/json" };
      if (apiKey) headers["X-NomaeTrust-Key"] = apiKey;

      const res = await fetch(`${base}/api/extension/verify`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          text: message.text,
          url: message.url,
          platform: message.platform,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `API ${res.status}`);
      }

      const data = await res.json();
      sendResponse({ ok: true, data });
    } catch (err) {
      sendResponse({
        ok: false,
        error: err instanceof Error ? err.message : "Verify failed",
      });
    }
  })();

  return true;
});
