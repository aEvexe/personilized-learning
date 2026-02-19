import { useEffect, useRef, useCallback } from 'react';
import { LOTTIE_MAIN_LABELS, LOTTIE_SUB_LABELS, LOTTIE_FLOATING_WORDS } from '../../utils/curriculum';

export function LottieCompletionOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const mainLabelRef = useRef<HTMLDivElement>(null);
  const subLabelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const praiseRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef<(() => void) | null>(null);

  const spawnPraiseWords = useCallback((container: HTMLDivElement) => {
    container.innerHTML = '';
    const pool = [...LOTTIE_FLOATING_WORDS].sort(() => Math.random() - 0.5).slice(0, 5);
    const positions = [
      { top: '8%', left: '5%' },
      { top: '5%', right: '8%' },
      { top: '42%', left: '-2%' },
      { top: '38%', right: '-2%' },
      { top: '75%', left: '12%' },
    ];
    const colors = [
      { bg: 'rgba(147,51,234,0.28)', color: '#e9d5ff' },
      { bg: 'rgba(251,191,36,0.28)', color: '#fde68a' },
      { bg: 'rgba(34,197,94,0.28)', color: '#86efac' },
      { bg: 'rgba(239,68,68,0.28)', color: '#fca5a5' },
      { bg: 'rgba(59,130,246,0.28)', color: '#93c5fd' },
    ];
    pool.forEach((word, i) => {
      const el = document.createElement('div');
      el.className = 'lottie-word';
      el.textContent = word;
      const pos = positions[i];
      const col = colors[i % colors.length];
      Object.assign(el.style, pos);
      el.style.background = col.bg;
      el.style.color = col.color;
      el.style.fontSize = (0.8 + Math.random() * 0.55).toFixed(2) + 'em';
      el.style.animationDelay = (i * 0.13) + 's';
      container.appendChild(el);
    });
  }, []);

  const show = useCallback((sectionType: string, callback: () => void) => {
    const overlay = overlayRef.current;
    const mainLabel = mainLabelRef.current;
    const subLabel = subLabelRef.current;
    const btn = btnRef.current;
    const praise = praiseRef.current;
    if (!overlay || !mainLabel || !subLabel || !btn) return;

    callbackRef.current = callback;

    mainLabel.classList.remove('pop');
    subLabel.classList.remove('pop');
    btn.classList.remove('pop');

    const player = overlay.querySelector('dotlottie-player') as any;
    if (player) {
      try { player.seek(0); player.play(); } catch {}
      setTimeout(() => { try { player.seek(0); player.play(); } catch {} }, 50);
    }

    const labels = LOTTIE_MAIN_LABELS[sectionType] || ['Well done!'];
    mainLabel.textContent = labels[Math.floor(Math.random() * labels.length)];
    subLabel.textContent = LOTTIE_SUB_LABELS[sectionType] || 'Keep going!';

    if (praise) spawnPraiseWords(praise);

    overlay.classList.add('visible');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      mainLabel.classList.add('pop');
      subLabel.classList.add('pop');
      btn.classList.add('pop');
    }));
  }, [spawnPraiseWords]);

  const handleContinue = useCallback(() => {
    overlayRef.current?.classList.remove('visible');
    if (callbackRef.current) {
      callbackRef.current();
      callbackRef.current = null;
    }
  }, []);

  useEffect(() => {
    (window as any).__showCompletionAnimation = show;
    return () => { delete (window as any).__showCompletionAnimation; };
  }, [show]);

  return (
    <div ref={overlayRef} className="lottie-overlay">
      <div className="lottie-player-wrap">
        <dotlottie-player
          src="/assets/finish (2).lottie"
          autoplay
          loop
          speed="1"
          style={{ width: '100%', height: '100%' }}
        />
        <div className="lottie-praise" ref={praiseRef}></div>
      </div>
      <div ref={mainLabelRef} className="lottie-main-label">Well done!</div>
      <div ref={subLabelRef} className="lottie-sub-label">Keep it up!</div>
      <button ref={btnRef} className="lottie-continue-btn" onClick={handleContinue}>
        Continue
      </button>
    </div>
  );
}
