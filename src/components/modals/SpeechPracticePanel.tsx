import { useState, useCallback } from 'react';
import { useMediaRecorder } from '../../hooks/useMediaRecorder';
import { convertToWav, evaluateSpeech } from '../../services/speech.service';
import type { ISpeechResult } from '../../types/api';

interface SpeechPracticePanelProps {
  word: string;
  language?: string;
  onClose: () => void;
}

export function SpeechPracticePanel({ word, language = 'en', onClose }: SpeechPracticePanelProps) {
  const { isRecording, startRecording, stopRecording } = useMediaRecorder();
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<ISpeechResult | null>(null);

  const handleMicClick = useCallback(async () => {
    if (isRecording) {
      const blob = await stopRecording();
      if (!blob) return;
      setIsEvaluating(true);
      try {
        const wavBlob = await convertToWav(blob);
        const speechResult = await evaluateSpeech(wavBlob, word, language);
        setResult(speechResult);

        // Confetti on score >= 70
        if (speechResult.overall_score >= 70 && (window as any).__playCorrectAnim) {
          (window as any).__playCorrectAnim();
        }
      } catch {
        setResult(null);
      } finally {
        setIsEvaluating(false);
      }
    } else {
      setResult(null);
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording, word, language]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4ade80';
    if (score >= 50) return '#fbbf24';
    return '#f87171';
  };

  return (
    <div className="sp-overlay open" onClick={handleOverlayClick}>
      <div className="sp-panel">
        <div className="sp-handle" />
        <div className="sp-word">{word}</div>

        <button
          className={`sp-mic ${isRecording ? 'recording' : ''}`}
          onClick={handleMicClick}
          disabled={isEvaluating}
        >
          {isEvaluating ? (
            <div className="spinner" style={{ width: 28, height: 28 }} />
          ) : isRecording ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
            </svg>
          )}
        </button>

        <div className="sp-hint">
          {isRecording
            ? 'Recording... Tap to stop'
            : isEvaluating
            ? 'Evaluating...'
            : 'Tap to start recording'}
        </div>

        {result && (
          <div className="sp-result visible">
            <div
              className="sp-overall"
              style={{ color: getScoreColor(result.overall_score) }}
            >
              {Math.round(result.overall_score)}
            </div>
            <div className="sp-overall-label">Overall Score</div>

            <div className="sp-words">
              {result.words.map((w, i) => (
                <div key={i} className="sp-word-row">
                  <span className="sp-word-label">{w.word}</span>
                  <div className="sp-bar-wrap">
                    <div
                      className="sp-bar-fill"
                      style={{
                        width: `${w.quality_score}%`,
                        background: getScoreColor(w.quality_score),
                      }}
                    />
                  </div>
                  <span
                    className="sp-word-score"
                    style={{ color: getScoreColor(w.quality_score) }}
                  >
                    {Math.round(w.quality_score)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="sp-close-btn" onClick={onClose}>
          {result ? 'Done' : 'Close'}
        </button>
      </div>
    </div>
  );
}
