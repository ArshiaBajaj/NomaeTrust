import { isIosDevice, isStandalonePwa } from "../../utils/shareTarget";

const APPS = [
  { name: "Apple News", emoji: "📰" },
  { name: "Google News", emoji: "🔎" },
  { name: "Safari / Chrome", emoji: "🌐" },
  { name: "CNN, Fox, AJC apps", emoji: "📱" },
] as const;

type NewsShareSetupProps = {
  compact?: boolean;
};

export default function NewsShareSetup({ compact = false }: NewsShareSetupProps) {
  const installed = isStandalonePwa();
  const ios = isIosDevice();

  return (
    <section className={`nw-share-setup ${compact ? "nw-share-setup--compact" : ""}`}>
      <div className="nw-share-setup-header">
        <span className="nw-share-setup-icon" aria-hidden>
          ↗
        </span>
        <div>
          <h3 className="nw-share-setup-title">Verify from any news app</h3>
          <p className="nw-share-setup-lead">
            {installed
              ? "NomaeTrust is installed — share any story here to verify instantly."
              : "Add NomaeTrust to your Home Screen, then share stories from Apple News and other apps."}
          </p>
        </div>
      </div>

      <ol className="nw-share-setup-steps">
        <li>
          <strong>{installed ? "Open a story" : "Add to Home Screen"}</strong>
          <span>
            {installed
              ? "In Apple News, Google News, Safari, or any news app."
              : ios
                ? "Safari → Share → Add to Home Screen."
                : "Install the app or bookmark News Watch."}
          </span>
        </li>
        <li>
          <strong>Tap Share</strong>
          <span>Use the system share button on the article.</span>
        </li>
        <li>
          <strong>Choose NomaeTrust</strong>
          <span>
            Scroll the share sheet — tap <em>NomaeTrust</em> to verify.
          </span>
        </li>
        <li>
          <strong>Get your Action Card</strong>
          <span>Outlet context, fact-checks, and next steps — automatically.</span>
        </li>
      </ol>

      <div className="nw-share-setup-apps">
        {APPS.map((app) => (
          <span key={app.name} className="nw-share-setup-app-pill">
            <span aria-hidden>{app.emoji}</span> {app.name}
          </span>
        ))}
      </div>

      {!installed && ios && (
        <p className="nw-share-setup-note">
          Share-to-NomaeTrust requires the app on your Home Screen (iOS 16.4+).
        </p>
      )}
    </section>
  );
}
