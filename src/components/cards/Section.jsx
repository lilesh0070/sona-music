import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { IconButton } from "../common/UI";
export default function Section({ title, subtitle, to, children }) {
  const ref = useRef(null);
  return (
    <section className="music-section">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="section-actions">
          {to && (
            <Link className="see-all" to={to}>
              View all
            </Link>
          )}
          <IconButton
            label={`Scroll ${title} left`}
            onClick={() =>
              ref.current.scrollBy({ left: -600, behavior: "smooth" })
            }
          >
            <ChevronLeft size={18} />
          </IconButton>
          <IconButton
            label={`Scroll ${title} right`}
            onClick={() =>
              ref.current.scrollBy({ left: 600, behavior: "smooth" })
            }
          >
            <ChevronRight size={18} />
          </IconButton>
        </div>
      </div>
      <div ref={ref} className="horizontal-cards">
        {children}
      </div>
    </section>
  );
}
