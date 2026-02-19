import { createContext, useRef, useCallback, type ReactNode } from 'react';
import type { IStoryTranscript } from '../types/api';

export interface AudioContextType {
  playAudio: (url: string) => void;
  stopAudio: () => void;
  playStoryWithHighlight: (audioUrl: string, transcript: IStoryTranscript[]) => void;
  pauseStoryAudio: () => void;
  resumeStoryAudio: () => void;
  isStoryPlaying: () => boolean;
  playCorrectSound: () => void;
  playWrongSound: () => void;
}

export const AudioCtx = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const storyAudioRef = useRef<HTMLAudioElement | null>(null);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);

  // Lazy-init sound effects
  const getCorrectSound = useCallback(() => {
    if (!correctSoundRef.current) {
      correctSoundRef.current = new Audio('/assets/correct.mp3');
    }
    return correctSoundRef.current;
  }, []);

  const getWrongSound = useCallback(() => {
    if (!wrongSoundRef.current) {
      wrongSoundRef.current = new Audio('/assets/wrong.mp3');
    }
    return wrongSoundRef.current;
  }, []);

  const playAudio = useCallback((url: string) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    const audio = new Audio(url);
    currentAudioRef.current = audio;
    audio.play().catch(() => {});
  }, []);

  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
  }, []);

  const playStoryWithHighlight = useCallback(
    (audioUrl: string, transcript: IStoryTranscript[]) => {
      // Stop previous
      if (storyAudioRef.current) {
        storyAudioRef.current.pause();
        storyAudioRef.current = null;
      }

      // Clear highlights
      document.querySelectorAll('.story-word.highlighted').forEach(el => {
        el.classList.remove('highlighted');
      });

      const audio = new Audio(audioUrl);
      storyAudioRef.current = audio;

      audio.addEventListener('timeupdate', () => {
        const currentTime = audio.currentTime * 1000;
        transcript.forEach((entry, index) => {
          const wordEl = document.querySelector(`[data-word-index="${index}"]`);
          if (wordEl) {
            if (currentTime >= entry.audioStartAt && currentTime <= entry.audioEndAt) {
              wordEl.classList.add('highlighted');
            } else {
              wordEl.classList.remove('highlighted');
            }
          }
        });
      });

      audio.addEventListener('ended', () => {
        document.querySelectorAll('.story-word.highlighted').forEach(el => {
          el.classList.remove('highlighted');
        });
        storyAudioRef.current = null;
        window.dispatchEvent(new CustomEvent('story-ended'));
        window.dispatchEvent(new CustomEvent('story-finished'));
      });

      audio.play().catch(() => {
        window.dispatchEvent(new CustomEvent('story-ended'));
      });

      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('story-started'));
    },
    []
  );

  const pauseStoryAudio = useCallback(() => {
    if (storyAudioRef.current) {
      storyAudioRef.current.pause();
      window.dispatchEvent(new CustomEvent('story-ended'));
    }
  }, []);

  const resumeStoryAudio = useCallback(() => {
    if (storyAudioRef.current) {
      storyAudioRef.current.play().catch(() => {});
      window.dispatchEvent(new CustomEvent('story-started'));
    }
  }, []);

  const isStoryPlaying = useCallback(() => {
    return storyAudioRef.current ? !storyAudioRef.current.paused : false;
  }, []);

  const playCorrectSound = useCallback(() => {
    const s = getCorrectSound();
    s.currentTime = 0;
    s.play().catch(() => {});
  }, [getCorrectSound]);

  const playWrongSound = useCallback(() => {
    const s = getWrongSound();
    s.currentTime = 0;
    s.play().catch(() => {});
  }, [getWrongSound]);

  return (
    <AudioCtx.Provider
      value={{
        playAudio,
        stopAudio,
        playStoryWithHighlight,
        pauseStoryAudio,
        resumeStoryAudio,
        isStoryPlaying,
        playCorrectSound,
        playWrongSound,
      }}
    >
      {children}
    </AudioCtx.Provider>
  );
}
