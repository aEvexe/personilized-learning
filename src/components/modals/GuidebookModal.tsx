import { useAppState } from '../../hooks/useAppState';

interface GuidebookModalProps {
  unitIdx: number | null;
  onClose: () => void;
}

export function GuidebookModal({ unitIdx, onClose }: GuidebookModalProps) {
  const { curriculum, unitsData } = useAppState();

  if (unitIdx === null) return null;

  const units = curriculum?.units || unitsData;
  const unit = units[unitIdx];
  if (!unit) return null;

  const lessons = unit.lessons || [];
  const phraseChips = lessons
    .map(l => l.title)
    .filter(Boolean);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="guidebook-overlay active" onClick={handleOverlayClick}>
      <div className="guidebook-modal">
        <div className="guidebook-header">
          <div className="guidebook-header-left">
            <div>
              <div className="guidebook-unit-label">UNIT {unitIdx + 1}</div>
              <div className="guidebook-title">{unit.title || 'Guidebook'}</div>
              <div className="guidebook-subtitle">{unit.description || "What you'll learn in this unit"}</div>
            </div>
          </div>
          <button className="guidebook-close" onClick={onClose}>✕</button>
        </div>
        <div className="guidebook-body">
          {phraseChips.length > 0 && (
            <>
              <div className="guidebook-key-phrases">
                <div className="guidebook-key-phrases-label">Key Phrases</div>
                <div className="guidebook-phrase-chips">
                  {phraseChips.map((chip, i) => (
                    <span key={i} className="guidebook-phrase-chip">{chip}</span>
                  ))}
                </div>
              </div>
              <div className="guidebook-divider"></div>
            </>
          )}
          <div className="guidebook-sections-label">What's inside</div>
          <div className="guidebook-section-cards">
            <div className="guidebook-sec-card flashcard-card">
              <div className="guidebook-sec-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
                </svg>
              </div>
              <div className="guidebook-sec-text">
                <div className="guidebook-sec-title">Flashcards</div>
                <div className="guidebook-sec-desc">Learn new vocabulary words with images and pronunciation</div>
              </div>
            </div>
            <div className="guidebook-sec-card story-card">
              <div className="guidebook-sec-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4zm12 16H6v-2h12v2zm0-4H6v-2h12v2zm0-4h-5V4h5v8z"/>
                </svg>
              </div>
              <div className="guidebook-sec-text">
                <div className="guidebook-sec-title">Story</div>
                <div className="guidebook-sec-desc">Read a short story using the vocabulary words in real context</div>
              </div>
            </div>
            <div className="guidebook-sec-card test-card">
              <div className="guidebook-sec-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
              <div className="guidebook-sec-text">
                <div className="guidebook-sec-title">Test</div>
                <div className="guidebook-sec-desc">Answer questions to test your knowledge of the unit</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
