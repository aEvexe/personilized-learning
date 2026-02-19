import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { useAudio } from '../hooks/useAudio';
import { useDragDrop } from '../hooks/useDragDrop';
import {
  getFlashcard,
  getStory,
  getTest,
  completeSection,
  completeTestWithScore,
} from '../services/lesson.service';
// extractId available if needed
import {
  LOTTIE_MAIN_LABELS,
  LOTTIE_SUB_LABELS,
  LOTTIE_FLOATING_WORDS,
} from '../utils/curriculum';
import type {
  ICurriculumSection,
  IFlashcardWord,
  IFlashcardWordRef,
  IStoryTranscript,
  ITestQuestion,
} from '../types/api';

type LessonPhase = 'loading' | 'flashcard' | 'story' | 'test' | 'done';

interface FlashcardWordData {
  word: string;
  translation: string;
  imageUrl?: string;
  audioUrl?: string;
}

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { updateProgressFromResponse } = useAppState();
  const audio = useAudio();

  const [phase, setPhase] = useState<LessonPhase>('loading');
  const [error, setError] = useState<string | null>(null);

  // Section data
  const [flashcardSection, setFlashcardSection] = useState<ICurriculumSection | null>(null);
  const [storySection, setStorySection] = useState<ICurriculumSection | null>(null);
  const [testSection, setTestSection] = useState<ICurriculumSection | null>(null);

  // Completion flags from API
  const [, setFlashcardCompleted] = useState(false);
  const [, setStoryCompleted] = useState(false);
  const [, setTestCompleted] = useState(false);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Load sections sequentially, skip completed
  useEffect(() => {
    if (!lessonId) return;
    let mounted = true;

    (async () => {
      try {
        // Flashcard
        const fcRes = await getFlashcard(lessonId);
        if (!mounted) return;
        setFlashcardSection(fcRes.section);
        setFlashcardCompleted(fcRes.isCompleted);

        if (!fcRes.isCompleted) {
          setPhase('flashcard');
          return;
        }

        // Story
        const stRes = await getStory(lessonId);
        if (!mounted) return;
        setStorySection(stRes.section);
        setStoryCompleted(stRes.isCompleted);

        if (!stRes.isCompleted) {
          setPhase('story');
          return;
        }

        // Test
        const tRes = await getTest(lessonId);
        if (!mounted) return;
        setTestSection(tRes.section);
        setTestCompleted(tRes.isCompleted);

        if (!tRes.isCompleted) {
          setPhase('test');
          return;
        }

        // All done
        setPhase('done');
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'Failed to load lesson');
      }
    })();

    return () => { mounted = false; };
  }, [lessonId]);

  const goBackToCurriculum = () => navigate('/curriculum');

  const advanceToStory = useCallback(async () => {
    if (!lessonId) return;
    try {
      const stRes = await getStory(lessonId);
      setStorySection(stRes.section);
      setStoryCompleted(stRes.isCompleted);
      if (stRes.isCompleted) {
        // Skip to test
        const tRes = await getTest(lessonId);
        setTestSection(tRes.section);
        setTestCompleted(tRes.isCompleted);
        setPhase(tRes.isCompleted ? 'done' : 'test');
      } else {
        setPhase('story');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load story');
    }
  }, [lessonId]);

  const advanceToTest = useCallback(async () => {
    if (!lessonId) return;
    try {
      const tRes = await getTest(lessonId);
      setTestSection(tRes.section);
      setTestCompleted(tRes.isCompleted);
      setPhase(tRes.isCompleted ? 'done' : 'test');
    } catch (err: any) {
      setError(err.message || 'Failed to load test');
    }
  }, [lessonId]);

  if (error) {
    return (
      <div className="lesson-page-layout">
        <button className="fc-back-btn" onClick={goBackToCurriculum}>
          &larr; Back to Curriculum
        </button>
        <div className="empty-state">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="lesson-page-layout">
        <div className="spinner" style={{ margin: 'auto' }} />
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="lottie-celebration">
        <div className="lottie-floating-words">
          {LOTTIE_FLOATING_WORDS.slice(0, 5).map((w, i) => (
            <span className="lottie-word" key={i} style={{ animationDelay: `${i * 0.15}s` }}>
              {w}
            </span>
          ))}
        </div>
        <div className="lottie-main-label" style={{ animation: 'celeb-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.15s forwards', opacity: 0 }}>
          Lesson Complete! 🎉
        </div>
        <div className="lottie-sub-label" style={{ animation: 'celeb-fade 0.4s ease 0.5s forwards', opacity: 0 }}>
          Great work finishing this lesson.
        </div>
        <button className="lottie-continue-btn" style={{ animation: 'celeb-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.8s forwards', opacity: 0 }} onClick={goBackToCurriculum}>
          CONTINUE
        </button>
      </div>
    );
  }

  return (
    <div className="lesson-page-layout">
      <button className="fc-back-btn" onClick={goBackToCurriculum}>
        &larr; Back to Curriculum
      </button>

      <div className="lesson-content-area">
        {phase === 'flashcard' && flashcardSection && lessonId && (
          <FlashcardSection
            section={flashcardSection}
            lessonId={lessonId}
            audio={audio}
            onComplete={async () => {
              try {
                const res = await completeSection(lessonId, 'flashcard');
                updateProgressFromResponse(res);
              } catch (_) {}
              advanceToStory();
            }}
          />
        )}

        {phase === 'story' && storySection && lessonId && (
          <StorySection
            section={storySection}
            lessonId={lessonId}
            audio={audio}
            onComplete={async () => {
              try {
                const res = await completeSection(lessonId, 'story');
                updateProgressFromResponse(res);
              } catch (_) {}
              advanceToTest();
            }}
          />
        )}

        {phase === 'test' && testSection && lessonId && (
          <TestSection
            section={testSection}
            lessonId={lessonId}
            audio={audio}
            onComplete={() => {
              setPhase('done');
            }}
            updateProgress={updateProgressFromResponse}
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   FLASHCARD SECTION
   ========================================================================= */

interface FlashcardProps {
  section: ICurriculumSection;
  lessonId: string;
  audio: ReturnType<typeof useAudio>;
  onComplete: () => void;
}

function FlashcardSection({ section, audio, onComplete }: FlashcardProps) {
  const words: FlashcardWordData[] = (section.wordRefs || []).map((ref: IFlashcardWordRef) => {
    const media = ref.wordMediaId;
    return {
      word: media?.word || '',
      translation: media?.translations?.uz || media?.translations?.ru || Object.values(media?.translations || {})[0] || '',
      audioUrl: media?.wordAudioUrl,
    };
  });

  // Fallback to section.words if wordRefs is empty
  const allWords = words.length > 0 ? words : (section.words || []).map((w: IFlashcardWord) => ({
    word: w.word,
    translation: w.translation,
    audioUrl: w.audioUrl,
  }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showNext, setShowNext] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const currentWord = allWords[currentIndex];
  const total = allWords.length;
  const progressPercent = total > 0 ? ((currentIndex) / total) * 100 : 0;

  // Generate choices (correct + distractors)
  const [choices, setChoices] = useState<{ word: string; translation: string; correct: boolean }[]>([]);
  const [flipping, setFlipping] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);
  const choiceRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!currentWord) return;
    const others = allWords.filter((w) => w.word !== currentWord.word);
    const distractor = others.length > 0
      ? others[Math.floor(Math.random() * others.length)]
      : { word: '---', translation: '---' };
    const items = [
      { word: currentWord.word, translation: currentWord.translation, correct: true },
      { word: distractor.word, translation: distractor.translation, correct: false },
    ];
    // Shuffle
    const shuffled = Math.random() > 0.5 ? items : [items[1], items[0]];
    setChoices(shuffled);
    setSelectedIdx(null);
    setIsCorrect(null);
    setShowNext(false);
    setFlipping(false);
    setShowTranslations(false);
  }, [currentIndex]);

  // Auto-play audio on card change
  useEffect(() => {
    if (currentWord?.audioUrl) {
      audio.playAudio(currentWord.audioUrl);
    }
  }, [currentIndex]);

  const handlePlayAudio = () => {
    if (currentWord?.audioUrl) {
      audio.playAudio(currentWord.audioUrl);
    }
  };

  const handleSelectChoice = (idx: number) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);
  };

  const handleCheck = () => {
    if (selectedIdx === null) return;
    const correct = choices[selectedIdx].correct;
    setIsCorrect(correct);
    setFlipping(true);

    if (correct) {
      audio.playCorrectSound();
      // Trigger lottie correct animation
      const playAnim = (window as any).__playCorrectAnim;
      if (playAnim) playAnim();
    } else {
      audio.playWrongSound();
    }

    // Flip: correct choice flips first, wrong after 200ms delay
    choices.forEach((c, i) => {
      const btnEl = choiceRefs.current[i];
      if (!btnEl) return;
      const flipDelay = c.correct ? 0 : 200;
      setTimeout(() => {
        btnEl.classList.add('flipping');
      }, flipDelay);
    });

    // At midpoint of flip (225ms), swap text to translations
    setTimeout(() => {
      setShowTranslations(true);
    }, 225);

    // After flip completes, show next button
    setTimeout(() => {
      setFlipping(false);
      setShowNext(true);
    }, 650);
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowCompletion(true);
      setTimeout(() => onComplete(), 2500);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  if (!currentWord) {
    return <div className="empty-state"><p>No flashcard words available.</p></div>;
  }

  if (showCompletion) {
    const labels = LOTTIE_MAIN_LABELS.flashcard;
    const mainLabel = labels[Math.floor(Math.random() * labels.length)];
    return (
      <div className="lottie-celebration">
        <div className="lottie-main-label">{mainLabel}</div>
        <div className="lottie-sub-label">{LOTTIE_SUB_LABELS.flashcard}</div>
        <div className="lottie-floating-words">
          {LOTTIE_FLOATING_WORDS.slice(0, 5).map((w, i) => (
            <span className="lottie-word" key={i} style={{ animationDelay: `${i * 0.15}s` }}>
              {w}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fc-wrap">
      <div className="fc-body">
        {/* Progress bar */}
        <div className="fc-progress-bar">
          <div className="fc-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="fc-counter">
          {currentIndex + 1} / {total}
        </div>

        {/* Question */}
        <div className="fc-question">What do you hear?</div>

        {/* Audio button */}
        {currentWord.audioUrl && (
          <button className="fc-audio-btn" onClick={handlePlayAudio}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="60" height="60">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM16.5 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          </button>
        )}

        {/* Choices */}
        <div className="fc-choices">
          {choices.map((choice, idx) => {
            let cls = 'fc-choice';
            if (selectedIdx === idx) cls += ' selected';
            if (isCorrect !== null) {
              if (choice.correct) cls += ' correct';
              else if (selectedIdx === idx) cls += ' wrong';
            }
            return (
              <div className="fc-choice-flip" key={idx}>
                <button
                  ref={(el) => { choiceRefs.current[idx] = el; }}
                  className={cls}
                  onClick={() => handleSelectChoice(idx)}
                  disabled={showNext || flipping}
                >
                  <span className="fc-choice-num" style={showTranslations ? { visibility: 'hidden' } : undefined}>{idx + 1}</span>
                  <span className="fc-choice-text">{showTranslations ? choice.translation : choice.word}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="fc-bottom-bar">
        <button className="fc-btn-skip" onClick={handleSkip}>
          CAN'T LISTEN NOW
        </button>
        {showNext ? (
          <button className="fc-btn-next" onClick={handleNext}>
            {currentIndex < total - 1 ? 'Next →' : 'Finish →'}
          </button>
        ) : (
          <button
            className={`fc-btn-check ${selectedIdx !== null ? 'active' : ''}`}
            onClick={handleCheck}
            disabled={selectedIdx === null}
          >
            CHECK
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   STORY SECTION
   ========================================================================= */

interface StoryProps {
  section: ICurriculumSection;
  lessonId: string;
  audio: ReturnType<typeof useAudio>;
  onComplete: () => void;
}

function StorySection({ section, audio, onComplete }: StoryProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const storyText = section.storyText || '';
  const storyAudioUrl = section.storyAudioUrl || '';
  const transcript: IStoryTranscript[] = section.storyTranscript || [];

  const hasStartedRef = useRef(false);

  useEffect(() => {
    const handleEnd = () => setIsPlaying(false);
    const handleStart = () => setIsPlaying(true);
    const handleFinished = () => { hasStartedRef.current = false; };
    window.addEventListener('story-ended', handleEnd);
    window.addEventListener('story-started', handleStart);
    window.addEventListener('story-finished', handleFinished);
    return () => {
      window.removeEventListener('story-ended', handleEnd);
      window.removeEventListener('story-started', handleStart);
      window.removeEventListener('story-finished', handleFinished);
      audio.pauseStoryAudio();
    };
  }, [audio]);

  const togglePlay = () => {
    if (isPlaying) {
      audio.pauseStoryAudio();
    } else if (hasStartedRef.current) {
      // Resume from where we paused
      audio.resumeStoryAudio();
    } else if (storyAudioUrl && transcript.length > 0) {
      hasStartedRef.current = true;
      audio.playStoryWithHighlight(storyAudioUrl, transcript);
    } else if (storyAudioUrl) {
      hasStartedRef.current = true;
      audio.playAudio(storyAudioUrl);
      setIsPlaying(true);
    }
  };

  const handleContinue = () => {
    audio.pauseStoryAudio();
    setShowCompletion(true);
    setTimeout(() => {
      onComplete();
    }, 2500);
  };

  if (showCompletion) {
    const labels = LOTTIE_MAIN_LABELS.story;
    const mainLabel = labels[Math.floor(Math.random() * labels.length)];
    return (
      <div className="lottie-celebration">
        <div className="lottie-main-label">{mainLabel}</div>
        <div className="lottie-sub-label">{LOTTIE_SUB_LABELS.story}</div>
        <div className="lottie-floating-words">
          {LOTTIE_FLOATING_WORDS.slice(0, 5).map((w, i) => (
            <span className="lottie-word" key={i} style={{ animationDelay: `${i * 0.15}s` }}>
              {w}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Build word spans for highlighting
  const renderStoryWords = () => {
    if (transcript.length > 0) {
      return transcript.map((entry, index) => (
        <span key={index} className="story-word" data-word-index={index}>
          {entry.word}{' '}
        </span>
      ));
    }
    return <span>{storyText}</span>;
  };

  return (
    <div className="story-section">
      <h3 className="section-title">Reading Practice</h3>

      <div className="story-text-area">
        <div className="story-text">{renderStoryWords()}</div>
      </div>

      <div className="story-controls">
        {storyAudioUrl && (
          <button className="story-play-btn" onClick={togglePlay}>
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
        )}
      </div>

      <div className="story-bottom-bar">
        <button className="story-back-btn" onClick={() => {}}>
          ← FLASHCARDS
        </button>
        <button className="story-continue-btn" onClick={handleContinue}>
          CONTINUE →
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   TEST SECTION
   ========================================================================= */

interface TestProps {
  section: ICurriculumSection;
  lessonId: string;
  audio: ReturnType<typeof useAudio>;
  onComplete: () => void;
  updateProgress: (data: { completedSections?: string[]; completedLessons?: string[] }) => void;
}

function TestSection({ section, lessonId, audio, onComplete, updateProgress }: TestProps) {
  const questions: ITestQuestion[] = section.questions || [];

  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string | string[]>>({});
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  // Fill-in-blank state
  const [fillAnswer, setFillAnswer] = useState<string | null>(null);

  const currentQ = questions[currentQIdx];
  const totalQ = questions.length;

  // Drag-drop for fill_in_blank
  const handleDrop = useCallback((val: string) => {
    setFillAnswer(val);
    const zone = document.getElementById('tq-drop-zone');
    if (zone) {
      zone.classList.add('filled');
      zone.innerHTML = `<span class="tq-drop-word">${val}</span>`;
    }
  }, []);

  const handleClear = useCallback(() => {
    setFillAnswer(null);
    const zone = document.getElementById('tq-drop-zone');
    if (zone) {
      zone.classList.remove('filled');
      zone.innerHTML = `<span class="tq-drop-placeholder">_____</span>`;
    }
    // Un-hide all chips
    document.querySelectorAll<HTMLElement>('.tq-chip').forEach((c) => {
      c.classList.remove('tq-chip-hidden');
    });
  }, []);

  const { chipPointerDown, zonePointerDown, chipClick, zoneClick } = useDragDrop(handleDrop, handleClear);

  const handleSelectOption = (option: string) => {
    if (checked) return;
    const qType = currentQ?.questionType || 'multiple_choice';

    if (qType === 'multiple_select') {
      const prev = (selectedAnswers[currentQIdx] as string[]) || [];
      const updated = prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option];
      setSelectedAnswers({ ...selectedAnswers, [currentQIdx]: updated });
    } else {
      setSelectedAnswers({ ...selectedAnswers, [currentQIdx]: option });
    }
  };

  const checkAnswer = () => {
    if (!currentQ) return;
    setChecked(true);

    const qType = currentQ.questionType || 'multiple_choice';
    let correct = false;

    if (qType === 'fill_in_blank') {
      correct = fillAnswer?.toLowerCase().trim() === (currentQ.correctAnswer || '').toLowerCase().trim();
    } else if (qType === 'multiple_select') {
      const selected = ((selectedAnswers[currentQIdx] as string[]) || []).sort();
      const correctAns = (currentQ.correctAnswers || []).sort();
      correct = selected.length === correctAns.length && selected.every((s, i) => s === correctAns[i]);
    } else {
      correct = selectedAnswers[currentQIdx] === currentQ.correctAnswer;
    }

    setIsCorrect(correct);
    if (correct) {
      setScore((s) => s + 1);
      audio.playCorrectSound();
    } else {
      audio.playWrongSound();
    }
  };

  const handleNext = () => {
    setChecked(false);
    setIsCorrect(null);
    setFillAnswer(null);

    if (currentQIdx < totalQ - 1) {
      setCurrentQIdx(currentQIdx + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleFinish = async () => {
    const testScore = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0;
    setShowCompletion(true);

    try {
      const res = await completeTestWithScore(lessonId, testScore);
      updateProgress(res);
    } catch (_) {}

    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  if (showCompletion) {
    const labels = LOTTIE_MAIN_LABELS.test;
    const mainLabel = labels[Math.floor(Math.random() * labels.length)];
    return (
      <div className="lottie-celebration">
        <div className="lottie-main-label">{mainLabel}</div>
        <div className="lottie-sub-label">{LOTTIE_SUB_LABELS.test}</div>
        <div className="lottie-floating-words">
          {LOTTIE_FLOATING_WORDS.slice(0, 5).map((w, i) => (
            <span className="lottie-word" key={i} style={{ animationDelay: `${i * 0.15}s` }}>
              {w}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (showResults) {
    const pct = totalQ > 0 ? Math.round((score / totalQ) * 100) : 0;
    return (
      <div className="test-results">
        <h2 className="test-results-title">Test Results</h2>
        <div className="test-results-score">
          <span className="test-score-number">{pct}%</span>
          <span className="test-score-label">{score} / {totalQ} correct</span>
        </div>
        <div className="test-results-review">
          {questions.map((q, idx) => {
            const userAns = selectedAnswers[idx];
            const qCorrect = q.questionType === 'multiple_select'
              ? JSON.stringify(((userAns as string[]) || []).sort()) === JSON.stringify((q.correctAnswers || []).sort())
              : userAns === q.correctAnswer;
            return (
              <div key={idx} className={`test-review-item ${qCorrect ? 'correct' : 'wrong'}`}>
                <span className="test-review-icon">{qCorrect ? '✓' : '✗'}</span>
                <span className="test-review-text">{q.questionText || q.question}</span>
              </div>
            );
          })}
        </div>
        <button className="btn-primary" onClick={handleFinish}>
          FINISH
        </button>
      </div>
    );
  }

  if (!currentQ) {
    return <div className="empty-state"><p>No test questions available.</p></div>;
  }

  const qType = currentQ.questionType || 'multiple_choice';
  const questionText = currentQ.questionText || currentQ.question || '';

  const canCheck = (() => {
    if (qType === 'fill_in_blank') return fillAnswer !== null;
    if (qType === 'multiple_select') return ((selectedAnswers[currentQIdx] as string[]) || []).length > 0;
    return selectedAnswers[currentQIdx] !== undefined;
  })();

  return (
    <div className="test-section">
      <div className="test-progress">
        <div className="test-progress-bar">
          <div className="test-progress-fill" style={{ width: `${((currentQIdx) / totalQ) * 100}%` }} />
        </div>
        <span className="test-counter">{currentQIdx + 1} / {totalQ}</span>
      </div>

      <div className="test-question">
        <h3 className="test-question-text">{questionText}</h3>

        {currentQ.audioUrl && (
          <button
            className="test-audio-btn"
            onClick={() => audio.playAudio(currentQ.audioUrl!)}
          >
            🔊
          </button>
        )}

        {/* Multiple choice / Multiple select */}
        {(qType === 'multiple_choice' || qType === 'multiple_select') && (
          <div className="test-options">
            {currentQ.options.map((option) => {
              let optClass = 'test-option-btn';
              const isSelected = qType === 'multiple_select'
                ? ((selectedAnswers[currentQIdx] as string[]) || []).includes(option)
                : selectedAnswers[currentQIdx] === option;

              if (isSelected) optClass += ' selected';

              if (checked) {
                const isCorrectAnswer = qType === 'multiple_select'
                  ? (currentQ.correctAnswers || []).includes(option)
                  : option === currentQ.correctAnswer;
                if (isCorrectAnswer) optClass += ' correct';
                else if (isSelected) optClass += ' wrong';
              }

              return (
                <button
                  key={option}
                  className={optClass}
                  onClick={() => handleSelectOption(option)}
                  disabled={checked}
                >
                  {option}
                </button>
              );
            })}
          </div>
        )}

        {/* Fill in blank */}
        {qType === 'fill_in_blank' && (
          <div className="test-fill-blank">
            <div
              id="tq-drop-zone"
              className={`tq-drop-zone ${fillAnswer ? 'filled' : ''} ${checked ? (isCorrect ? 'correct' : 'wrong') : ''}`}
              onPointerDown={zonePointerDown}
              onClick={zoneClick}
            >
              {fillAnswer ? (
                <span className="tq-drop-word">{fillAnswer}</span>
              ) : (
                <span className="tq-drop-placeholder">_____</span>
              )}
            </div>

            <div className="tq-chips">
              {currentQ.options.map((option) => (
                <span
                  key={option}
                  className={`tq-chip ${fillAnswer === option ? 'tq-chip-hidden' : ''}`}
                  data-value={option}
                  onPointerDown={(e) => chipPointerDown(e.currentTarget, e)}
                  onClick={(e) => chipClick(e.currentTarget)}
                >
                  {option}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Explanation after check */}
      {checked && currentQ.explanation && (
        <div className="test-explanation">
          <p>{currentQ.explanation}</p>
        </div>
      )}

      {/* Feedback */}
      {checked && (
        <div className={`test-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
          {isCorrect ? 'Correct!' : `Incorrect. Answer: ${currentQ.correctAnswer || (currentQ.correctAnswers || []).join(', ')}`}
        </div>
      )}

      {/* Bottom bar */}
      <div className="test-bottom-bar">
        {checked ? (
          <button className="btn-primary" onClick={handleNext}>
            {currentQIdx < totalQ - 1 ? 'NEXT' : 'SEE RESULTS'}
          </button>
        ) : (
          <button className="btn-primary" onClick={checkAnswer} disabled={!canCheck}>
            CHECK
          </button>
        )}
      </div>
    </div>
  );
}
