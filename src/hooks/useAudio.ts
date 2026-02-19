import { useContext } from 'react';
import { AudioCtx, type AudioContextType } from '../context/AudioContext';

export function useAudio(): AudioContextType {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
