import type { FactCheckHit } from "../../types";

type FactCheckHitCardProps = {
  hit: FactCheckHit;
  onSelect?: () => void;
};

export default function FactCheckHitCard({ hit, onSelect }: FactCheckHitCardProps) {
  const link = hit.reviewUrl ?? hit.url;

  return (
    <article className="nw-fc-card">
      <div className="nw-fc-card-header">
        <span className="nw-fc-publisher">{hit.publisher}</span>
        <span className="nw-fc-rating">{hit.rating}</span>
      </div>
      <p className="nw-fc-claim">{hit.claim}</p>
      <div className="nw-fc-card-footer">
        <span className="nw-fc-date">{hit.date}</span>
        {onSelect ? (
          <button type="button" className="ios-text-btn" onClick={onSelect}>
            Check similar →
          </button>
        ) : (
          link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="nw-fc-link"
            >
              Read review →
            </a>
          )
        )}
      </div>
    </article>
  );
}
