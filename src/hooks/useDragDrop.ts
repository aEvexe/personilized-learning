import { useRef, useEffect, useCallback } from 'react';

interface DragState {
  val: string;
  source: 'chip' | 'zone';
  floater: HTMLElement;
  originEl: HTMLElement;
}

export function useDragDrop(onDrop: (val: string) => void, onClear: () => void) {
  const draggingRef = useRef<DragState | null>(null);

  const findZone = useCallback(() => document.getElementById('tq-drop-zone'), []);
  const findChip = useCallback(
    (val: string) =>
      [...document.querySelectorAll<HTMLElement>('.tq-chip')].find(c => c.dataset.value === val) || null,
    []
  );

  const startDrag = useCallback(
    (val: string, source: 'chip' | 'zone', originEl: HTMLElement, clientX: number, clientY: number) => {
      const floater = document.createElement('div');
      floater.textContent = val;
      floater.style.cssText = `position:fixed;z-index:9999;pointer-events:none;padding:10px 22px;border-radius:24px;border:2px solid #9333ea;background:rgba(147,51,234,0.35);color:#fff;font-size:1em;font-weight:700;white-space:nowrap;transform:translate(-50%,-50%);transition:none;box-shadow:0 4px 20px rgba(147,51,234,0.4);`;
      floater.style.left = clientX + 'px';
      floater.style.top = clientY + 'px';
      document.body.appendChild(floater);

      if (source === 'chip') {
        originEl.classList.add('tq-chip-hidden');
      } else {
        const zone = findZone();
        if (zone) {
          zone.classList.remove('filled');
          zone.innerHTML = `<span class="tq-drop-placeholder">_____</span>`;
        }
      }

      draggingRef.current = { val, source, floater, originEl };
    },
    [findZone]
  );

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    if (!draggingRef.current) return;
    draggingRef.current.floater.style.left = clientX + 'px';
    draggingRef.current.floater.style.top = clientY + 'px';
  }, []);

  const endDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!draggingRef.current) return;
      const { val, source, floater, originEl } = draggingRef.current;
      draggingRef.current = null;
      floater.remove();

      const zone = findZone();
      let droppedOnZone = false;
      if (zone) {
        const r = zone.getBoundingClientRect();
        droppedOnZone = clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
      }

      if (droppedOnZone) {
        onDrop(val);
      } else {
        if (source === 'chip') {
          originEl.classList.remove('tq-chip-hidden');
        } else {
          const chip = findChip(val);
          if (chip) chip.classList.remove('tq-chip-hidden');
        }
      }
    },
    [findZone, findChip, onDrop]
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => moveDrag(e.clientX, e.clientY);
    const onUp = (e: PointerEvent) => endDrag(e.clientX, e.clientY);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
  }, [moveDrag, endDrag]);

  const chipPointerDown = useCallback(
    (el: HTMLElement, e: React.PointerEvent) => {
      if (el.classList.contains('tq-chip-hidden')) return;
      e.preventDefault();
      startDrag(el.dataset.value || '', 'chip', el, e.clientX, e.clientY);
    },
    [startDrag]
  );

  const zonePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const zone = findZone();
      if (!zone || !zone.classList.contains('filled')) return;
      const word = zone.querySelector('.tq-drop-word');
      if (!word) return;
      e.preventDefault();
      startDrag(word.textContent?.trim() || '', 'zone', zone, e.clientX, e.clientY);
    },
    [findZone, startDrag]
  );

  const chipClick = useCallback(
    (el: HTMLElement) => {
      if (el.classList.contains('tq-chip-hidden') || draggingRef.current) return;
      onDrop(el.dataset.value || '');
    },
    [onDrop]
  );

  const zoneClick = useCallback(() => {
    if (draggingRef.current) return;
    const zone = findZone();
    if (!zone || !zone.classList.contains('filled')) return;
    onClear();
  }, [findZone, onClear]);

  return {
    chipPointerDown,
    zonePointerDown,
    chipClick,
    zoneClick,
  };
}
