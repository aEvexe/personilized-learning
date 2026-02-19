import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppState } from '../hooks/useAppState';
import { getCurriculumFull } from '../services/curriculum.service';
import { extractId } from '../utils/extractId';
import {
  getTopicClass,
  getTopicColors,
  SNAKE_OFFSETS,
  STAR_SVG,
  LOCK_SVG,
  CHECK_SVG,
  FASTFORWARD_SVG,
  GUIDEBOOK_ICON_SVG,
  TROPHY_SVG,
  buildRingArc,
} from '../utils/curriculum';
import type { ICurriculumLesson } from '../types/api';

interface LessonPopupData {
  lesson: ICurriculumLesson;
  lessonIdx: number;
  rect: DOMRect;
}

export default function UnitPage() {
  const { unitIndex } = useParams<{ unitIndex: string }>();
  const unitIdx = parseInt(unitIndex || '0', 10);
  const navigate = useNavigate();

  const {
    curriculum,
    unitsData,
    loadCurriculumData,
    isLessonCompleted,
    isSectionCompleted,
    isUnitCompleted,
  } = useAppState();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [popup, setPopup] = useState<LessonPopupData | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (unitsData.length > 0) {
        setLoading(false);
        return;
      }
      try {
        const data = await getCurriculumFull();
        if (!mounted) return;
        loadCurriculumData(data);
        setLoading(false);
      } catch (err: any) {
        if (!mounted) return;
        setError(err.message || 'Failed to load curriculum');
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [loadCurriculumData, unitsData.length]);

  // Sticky header observer
  useEffect(() => {
    if (loading || !sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const header = document.querySelector('.unit-page .unit-header');
          if (header) {
            if (entry.isIntersecting) {
              header.classList.remove('stuck');
            } else {
              header.classList.add('stuck');
            }
          }
        });
      },
      { threshold: 0, rootMargin: '-60px 0px 0px 0px' }
    );

    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [loading]);

  // Close popup on outside click
  useEffect(() => {
    if (!popup) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.lesson-popup') && !target.closest('.lesson-node')) {
        setPopup(null);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [popup]);

  const units = unitsData.length > 0 ? unitsData : curriculum?.units || [];
  const unit = units[unitIdx];

  const getLessonState = useCallback(
    (lesson: ICurriculumLesson, lessonIdx: number) => {
      const lessonId = extractId(lesson._id);
      if (!lessonId) return 'locked';

      if (isLessonCompleted(lessonId)) return 'completed';

      if (lessonIdx === 0) {
        if (unitIdx === 0) return 'active';
        const prevUnitDone = isUnitCompleted(unitIdx - 1);
        if (prevUnitDone) return 'active';
        const anyStarted = (unit?.lessons || []).some((l) => {
          const lid = extractId(l._id);
          return lid && isLessonCompleted(lid);
        });
        if (!anyStarted && unitIdx > 0) return 'jumpHere';
        return 'active';
      }

      const prevLesson = (unit?.lessons || [])[lessonIdx - 1];
      if (prevLesson) {
        const prevId = extractId(prevLesson._id);
        if (prevId && isLessonCompleted(prevId)) return 'active';
      }

      return 'locked';
    },
    [isLessonCompleted, isUnitCompleted, unitIdx, unit]
  );

  const getSectionsCompleted = useCallback(
    (lesson: ICurriculumLesson) => {
      const sIds = lesson.sectionIds;
      if (!sIds) return 0;
      let count = 0;
      if (sIds.flashcard && isSectionCompleted(sIds.flashcard)) count++;
      if (sIds.story && isSectionCompleted(sIds.story)) count++;
      if (sIds.test && isSectionCompleted(sIds.test)) count++;
      return count;
    },
    [isSectionCompleted]
  );

  const handleLessonClick = (lesson: ICurriculumLesson, lessonIdx: number, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (popup && extractId(popup.lesson._id) === extractId(lesson._id)) {
      setPopup(null);
    } else {
      setPopup({ lesson, lessonIdx, rect });
    }
  };

  const handleStartLesson = () => {
    if (!popup) return;
    const lessonId = extractId(popup.lesson._id);
    if (lessonId) {
      setPopup(null);
      navigate(`/lesson/${lessonId}`);
    }
  };

  if (loading) {
    return (
      <div className="unit-page">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="unit-page">
        <div className="empty-state">
          <p>{error || 'Unit not found.'}</p>
          <button className="btn-primary" onClick={() => navigate('/curriculum')}>
            Back to Curriculum
          </button>
        </div>
      </div>
    );
  }

  const topicClass = getTopicClass(unitIdx);
  const tc = getTopicColors(unitIdx);
  const unitDone = isUnitCompleted(unitIdx);
  const lessons = unit.lessons || [];

  return (
    <div className={`unit-page ${topicClass}`}>
      <button className="fc-back-btn" onClick={() => navigate('/curriculum')} style={{ margin: '12px 24px' }}>
        &larr; Back to Curriculum
      </button>

      <div ref={sentinelRef} className="unit-header-sentinel" />

      <div className="unit-header">
        <div className="unit-header-inner" style={{ borderColor: tc.a }}>
          <div className="unit-header-flag" style={{ background: tc.a }}>
            <span
              className="unit-guidebook-icon"
              dangerouslySetInnerHTML={{ __html: GUIDEBOOK_ICON_SVG }}
            />
            UNIT {unitIdx + 1}
          </div>
          <h2 className="unit-title">{unit.title}</h2>
          {unit.description && <p className="unit-description">{unit.description}</p>}
        </div>
      </div>

      <div className="lesson-path">
        {lessons.map((lesson, lessonIdx) => {
          const lessonId = extractId(lesson._id);
          const state = getLessonState(lesson, lessonIdx);
          const sectionsCompleted = getSectionsCompleted(lesson);
          const isCompleted = state === 'completed';
          const isActive = state === 'active';
          const isLocked = state === 'locked';
          const isJumpHere = state === 'jumpHere';
          const offsetClass = SNAKE_OFFSETS[lessonIdx % SNAKE_OFFSETS.length];

          let iconSvg = STAR_SVG;
          if (isCompleted) iconSvg = CHECK_SVG;
          else if (isLocked) iconSvg = LOCK_SVG;
          else if (isJumpHere) iconSvg = FASTFORWARD_SVG;

          const ringSvg = buildRingArc(sectionsCompleted, isCompleted, unitDone, isActive, tc);

          const nodeClasses = [
            'lesson-node',
            `lesson-state-${state}`,
            offsetClass,
            isCompleted && unitDone ? 'golden-complete' : '',
          ].filter(Boolean).join(' ');

          return (
            <div key={lessonId || lessonIdx}>
              {lessonIdx > 0 && (
                <div className={`dot-connector ${offsetClass}`}>
                  <span className="connector-dot" />
                  <span className="connector-dot" />
                  <span className="connector-dot" />
                </div>
              )}

              {isActive && (
                <div className={`start-label ${offsetClass}`}>
                  <span className="start-label-text">START</span>
                </div>
              )}

              {isJumpHere && (
                <div className={`jump-label ${offsetClass}`}>
                  <span className="jump-label-text">JUMP HERE?</span>
                </div>
              )}

              <div
                className={nodeClasses}
                onClick={(e) => handleLessonClick(lesson, lessonIdx, e)}
                style={
                  isActive || isCompleted
                    ? { '--lc-a': tc.a, '--lc-b': tc.b, '--lc-s': tc.s } as React.CSSProperties
                    : undefined
                }
              >
                <div className="lesson-ring" dangerouslySetInnerHTML={{ __html: ringSvg }} />
                <div
                  className="lesson-icon-circle"
                  style={
                    isActive
                      ? { background: tc.a, borderColor: tc.b }
                      : isCompleted
                      ? { background: unitDone ? '#fbbf24' : '#4ade80', borderColor: unitDone ? '#d4a017' : '#22c55e' }
                      : undefined
                  }
                >
                  <span dangerouslySetInnerHTML={{ __html: iconSvg }} />
                </div>

                {isCompleted && unitDone && (
                  <div className="golden-particles">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <span className="gold-particle" key={i} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {unitDone && (
          <div className="unit-trophy">
            <span dangerouslySetInnerHTML={{ __html: TROPHY_SVG }} />
          </div>
        )}
      </div>

      {/* Lesson popup */}
      {popup && (
        <div
          className="lesson-popup"
          style={{
            position: 'fixed',
            top: Math.min(popup.rect.bottom + 12, window.innerHeight - 200),
            left: Math.max(16, Math.min(popup.rect.left + popup.rect.width / 2 - 140, window.innerWidth - 296)),
            zIndex: 1000,
          }}
        >
          <div className="lesson-popup-inner">
            <h3 className="lesson-popup-title">{popup.lesson.title}</h3>
            {popup.lesson.description && (
              <p className="lesson-popup-desc">{popup.lesson.description}</p>
            )}
            <p className="lesson-popup-info">
              Lesson {popup.lessonIdx + 1} &middot; Unit {unitIdx + 1}
            </p>
            <button
              className="btn-primary lesson-popup-start"
              onClick={handleStartLesson}
              style={{ background: tc.a, width: '100%' }}
            >
              START
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
