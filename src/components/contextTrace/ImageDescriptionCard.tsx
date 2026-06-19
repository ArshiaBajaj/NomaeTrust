type ImageDescriptionCardProps = {
  description: string;
};

export default function ImageDescriptionCard({ description }: ImageDescriptionCardProps) {
  return (
    <section className="card p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
        Image Description
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text-body">{description}</p>
    </section>
  );
}
