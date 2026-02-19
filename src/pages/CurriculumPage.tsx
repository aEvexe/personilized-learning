import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TROPHY_SVG,
  buildRingArc,
} from '../utils/curriculum';
import type { ICurriculumLesson, ICurriculumUnit } from '../types/api';

interface LessonPopupData {
  lesson: ICurriculumLesson;
  unitIdx: number;
  lessonIdx: number;
  top: number;
  left: number;
  arrowLeft: number;
}

export default function CurriculumPage() {
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
  const stickyRefs = useRef<Map<number, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
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
  }, [loadCurriculumData]);

  // Sticky unit headers via IntersectionObserver
  useEffect(() => {
    if (loading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            el.classList.remove('stuck');
          } else {
            el.classList.add('stuck');
          }
        });
      },
      { threshold: 0, rootMargin: '-60px 0px 0px 0px' }
    );

    stickyRefs.current.forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [loading, unitsData]);

  const setStickyRef = useCallback((unitIdx: number, el: HTMLElement | null) => {
    if (el) {
      stickyRefs.current.set(unitIdx, el);
    } else {
      stickyRefs.current.delete(unitIdx);
    }
  }, []);

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

  const getLessonState = useCallback(
    (lesson: ICurriculumLesson, lessonIdx: number, unit: ICurriculumUnit, unitIdx: number) => {
      const lessonId = extractId(lesson._id);
      if (!lessonId) return 'locked';

      const completed = isLessonCompleted(lessonId);
      if (completed) return 'completed';

      // Check if previous lesson is completed (or first lesson)
      if (lessonIdx === 0) {
        // First lesson of unit
        if (unitIdx === 0) return 'active';
        // Check if previous unit is completed
        const prevUnitDone = isUnitCompleted(unitIdx - 1);
        if (prevUnitDone) return 'active';
        // Check if any lesson in this unit is started
        const anyStarted = unit.lessons.some((l) => {
          const lid = extractId(l._id);
          return lid && isLessonCompleted(lid);
        });
        if (!anyStarted && unitIdx > 0) return 'jumpHere';
        return 'active';
      }

      const prevLesson = unit.lessons[lessonIdx - 1];
      const prevId = extractId(prevLesson._id);
      if (prevId && isLessonCompleted(prevId)) return 'active';

      return 'locked';
    },
    [isLessonCompleted, isUnitCompleted]
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

  const popupRef = useRef<HTMLDivElement>(null);

  const handleLessonClick = (
    lesson: ICurriculumLesson,
    unitIdx: number,
    lessonIdx: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (popup && extractId(popup.lesson._id) === extractId(lesson._id)) {
      setPopup(null);
      return;
    }

    // Find ring element for accurate positioning
    const nodeEl = e.currentTarget as HTMLElement;
    const ringEl = nodeEl.querySelector('.lesson-ring') || nodeEl.querySelector('.lesson-jump-circle') || nodeEl;
    const rect = ringEl.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    const popupW = Math.min(300, window.innerWidth - 32);

    let left = rect.left + scrollX + rect.width / 2 - popupW / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - popupW - 16));
    const top = rect.bottom + scrollY + 14;
    const arrowLeft = rect.left + scrollX + rect.width / 2 - left;

    setPopup({ lesson, unitIdx, lessonIdx, top, left, arrowLeft });
  };

  // Scroll popup into view after it appears
  useEffect(() => {
    if (popup && popupRef.current) {
      requestAnimationFrame(() => {
        popupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }, [popup]);

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
      <div className="curriculum-page">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !curriculum) {
    return (
      <div className="curriculum-page">
        <div className="empty-state">
          <p>{error || 'No curriculum found.'}</p>
          <button className="btn-primary" onClick={() => navigate('/onboarding')}>
            Create Curriculum
          </button>
        </div>
      </div>
    );
  }

  const units = unitsData.length > 0 ? unitsData : curriculum.units || [];

  return (
    <div className="curriculum-page">
      <div className="full-path">
        {units.map((unit, unitIdx) => {
          const topicClass = getTopicClass(unitIdx);
          const tc = getTopicColors(unitIdx);
          const unitDone = isUnitCompleted(unitIdx);
          const lessons = unit.lessons || [];

          return (
            <div className="unit-section" key={extractId(unit._id) || unitIdx}>
              {/* Unit header sentinel for sticky */}
              <div
                ref={(el) => setStickyRef(unitIdx, el)}
                className="unit-header-sentinel"
              />
              <div className={`unit-header ${topicClass}`}>
                <div className="unit-header-left">
                  <h2>SECTION {unitIdx + 1}, UNIT {unitIdx + 1}</h2>
                  <h1>{unit.title || 'Untitled Unit'}</h1>
                  {unit.description && (
                    <p style={{ fontSize: '0.85em', opacity: 0.9, margin: '4px 0 0' }}>{unit.description}</p>
                  )}
                </div>
              </div>

              <div className="lesson-path">
                {lessons.map((lesson, lessonIdx) => {
                  const lessonId = extractId(lesson._id);
                  const state = getLessonState(lesson, lessonIdx, unit, unitIdx);
                  const sectionsCompleted = getSectionsCompleted(lesson);
                  const isCompleted = state === 'completed';
                  const isActive = state === 'active';
                  const isLocked = state === 'locked';
                  const isJumpHere = state === 'jumpHere';
                  const offsetClass = SNAKE_OFFSETS[lessonIdx % SNAKE_OFFSETS.length];

                  // Determine icon SVG
                  let iconSvg = STAR_SVG;
                  if (isCompleted) iconSvg = CHECK_SVG;
                  else if (isLocked) iconSvg = LOCK_SVG;
                  else if (isJumpHere) iconSvg = FASTFORWARD_SVG;

                  // Build ring arc
                  const ringSvg = buildRingArc(sectionsCompleted, isCompleted, unitDone, isActive || isJumpHere, tc);

                  // Status class for ring
                  const statusClass = isCompleted
                    ? (unitDone ? 'completed unit-done' : 'completed')
                    : (isActive || isJumpHere) ? 'active' : 'locked';

                  // Connector between lessons
                  const prevLesson = lessonIdx > 0 ? unit.lessons[lessonIdx - 1] : null;
                  const prevCompleted = prevLesson
                    ? isLessonCompleted(extractId(prevLesson._id) || '')
                    : false;

                  return (
                    <div key={lessonId || lessonIdx}>
                      {/* Connector dot */}
                      {lessonIdx > 0 && (
                        <div className={`path-connector ${prevCompleted ? 'completed' : ''}`} />
                      )}

                      {/* Lesson node */}
                      <div
                        className={`lesson-node ${offsetClass}`}
                        style={(!isLocked || isJumpHere) ? { cursor: 'pointer' } : undefined}
                        onClick={(e) => (!isLocked || isJumpHere) && handleLessonClick(lesson, unitIdx, lessonIdx, e)}
                      >
                        {/* START label */}
                        {isActive && !isJumpHere && (
                          <>
                            <div
                              className="lesson-label"
                              style={{ '--ll-color': tc.a, '--ll-border': `${tc.a}55` } as React.CSSProperties}
                            >
                              START
                            </div>
                            <div className="lesson-label-spacer" />
                          </>
                        )}

                        {/* JUMP HERE label */}
                        {isJumpHere && (
                          <>
                            <div
                              className="lesson-label lesson-label-jump"
                              style={{ '--ll-color': tc.a, '--ll-border': `${tc.a}55` } as React.CSSProperties}
                            >
                              JUMP HERE?
                            </div>
                            <div className="lesson-label-spacer" />
                          </>
                        )}

                        {/* Jump-here uses flat circle */}
                        {isJumpHere ? (
                          <div
                            className="lesson-jump-circle"
                            style={{
                              background: `linear-gradient(160deg, ${tc.a}, ${tc.b})`,
                              boxShadow: `0 7px 0 ${tc.s}`,
                            }}
                          >
                            <span dangerouslySetInnerHTML={{ __html: FASTFORWARD_SVG }} />
                          </div>
                        ) : (
                          <div className={`lesson-ring ${statusClass}`}>
                            <span dangerouslySetInnerHTML={{ __html: ringSvg }} />
                            <div
                              className="lesson-circle"
                              style={
                                isActive
                                  ? {
                                      background: `linear-gradient(155deg, ${tc.a}, ${tc.b})`,
                                      boxShadow: `0 6px 0 ${tc.s}`,
                                    }
                                  : undefined
                              }
                            >
                              <span dangerouslySetInnerHTML={{ __html: iconSvg }} />
                            </div>
                            {/* Golden particles */}
                            {isCompleted && unitDone && (
                              <div className="trophy-particles">
                                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                                  <div className="trophy-particle" key={i} />
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="lesson-type">
                          {lesson.title || `Lesson ${lessonIdx + 1}`}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Trophy for completed unit */}
                {unitDone && (
                  <div className="unit-trophy">
                    <span dangerouslySetInnerHTML={{ __html: TROPHY_SVG }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Popup backdrop */}
      {popup && (
        <div
          className="lesson-popup-backdrop visible"
          onClick={() => setPopup(null)}
        />
      )}

      {/* Lesson popup */}
      {popup && (() => {
        const ptc = getTopicColors(popup.unitIdx);
        return (
          <div
            ref={popupRef}
            className="lesson-popup visible"
            style={{
              top: popup.top,
              left: popup.left,
              '--popup-color': ptc.b,
              '--popup-shadow': ptc.s,
              '--arrow-left': `${popup.arrowLeft}px`,
            } as React.CSSProperties}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="lesson-popup-title">{popup.lesson.title}</h3>
            <p className="lesson-popup-sub">
              Lesson {popup.lessonIdx + 1} of {
                (curriculum?.units?.[popup.unitIdx]?.lessons?.length) || '?'
              }
            </p>
            <button
              className="lesson-popup-start"
              onClick={handleStartLesson}
            >
              START
            </button>
          </div>
        );
      })()}
    </div>
  );
}
