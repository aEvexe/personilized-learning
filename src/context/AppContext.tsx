import { createContext, useState, useCallback, type ReactNode } from 'react';
import type {
  IUserCurriculum,
  ICurriculumUnit,
  IUserProgress,
  IOnboardingQuestion,
} from '../types/api';
import { extractId } from '../utils/extractId';

export interface LessonSections {
  flashcard?: string;
  story?: string;
  test?: string;
}

export interface AppState {
  curriculum: IUserCurriculum | null;
  unitsData: ICurriculumUnit[];
  progress: IUserProgress | null;
  completedLessons: string[];
  completedSections: string[];
  sectionStats: any[];
  lessonSections: Record<string, LessonSections>;
  onboardingQuestions: IOnboardingQuestion[];
  onboardingAnswers: Record<string, string>;
  currentQuestionIndex: number;
  currentUnitIndex: number;
  currentLessonIndex: number;
  currentLesson: string | null;
}

export interface AppContextType extends AppState {
  setCurriculum: (c: IUserCurriculum | null) => void;
  setUnitsData: (u: ICurriculumUnit[]) => void;
  setProgress: (p: IUserProgress | null) => void;
  setCompletedLessons: (l: string[]) => void;
  setCompletedSections: (s: string[]) => void;
  setSectionStats: (s: any[]) => void;
  setLessonSections: (ls: Record<string, LessonSections>) => void;
  updateLessonSection: (lessonId: string, sections: Partial<LessonSections>) => void;
  setOnboardingQuestions: (q: IOnboardingQuestion[]) => void;
  setOnboardingAnswers: (a: Record<string, string>) => void;
  setCurrentQuestionIndex: (i: number) => void;
  setCurrentUnitIndex: (i: number) => void;
  setCurrentLessonIndex: (i: number) => void;
  setCurrentLesson: (id: string | null) => void;
  isLessonCompleted: (lessonId: string) => boolean;
  isSectionCompleted: (sectionId: string) => boolean;
  isUnitCompleted: (unitIdx: number) => boolean;
  updateProgressFromResponse: (data: { completedSections?: string[]; completedLessons?: string[]; streakDays?: number; totalTimeSpent?: number }) => void;
  loadCurriculumData: (data: { curriculum: IUserCurriculum; units: ICurriculumUnit[]; progress: IUserProgress }) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [curriculum, setCurriculum] = useState<IUserCurriculum | null>(null);
  const [unitsData, setUnitsData] = useState<ICurriculumUnit[]>([]);
  const [progress, setProgress] = useState<IUserProgress | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [sectionStats, setSectionStats] = useState<any[]>([]);
  const [lessonSections, setLessonSections] = useState<Record<string, LessonSections>>({});
  const [onboardingQuestions, setOnboardingQuestions] = useState<IOnboardingQuestion[]>([]);
  const [onboardingAnswers, setOnboardingAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);

  const updateLessonSection = useCallback((lessonId: string, sections: Partial<LessonSections>) => {
    setLessonSections(prev => ({
      ...prev,
      [lessonId]: { ...prev[lessonId], ...sections },
    }));
  }, []);

  const isLessonCompleted = useCallback(
    (lessonId: string) => completedLessons.some(id => extractId(id) === lessonId),
    [completedLessons]
  );

  const isSectionCompleted = useCallback(
    (sectionId: string) => completedSections.some(id => extractId(id) === extractId(sectionId)),
    [completedSections]
  );

  const isUnitCompleted = useCallback(
    (unitIdx: number) => {
      const units = curriculum?.units || unitsData;
      const unit = units[unitIdx];
      if (!unit || !unit.lessons) return false;
      return unit.lessons.every(lesson => {
        const lessonId = extractId(lesson._id);
        return lessonId && completedLessons.some(id => extractId(id) === lessonId);
      });
    },
    [curriculum, unitsData, completedLessons]
  );

  const updateProgressFromResponse = useCallback(
    (data: { completedSections?: string[]; completedLessons?: string[]; streakDays?: number; totalTimeSpent?: number }) => {
      if (data.completedSections) setCompletedSections(data.completedSections);
      if (data.completedLessons) setCompletedLessons(data.completedLessons);
      if (data.streakDays !== undefined || data.totalTimeSpent !== undefined) {
        setProgress(prev => prev ? {
          ...prev,
          ...(data.streakDays !== undefined && { streakDays: data.streakDays }),
          ...(data.totalTimeSpent !== undefined && { totalTimeSpent: data.totalTimeSpent }),
        } : prev);
      }
    },
    []
  );

  const loadCurriculumData = useCallback(
    (data: { curriculum: IUserCurriculum; units: ICurriculumUnit[]; progress: IUserProgress }) => {
      const { curriculum: curr, units, progress: prog } = data;
      curr.units = units;
      setCurriculum(curr);
      setUnitsData(units);
      setProgress(prog);
      setCompletedLessons((prog as any).completedLessons || []);
      setCompletedSections((prog as any).completedSections || []);
      setSectionStats((prog as any).sectionStats || []);

      // Pre-populate lessonSections
      const ls: Record<string, LessonSections> = {};
      units.forEach(unit => {
        (unit.lessons || []).forEach(lesson => {
          const lessonId = extractId(lesson._id);
          if (lessonId && lesson.sectionIds) {
            ls[lessonId] = {
              flashcard: lesson.sectionIds.flashcard,
              story: lesson.sectionIds.story,
              test: lesson.sectionIds.test,
            };
          }
        });
      });
      setLessonSections(ls);
    },
    []
  );

  return (
    <AppContext.Provider
      value={{
        curriculum,
        unitsData,
        progress,
        completedLessons,
        completedSections,
        sectionStats,
        lessonSections,
        onboardingQuestions,
        onboardingAnswers,
        currentQuestionIndex,
        currentUnitIndex,
        currentLessonIndex,
        currentLesson,
        setCurriculum,
        setUnitsData,
        setProgress,
        setCompletedLessons,
        setCompletedSections,
        setSectionStats,
        setLessonSections,
        updateLessonSection,
        setOnboardingQuestions,
        setOnboardingAnswers,
        setCurrentQuestionIndex,
        setCurrentUnitIndex,
        setCurrentLessonIndex,
        setCurrentLesson,
        isLessonCompleted,
        isSectionCompleted,
        isUnitCompleted,
        updateProgressFromResponse,
        loadCurriculumData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
