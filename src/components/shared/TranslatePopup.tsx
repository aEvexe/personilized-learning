import { useEffect, useRef, useCallback } from 'react';
import { translateWord } from '../../services/translate.service';

declare global {
  interface Window {
    puter?: any;
    loadPuter?: () => Promise<void>;
  }
}

export function TranslatePopup() {
  const popupRef = useRef<HTMLDivElement | null>(null);

  const removePopup = useCallback(() => {
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
  }, []);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        removePopup();
      }
    };

    const onDblClick = async (e: MouseEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes(tag)) return;

      const sel = window.getSelection();
      const word = sel?.toString().trim();
      if (!word || word.length < 1 || word.length > 40 || word.includes(' ')) return;

      removePopup();

      const popup = document.createElement('div');
      popup.className = 'translate-popup';
      popup.innerHTML = `
        <div class="tp-word">
          ${word}
          <button class="tp-speak" title="Listen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
          </button>
        </div>
        <div class="tp-divider"></div>
        <div class="tp-lang">Russian</div>
        <div class="tp-translation" id="tp-ru"><span class="tp-loading">Translating...</span></div>
        <div style="height:4px;"></div>
        <div class="tp-lang">O'zbek</div>
        <div class="tp-translation" id="tp-uz"><span class="tp-loading">Translating...</span></div>
      `;

      document.body.appendChild(popup);
      popupRef.current = popup;

      const pw = popup.offsetWidth;
      const ph = popup.offsetHeight;
      let left = e.clientX - pw / 2;
      let top = e.clientY + 20;
      if (left < 8) left = 8;
      if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
      if (top + ph > window.innerHeight - 8) top = e.clientY - ph - 12;

      popup.style.left = left + 'px';
      popup.style.top = top + 'px';
      popup.style.setProperty('--tp-arrow', (e.clientX - left) + 'px');

      // Speak using puter TTS (lazy-loaded)
      const speak = async (w: string) => {
        try {
          if (window.loadPuter) await window.loadPuter();
          if (window.puter?.ai?.txt2speech) {
            const a = await window.puter.ai.txt2speech(w, { language: 'en-US' });
            a.play();
          }
        } catch { /* ignore */ }
      };

      popup.querySelector('.tp-speak')?.addEventListener('click', () => speak(word));
      speak(word); // auto-speak

      // Fetch translations
      const [ruText, uzText] = await Promise.all([
        translateWord(word, 'ru'),
        translateWord(word, 'uz'),
      ]);

      if (popupRef.current) {
        const ruEl = popup.querySelector('#tp-ru');
        const uzEl = popup.querySelector('#tp-uz');
        if (ruEl) ruEl.textContent = ruText;
        if (uzEl) uzEl.textContent = uzText;
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('dblclick', onDblClick);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('dblclick', onDblClick);
      removePopup();
    };
  }, [removePopup]);

  return null;
}
