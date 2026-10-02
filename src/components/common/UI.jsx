import { useEffect, useRef } from "react";
import { Music2, RotateCcw, X, Disc3 } from "lucide-react";
import { fallbackArt } from "../../services/musicApi";
export function Artwork({ src, alt = "", className = "", ...props }) {
  return (
    <img
      className={className}
      src={src || fallbackArt}
      alt={alt}
      loading="lazy"
      onError={(e) => {
        if (!e.currentTarget.src.endsWith("fallback-art.svg"))
          e.currentTarget.src = fallbackArt;
      }}
      {...props}
    />
  );
}
export function IconButton({ label, children, className = "", ...props }) {
  return (
    <button
      className={`icon-button ${className}`}
      title={label}
      aria-label={label}
      {...props}
    >
      {children}
    </button>
  );
}
export function Skeleton({ cards = false }) {
  return (
    <div
      className={cards ? "card-grid skeleton-grid" : "skeleton-list"}
      aria-label="Loading music"
      aria-busy="true"
    >
      {Array.from({ length: cards ? 6 : 5 }, (_, i) => (
        <div
          key={i}
          className={`skeleton ${cards ? "skeleton-card" : "skeleton-row"}`}
        />
      ))}
    </div>
  );
}
export function Empty({
  title = "Find your first favorite",
  text = "Explore the music and make this space yours.",
  action,
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Music2 size={30} />
      </span>
      <h2>{title}</h2>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function ErrorState({ error, retry }) {
  return (
    <div className="error-state">
      <Disc3 size={28} />
      <h3>Let’s try that again</h3>
      <p>{error}</p>
      <button className="button secondary" onClick={retry}>
        <RotateCcw size={16} />
        Try again
      </button>
    </div>
  );
}
export function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const old = document.activeElement;
    const el = ref.current;
    const focusables = () =>
      el.querySelectorAll(
        'button,input,select,textarea,a[href],[tabindex="0"]',
      );
    focusables()[0]?.focus();
    const key = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const all = focusables();
        const first = all[0],
          last = all[all.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      old?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-title">
          <h2>{title}</h2>
          <IconButton label="Close dialog" onClick={onClose}>
            <X />
          </IconButton>
        </div>
        {children}
      </section>
    </div>
  );
}
