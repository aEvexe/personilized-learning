import { useEffect, useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import { getCurriculumFull } from '../services/curriculum.service';
import { extractId } from '../utils/extractId';

export default function ProgressPage() {
  const { curriculum, progress, completedLessons, completedSections, unitsData, loadCurriculumData } = useAppState();
  const [loading, setLoading] = useState(!curriculum);

  useEffect(() => {
    if (curriculum) return;
    (async () => {
      try {
        const data = await getCurriculumFull();
        loadCurriculumData(data);
      } catch (_) {}
      setLoading(false);
    })();
  }, [curriculum, loadCurriculumData]);

  // Calculate from actual units data, fallback to curriculum fields
  const units = unitsData || curriculum?.units || [];
  const totalLessons = units.reduce((sum, u) => sum + (u.lessons?.length || 0), 0) || curriculum?.totalLessons || 0;

  // A unit is complete when all its lessons are completed
  const completedUnitsCount = units.filter(u => {
    const unitLessons = u.lessons || [];
    if (unitLessons.length === 0) return false;
    return unitLessons.every(l => completedLessons.includes(extractId(l._id) || ''));
  }).length;
  const lessonsCompleted = completedLessons.length;
  const sectionsCompleted = completedSections.length;
  const streakDays = progress?.streakDays || 0;
  const totalTimeSpent = progress?.totalTimeSpent || 0;

  const lessonPercent = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;
  const totalTimeMinutes = Math.round(totalTimeSpent / 60);

  const lang = curriculum?.targetLanguage?.toUpperCase() || 'EN';
  const langFlags: Record<string, string> = {
    EN: '🇺🇸', RU: '🇷🇺', AR: '🇸🇦', ES: '🇪🇸', FR: '🇫🇷',
    DE: '🇩🇪', ZH: '🇨🇳', JA: '🇯🇵', KO: '🇰🇷', IT: '🇮🇹',
    PT: '🇵🇹', TR: '🇹🇷', HI: '🇮🇳', UZ: '🇺🇿',
  };

  if (loading) {
    return <div className="pg-page"><div className="spinner" style={{ margin: '80px auto' }} /></div>;
  }

  if (!curriculum) {
    return (
      <div className="pg-page">
        <div className="pg-empty">
          <span className="pg-empty-icon">📊</span>
          <h2>No progress yet</h2>
          <p>Complete onboarding to start tracking your learning journey.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pg-page">
      {/* Hero streak card */}
      <div className="pg-hero">
        <div className="pg-hero-flame">🔥</div>
        <div className="pg-hero-num">{streakDays}</div>
        <div className="pg-hero-label">Day Streak</div>
      </div>

      {/* Main lesson progress */}
      <div className="pg-lesson-card">
        <div className="pg-lesson-top">
          <span className="pg-lesson-title">Lessons Completed</span>
          <span className="pg-lesson-count">{lessonsCompleted} / {totalLessons}</span>
        </div>
        <div className="pg-bar">
          <div className="pg-bar-fill" style={{ width: `${lessonPercent}%` }} />
        </div>
        <span className="pg-lesson-pct">{lessonPercent}% complete</span>
      </div>

      {/* Stats grid */}
      <div className="pg-grid">
        <div className="pg-card pg-card-purple">
          <div className="pg-card-icon">📝</div>
          <div className="pg-card-value">{sectionsCompleted}</div>
          <div className="pg-card-label">Sections</div>
        </div>

        <div className="pg-card pg-card-blue">
          <div className="pg-card-icon">⏱</div>
          <div className="pg-card-value">{totalTimeMinutes}<span className="pg-card-unit">min</span></div>
          <div className="pg-card-label">Study Time</div>
        </div>

        <div className="pg-card pg-card-green">
          <div className="pg-card-icon">📖</div>
          <div className="pg-card-value">{completedUnitsCount}<span className="pg-card-unit">/{units.length}</span></div>
          <div className="pg-card-label">Units</div>
        </div>

        <div className="pg-card pg-card-amber">
          <div className="pg-card-icon">{langFlags[lang] || '🌍'}</div>
          <div className="pg-card-value">{lang}</div>
          <div className="pg-card-label">Language</div>
        </div>
      </div>
    </div>
  );
}
