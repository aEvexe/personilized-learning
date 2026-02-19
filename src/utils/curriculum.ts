// Topic color system
export const TOPIC_PALETTE = ['health', 'food', 'entertainment', 'daily'] as const;

export const TOPIC_COLORS: Record<string, { a: string; b: string; s: string }> = {
  health: { a: '#58CC03', b: '#45a302', s: '#2d6b01' },
  food: { a: '#FF9601', b: '#cc7800', s: '#8f5400' },
  entertainment: { a: '#FF4B4B', b: '#cc3333', s: '#8f1f1f' },
  daily: { a: '#9333ea', b: '#6b21a8', s: '#4c1476' },
};

export function getTopicClass(unitIdx: number): string {
  return `topic-${TOPIC_PALETTE[unitIdx % TOPIC_PALETTE.length]}`;
}

export function getTopicColors(unitIdx: number) {
  return TOPIC_COLORS[TOPIC_PALETTE[unitIdx % TOPIC_PALETTE.length]];
}

// Snake path offsets
export const SNAKE_OFFSETS = ['path-offset-center', 'path-offset-right', 'path-offset-center', 'path-offset-left'];

// SVG icons
export const STAR_SVG = `<svg class="star-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
export const LOCK_SVG = `<svg class="star-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>`;
export const CHECK_SVG = `<svg class="star-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>`;
export const FASTFORWARD_SVG = `<svg class="star-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>`;
export const GUIDEBOOK_ICON_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>`;
export const TROPHY_SVG = `<svg viewBox="0 0 64 64" width="48" height="48" xmlns="http://www.w3.org/2000/svg"><path d="M20 8 h24 v20 c0 10-6 18-12 20 c-6-2-12-10-12-20 Z" fill="#FFD700" stroke="#e6a800" stroke-width="1.5"/><path d="M24 12 q2-2 5-1" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M20 14 c-8 0-10 12-4 14 l4-2" fill="none" stroke="#FFD700" stroke-width="3.5" stroke-linecap="round"/><path d="M44 14 c8 0 10 12 4 14 l-4-2" fill="none" stroke="#FFD700" stroke-width="3.5" stroke-linecap="round"/><rect x="28" y="48" width="8" height="6" rx="2" fill="#FFD700" stroke="#e6a800" stroke-width="1.5"/><rect x="20" y="54" width="24" height="5" rx="3" fill="#FFD700" stroke="#e6a800" stroke-width="1.5"/><circle cx="32" cy="24" r="3" fill="#fff" opacity="0.5"/><circle cx="26" cy="20" r="1.8" fill="#fff" opacity="0.35"/><circle cx="38" cy="20" r="1.8" fill="#fff" opacity="0.35"/></svg>`;

// Build SVG ring arc
export function buildRingArc(sectionsCompleted: number, isCompleted: boolean, unitDone: boolean, isActive: boolean, tc: { a: string }) {
  const C = 2 * Math.PI * 46;
  const GAP = 8;
  const SEG = (C - GAP * 3) / 3;
  const TOTAL_SEG = SEG + GAP;
  const segsLit = isCompleted ? 3 : sectionsCompleted;
  const segColor = isCompleted && unitDone ? '#fbbf24' : isCompleted ? '#4ade80' : isActive ? tc.a : 'var(--lc-a, #9333ea)';

  const segments = [0, 1, 2].map(idx => {
    const isLit = idx < segsLit;
    const dashOffset = C - idx * TOTAL_SEG;
    return `<circle class="ring-seg" cx="52" cy="52" r="46" fill="none" stroke-width="7" stroke="${isLit ? segColor : 'transparent'}" stroke-dasharray="${SEG} ${C - SEG}" stroke-dashoffset="${dashOffset}" stroke-linecap="round"/>`;
  }).join('');

  return `<svg class="lesson-ring-svg" viewBox="0 0 104 104"><circle class="ring-bg" cx="52" cy="52" r="46" fill="none" stroke-width="7" stroke="#2d3748"/>${segments}</svg>`;
}

// Lottie completion labels
export const LOTTIE_MAIN_LABELS: Record<string, string[]> = {
  flashcard: ['Great job!', 'Well done!', 'Excellent!', 'Awesome!'],
  story: ['Amazing!', 'Brilliant!', 'Fantastic!', 'Well done!'],
  test: ['Congrats!', 'Nailed it!', 'Great job!', 'Excellent!'],
};

export const LOTTIE_SUB_LABELS: Record<string, string> = {
  flashcard: 'Flashcards complete!',
  story: 'Story finished!',
  test: 'Test passed!',
};

export const LOTTIE_FLOATING_WORDS = ['Great!', 'Wow!', '🎉', 'Yes!', '🔥', 'Nice!', 'Epic!', '⭐', 'Top!', '💪'];
