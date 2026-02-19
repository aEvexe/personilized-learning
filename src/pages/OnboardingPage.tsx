import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { getOnboardingQuestions, createCurriculum } from '../services/curriculum.service';
import { getOptionIcon, getOptionSubtitle, LANGUAGE_MAP } from '../utils/onboarding';
import type { IOnboardingQuestion } from '../types/api';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const {
    setOnboardingQuestions,
    onboardingAnswers,
    setOnboardingAnswers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
  } = useAppState();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filteredQuestions, setFilteredQuestions] = useState<IOnboardingQuestion[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const questions = await getOnboardingQuestions();
        if (!mounted) return;
        setOnboardingQuestions(questions);
        const filtered = questions.filter(
          (q) => q.questionType !== 'target_language'
        );
        setFilteredQuestions(filtered);
        setLoading(false);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'Failed to load questions');
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [setOnboardingQuestions]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const totalQuestions = filteredQuestions.length;
  const progressPercent = totalQuestions > 0 ? ((currentQuestionIndex) / totalQuestions) * 100 : 0;

  const qType = currentQuestion?.questionType || '';
  const isLang = qType === 'native_language' || qType === 'target_language';
  const isProficiency = qType === 'cefr_level' || qType === 'proficiency_level';
  const isStudyTime = qType === 'study_time';

  const handleSelect = (option: string) => {
    if (!currentQuestion) return;
    const newAnswers = { ...onboardingAnswers, [qType]: option };
    setOnboardingAnswers(newAnswers);
  };

  const handleContinue = async () => {
    if (!currentQuestion) return;
    const answer = onboardingAnswers[qType];
    if (!answer) return;

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setSubmitting(true);
      try {
        const cefrAnswer = onboardingAnswers['cefr_level'] || onboardingAnswers['proficiency_level'] || 'A1';
        const level = cefrAnswer.split(' ')[0];
        const nativeLangName = onboardingAnswers['native_language'] || 'English';
        const nativeLanguage = LANGUAGE_MAP[nativeLangName] || 'en';

        await createCurriculum({
          level,
          targetLanguage: 'en',
          nativeLanguage,
          onboardingAnswers: Object.entries(onboardingAnswers).map(([question, answer]) => ({
            question,
            answer,
          })),
        });
        navigate('/curriculum');
      } catch (err: any) {
        setError(err.message || 'Failed to create curriculum');
        setSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  /* ── Loading / Error ── */
  if (loading) {
    return <div className="ob-page ob-center"><div className="spinner" /></div>;
  }
  if (error && !currentQuestion) {
    return (
      <div className="ob-page ob-center">
        <p className="ob-msg">{error}</p>
        <button className="ob-continue-btn" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
  if (submitting) {
    return (
      <div className="ob-page ob-center">
        <div className="spinner" />
        <p className="ob-msg">Creating your personalized curriculum...</p>
      </div>
    );
  }
  if (!currentQuestion) {
    return <div className="ob-page ob-center"><p className="ob-msg">No questions available.</p></div>;
  }

  const answer = onboardingAnswers[qType];

  /* ── Render options based on question type ── */
  const renderOptions = () => {
    /* ── LANGUAGE: 3-col wrapping grid of white pills ── */
    if (isLang) {
      return (
        <div className="ob-lang-grid">
          {currentQuestion.suggestedAnswers.map((opt) => {
            const flag = getOptionIcon(qType, opt);
            return (
              <button
                key={opt}
                className={`ob-lang-pill ${answer === opt ? 'selected' : ''}`}
                onClick={() => handleSelect(opt)}
              >
                <span className="ob-lang-flag">{flag}</span>
                <span className="ob-lang-name">{opt}</span>
              </button>
            );
          })}
        </div>
      );
    }

    /* ── PROFICIENCY: single column, bar icon + subtitle as label ── */
    if (isProficiency) {
      return (
        <div className="ob-list">
          {currentQuestion.suggestedAnswers.map((opt) => {
            const icon = getOptionIcon(qType, opt);
            const subtitle = getOptionSubtitle(qType, opt);
            return (
              <button
                key={opt}
                className={`ob-list-card ${answer === opt ? 'selected' : ''}`}
                onClick={() => handleSelect(opt)}
              >
                <span className="ob-list-icon" dangerouslySetInnerHTML={{ __html: icon }} />
                <span className="ob-list-text">{subtitle || opt}</span>
              </button>
            );
          })}
        </div>
      );
    }

    /* ── STUDY TIME: single column, text left + label right, no icon ── */
    if (isStudyTime) {
      return (
        <div className="ob-list">
          {currentQuestion.suggestedAnswers.map((opt) => {
            const label = getOptionSubtitle(qType, opt);
            return (
              <button
                key={opt}
                className={`ob-list-card ob-list-split ${answer === opt ? 'selected' : ''}`}
                onClick={() => handleSelect(opt)}
              >
                <span className="ob-list-text">{opt}</span>
                {label && <span className="ob-list-right">{label}</span>}
              </button>
            );
          })}
        </div>
      );
    }

    /* ── DEFAULT (referral, purpose, interests): 2-col grid ── */
    return (
      <div className="ob-grid">
        {currentQuestion.suggestedAnswers.map((opt) => {
          const icon = getOptionIcon(qType, opt);
          return (
            <button
              key={opt}
              className={`ob-grid-card ${answer === opt ? 'selected' : ''}`}
              onClick={() => handleSelect(opt)}
            >
              <span className="ob-grid-icon" dangerouslySetInnerHTML={{ __html: icon }} />
              <span className="ob-grid-text">{opt}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="ob-page">
      {/* ── Top bar ── */}
      <div className="ob-topbar">
        {currentQuestionIndex > 0 ? (
          <button className="ob-back-btn" onClick={handleBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          </button>
        ) : (
          <div style={{ width: 38 }} />
        )}
        <div className="ob-progress">
          <div className="ob-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* ── Question ── */}
      <h2 className="ob-question">{currentQuestion.question}</h2>

      {/* ── Options ── */}
      {renderOptions()}

      {error && <p style={{ color: 'var(--error)', textAlign: 'center' }}>{error}</p>}

      {/* ── CONTINUE ── */}
      <div className="ob-bottom">
        <button className="ob-continue-btn" onClick={handleContinue} disabled={!answer}>
          CONTINUE
        </button>
      </div>
    </div>
  );
}
