import { useCallback, useRef, useState } from "react";
import { useHaptic } from "../../hooks/useHaptic";

type ContextTraceUploadProps = {
  previewUrl: string | null;
  fileName: string | null;
  loading: boolean;
  onFileSelect: (file: File) => void;
  onUrlSubmit: (url: string) => void;
};

export default function ContextTraceUpload({
  previewUrl,
  fileName,
  loading,
  onFileSelect,
  onUrlSubmit,
}: ContextTraceUploadProps) {
  const haptic = useHaptic();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.match(/^image\/(jpeg|png|webp|jpg)$/)) return;
      haptic("medium");
      onFileSelect(file);
    },
    [haptic, onFileSelect],
  );

  return (
    <section className="nt-card relative overflow-hidden p-5">
      <div
        className="nt-blob"
        style={{ width: 150, height: 150, top: -60, left: -40, background: "var(--grad-blue)" }}
        aria-hidden
      />

      <div className="relative">
        <p className="nt-kicker">Step 1 · Upload</p>
        <h2 className="mt-1 text-xl font-extrabold tracking-tight text-ink">
          Trace an image&apos;s <span className="nt-gradient-text">true story</span>
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-body">
          Drop a forwarded image or paste a link. We reverse-search the web to find where it
          really came from.
        </p>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!loading) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (loading) return;
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onClick={() => !loading && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !loading) inputRef.current?.click();
          }}
          className="nt-press mt-4 flex min-h-[160px] flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-8 text-center transition-all"
          style={{
            borderColor: dragOver ? "var(--color-blue)" : "var(--color-line)",
            background: dragOver ? "var(--color-blue-soft)" : "var(--color-surface-2)",
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Uploaded preview"
              className="max-h-[180px] w-full rounded-2xl object-contain"
            />
          ) : (
            <>
              <span className="nt-tile nt-tile--blue" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </span>
              <p className="mt-3 text-sm font-extrabold text-ink">
                {loading ? "Tracing context…" : "Drag & drop or tap to upload"}
              </p>
              <p className="mt-1 text-xs text-muted">JPG · PNG · WEBP — max 15 MB</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg"
            className="hidden"
            disabled={loading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>

        {fileName && (
          <p className="mt-2 truncate text-center font-mono text-[11px] text-muted">{fileName}</p>
        )}

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <span className="h-px flex-1" style={{ background: "var(--color-line)" }} />
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-muted">or</span>
          <span className="h-px flex-1" style={{ background: "var(--color-line)" }} />
        </div>

        {/* URL form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (loading || !imageUrl.trim()) return;
            haptic("medium");
            onUrlSubmit(imageUrl.trim());
          }}
        >
          <label className="nt-kicker">Paste image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://… or Google Images link"
            disabled={loading}
            className="mt-2 w-full rounded-2xl border bg-surface px-4 py-3 text-sm font-medium text-ink outline-none transition placeholder:text-muted focus:border-blue disabled:opacity-60"
            style={{ borderColor: "var(--color-line)" }}
          />
          <button
            type="submit"
            disabled={loading || !imageUrl.trim()}
            className="nt-btn nt-btn-primary nt-btn-block mt-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Tracing…" : "Trace this image"}
          </button>
        </form>
      </div>
    </section>
  );
}
