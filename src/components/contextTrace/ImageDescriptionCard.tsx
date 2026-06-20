type ImageDescriptionCardProps = {
  description: string;
};

export default function ImageDescriptionCard({ description }: ImageDescriptionCardProps) {
  return (
    <section className="nt-card relative overflow-hidden p-5">
      <div
        className="nt-blob"
        style={{ width: 130, height: 130, top: -50, right: -40, background: "var(--grad-lilac)" }}
        aria-hidden
      />
      <div className="relative flex items-start gap-3">
        <span className="nt-tile nt-tile--lilac shrink-0" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 19.5h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"
            />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="nt-kicker">What we see</p>
          <h2 className="mt-1 text-lg font-extrabold tracking-tight text-ink">Image Description</h2>
        </div>
      </div>
      <p className="relative mt-4 text-sm leading-relaxed text-body">{description}</p>
    </section>
  );
}
