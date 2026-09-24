import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import type { FrettedInstrument, Key } from "../../lib/music";
import type { SheetEntry } from "../../lib/music/cheat-sheet";
import { explorationSections } from "../../lib/music/exploration";

export default function ChordExploration({
  musicalKey,
  instrument,
  renderCard,
}: {
  musicalKey: Key;
  instrument: FrettedInstrument;
  renderCard: (entry: SheetEntry) => ReactNode;
}) {
  const sections = useMemo(
    () => explorationSections(musicalKey, instrument),
    [musicalKey, instrument],
  );
  const [visible, setVisible] = useState(1);
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!sentinel.current || visible >= sections.length) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting)
          setVisible((n) => Math.min(n + 1, sections.length));
      },
      { rootMargin: "300px" },
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [visible, sections.length]);
  return (
    <div className="cs-explore">
      <nav className="cs-jump" aria-label="Explore sections">
        {sections.map((section, index) => (
          <a
            key={section.id}
            href={`#explore-${section.id}`}
            aria-label={section.title}
            onClick={() => setVisible((n) => Math.max(n, index + 1))}
          >
            {["Triads", "7ths", "Colors", "Pull", "Borrow"][index]}
          </a>
        ))}
      </nav>
      {sections.slice(0, visible).map((section) => (
        <section
          key={section.id}
          id={`explore-${section.id}`}
          aria-label={section.title}
          className="cs-explore-section"
        >
          <h2>{section.title}</h2>
          <p className="cs-explore-description">{section.description}</p>
          <div className="cs-chords">
            {section.entries.map((entry) => (
              <div key={entry.chord.id} className="cs-explore-entry">
                <p className="cs-roman">{entry.relationship}</p>
                {renderCard(entry)}
                {entry.progression && (
                  <p className="cs-destination">Try: {entry.progression}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
      {visible < sections.length ? (
        <div ref={sentinel} className="cs-explore-more">
          <button
            type="button"
            className="ca-button"
            onClick={() => setVisible((n) => n + 1)}
          >
            Explore more ↓
          </button>
        </div>
      ) : (
        <p className="cs-explore-description">
          That’s the collection for this key. Pick two chords and make a little
          loop.
        </p>
      )}
    </div>
  );
}
