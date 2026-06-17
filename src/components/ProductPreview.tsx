import { useEffect, useRef } from "react";

export default function ProductPreview() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mockup = wrapperRef.current;
    if (!mockup) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    observer.observe(mockup);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="app-mockup-wrapper relative mx-auto mt-16 w-full max-w-4xl px-4 sm:mt-20"
    >
      <div className="app-mockup-window overflow-hidden rounded-t-2xl border border-white/40 bg-white shadow-[0_-8px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-center gap-2 border-b border-slate-200/80 bg-[#2d2d2d] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 text-xs font-medium text-white/50">
            NomaeTrust — Voice Verification
          </span>
        </div>

        <div className="bg-[#f8fafc] p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Pipeline
              </p>
              <p className="mt-1 font-serif text-lg text-slate-800">
                Verify voice notes
              </p>
            </div>
            <span className="rounded-full bg-[#2b5ce6] px-4 py-1.5 text-xs font-semibold text-white">
              Analyze
            </span>
          </div>

          <div className="mb-6 flex gap-2">
            {["Upload", "Transcribe", "Extract", "Evidence"].map((step, i) => (
              <div
                key={step}
                className={`flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                  i <= 2
                    ? "bg-[#2b5ce6]/10 text-[#2b5ce6]"
                    : "bg-white text-slate-400"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    i <= 2
                      ? "bg-[#2b5ce6] text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {i <= 2 ? "✓" : i + 1}
                </span>
                {step}
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#2b5ce6]/10 text-[#2b5ce6]">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700">
              voice_note_sample.mp3
            </p>
            <p className="mt-1 text-xs text-slate-400">Ready for analysis</p>
          </div>

          <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Verified
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              &ldquo;The city council approved the new water treatment facility
              funding in last Tuesday&rsquo;s session.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
