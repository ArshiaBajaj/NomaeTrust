import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import DeepfakeRiskPanel from "../components/contextLens/DeepfakeRiskPanel";
import MetadataComparePanel from "../components/contextLens/MetadataComparePanel";
import MobileShell from "../components/contextLens/MobileShell";
import OriginStoryTimeline from "../components/contextLens/OriginStoryTimeline";
import ThumbnailPlaceholder from "../components/contextLens/ThumbnailPlaceholder";
import { CONTEXT_LENS_DEMO } from "../data/contextLensDemo";
import { analyzeImageUpload, analyzeImageUrl } from "../services/contextLensApi";
import type { ContextLensAnalysis } from "../types/contextLens";

export default function ContextLens() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analysis, setAnalysis] = useState<ContextLensAnalysis | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  const data = analysis ?? CONTEXT_LENS_DEMO;
  const isLive = Boolean(analysis);
  const heroImage = data.previewDataUrl || data.events[data.events.length - 1]?.imageUrl;

  const runAnalysis = async (runner: () => Promise<ContextLensAnalysis>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await runner();
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setError("Paste a Google Images URL or direct image link.");
      return;
    }
    await runAnalysis(() => analyzeImageUrl(imageUrl.trim()));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await runAnalysis(() => analyzeImageUpload(file));
    e.target.value = "";
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(data.shareSummary);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch {
      setShared(false);
    }
  };

  const loadDemo = () => {
    setAnalysis(null);
    setImageUrl("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-alt to-bg px-4 py-6 lg:py-12">
      <div className="mb-6 hidden text-center lg:block">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
          Content provenance
        </p>
        <h1 className="mt-2 font-serif text-2xl text-navy">ContextLens</h1>
      </div>

      <MobileShell>
        <div className="flex h-full flex-col">
          <header className="flex items-center justify-between border-b border-[rgba(0,0,0,0.06)] px-4 py-3">
            <Link
              to="/screenshot"
              className="flex items-center gap-1 text-sm text-text-muted hover:text-navy"
            >
              <span aria-hidden>←</span>
              <span className="sr-only sm:not-sr-only">Back</span>
            </Link>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                ContextLens
              </p>
              <p className="text-xs font-semibold text-navy">Content Provenance</p>
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="rounded-lg p-2 text-text-muted hover:bg-surface-raised hover:text-accent"
              aria-label="Share summary"
            >
              {shared ? (
                <span className="text-[10px] font-semibold text-success">Copied</span>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              )}
            </button>
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
            <form onSubmit={handleAnalyze} className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wide text-text-muted">
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste Google Images link or image address"
                className="input-field w-full text-sm"
              />
              <p className="text-[10px] leading-relaxed text-text-muted">
                Tip: In Google Images, right-click the photo →{" "}
                <strong>Copy image address</strong> or paste the full{" "}
                <strong>imgres</strong> page URL.
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="submit" disabled={loading} className="btn-primary flex-1 text-sm">
                  {loading ? "Scanning…" : "Analyze URL"}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary text-sm"
                >
                  Upload image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {isLive && (
                  <button type="button" onClick={loadDemo} className="btn-secondary text-sm">
                    Demo
                  </button>
                )}
              </div>
              {error && (
                <p role="alert" className="text-sm text-secondary">
                  {error}
                </p>
              )}
            </form>

            {loading && (
              <LoadingSpinner label="Running deepfake scan, EXIF extraction, and provenance analysis…" />
            )}

            {!loading && (
              <>
                <div>
                  <ThumbnailPlaceholder
                    variant="protest"
                    imageUrl={heroImage}
                    size="lg"
                    selected
                    badge="disputed"
                  />
                  <p className="mt-2 text-xs text-text-muted">
                    {isLive
                      ? data.exifFound
                        ? "EXIF metadata found in downloaded file."
                        : "No EXIF in file — common after social re-uploads."
                      : "Sample disputed photo — paste a real URL above."}
                  </p>
                  {isLive && data.googleLensUrl && (
                    <a
                      href={data.googleLensUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-[11px] font-semibold text-accent hover:underline"
                    >
                      Open in Google Lens ↗
                    </a>
                  )}
                </div>

                <DeepfakeRiskPanel
                  assessment={data.deepfake}
                  syncedToMap={data.syncedToMap}
                />

                {data.syncedToMap && (
                  <Link
                    to="/trust-map"
                    className="block rounded-xl border border-secondary/30 bg-secondary/5 p-3 text-center text-xs font-semibold text-secondary hover:bg-secondary/10"
                  >
                    View tracked deepfake on Confusion Map →
                  </Link>
                )}

                <OriginStoryTimeline
                  events={data.events}
                  timelineMinYear={data.timelineMinYear}
                  timelineMaxYear={data.timelineMaxYear}
                />

                <section className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-accent">
                    Narrative Delta
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-text-body">
                    {data.narrativeDelta}
                  </p>
                </section>

                <MetadataComparePanel
                  events={data.events}
                  discrepancies={data.metadataDiscrepancies}
                />

                {isLive && data.webMatches.length > 0 && (
                  <section className="space-y-2">
                    <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted">
                      Web matches
                      {data.reverseImageQuery && (
                        <span className="ml-2 font-normal normal-case text-accent">
                          — Google: “{data.reverseImageQuery}”
                        </span>
                      )}
                    </h2>
                    {data.reverseImageTotalResults != null && (
                      <p className="text-[10px] text-text-muted">
                        {data.reverseImageTotalResults.toLocaleString()} reverse-image results
                        via SerpAPI
                      </p>
                    )}
                    <ul className="space-y-2">
                      {data.webMatches.slice(0, 5).map((match) => (
                        <li key={match.link}>
                          <a
                            href={match.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-lg border border-[rgba(0,0,0,0.06)] p-3 text-[11px] hover:border-accent/30"
                          >
                            <p className="font-semibold text-navy">{match.title}</p>
                            {match.source && (
                              <p className="mt-1 text-text-muted">{match.source}</p>
                            )}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <p className="pb-4 text-center text-[10px] text-text-muted">
                  {isLive
                    ? data.usedGoogleLens
                      ? "Deepfake scan + Google Reverse Image matches (SerpAPI) + provenance timeline."
                      : data.serpApiConfigured === false
                        ? "Add SERPAPI_KEY to backend/.env for Google Reverse Image matches."
                        : "No SerpAPI matches — use a public image URL (not a local upload)."
                    : "Demo scenario — paste a public image URL or upload a file."}
                </p>
              </>
            )}
          </div>
        </div>
      </MobileShell>
    </div>
  );
}
