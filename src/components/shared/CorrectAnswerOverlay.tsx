import { useEffect, useRef, useCallback } from 'react';

export function CorrectAnswerOverlay() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const play = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    clearTimeout(timerRef.current);

    overlay.classList.add('visible');
    const player = overlay.querySelector('dotlottie-player') as any;
    if (player?.seek) player.seek(0);
    if (player?.play) player.play();

    timerRef.current = setTimeout(() => {
      overlay.classList.remove('visible');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        overlay.classList.add('visible');
        if (player?.seek) player.seek(0);
        if (player?.play) player.play();
        timerRef.current = setTimeout(() => {
          overlay.classList.remove('visible');
        }, 800);
      }));
    }, 800);
  }, []);

  useEffect(() => {
    (window as any).__playCorrectAnim = play;
    return () => { delete (window as any).__playCorrectAnim; };
  }, [play]);

  return (
    <div ref={overlayRef} className="correct-overlay">
      <dotlottie-player
        src="/assets/congratulations (1).lottie"
        autoplay
        speed="1.5"
        style={{ width: '100vw', height: '100vh' }}
      />
    </div>
  );
}
