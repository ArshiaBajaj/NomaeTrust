import { useCallback, useRef, useState } from "react";

type ContextTraceUploadProps = {
  previewUrl: string | null;
  fileName: string | null;
  loading: boolean;
  onFileSelect: (file: File) => void;
};

export default function ContextTraceUpload({
  previewUrl,
  fileName,
  loading,
  onFileSelect,
}: ContextTraceUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.match(/^image\/(jpeg|png|webp|jpg)$/)) return;
      onFileSelect(file);
    },
    [onFileSelect],
  );

  return (
    <section className="card overflow-hidden p-0">
      <div className="border-b border-[rgba(0,0,0,0.06)] px-6 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
          Section 1
        </p>
        <h2 className="mt-1 text-lg font-semibold text-navy">Image Upload</h2>
        <p className="mt-1 text-sm text-text-muted">
          Drop a forwarded image to trace its history across the web.
        </p>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
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
          className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-all ${
            loading
              ? "cursor-not-allowed opacity-60"
              : dragOver
                ? "border-accent bg-accent/5"
                : "border-[rgba(0,0,0,0.1)] bg-surface shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-accent/40"
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>
          <p className="mt-4 text-base font-semibold text-navy">
            {loading ? "Tracing context…" : "Drag & drop image here"}
          </p>
          <p className="mt-2 text-xs text-text-muted">JPG · PNG · WEBP — max 15 MB</p>
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

        <div className="flex flex-col">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">
            Preview
          </p>
          <div className="mt-3 flex flex-1 items-center justify-center overflow-hidden rounded-xl border border-[rgba(0,0,0,0.08)] bg-surface-raised">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Uploaded preview"
                className="max-h-[280px] w-full object-contain"
              />
            ) : (
              <p className="px-6 text-center text-sm text-text-muted">
                Upload an image to preview EXIF metadata and context timeline.
              </p>
            )}
          </div>
          {fileName && (
            <p className="mt-3 truncate font-mono text-xs text-text-muted">{fileName}</p>
          )}
        </div>
      </div>
    </section>
  );
}
