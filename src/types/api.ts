// Enums
export enum LanguageCode {
  Ar = 'ar', Zh = 'zh', Nl = 'nl', En = 'en', Fr = 'fr', De = 'de',
  Hi = 'hi', It = 'it', Ja = 'ja', Ko = 'ko', Pt = 'pt', Ru = 'ru',
  Es = 'es', Tr = 'tr', Uz = 'uz',
}

export enum SectionType {
  Flashcard = 'flashcard',
  Story = 'story',
  Test = 'test',
}

export enum LessonStatus {
  Locked = 'locked',
  Available = 'available',
  InProgress = 'in_progress',
  Completed = 'completed',
}

export enum CurriculumGenerationStatus {
  Pending = 'pending',
  Generating = 'generating',
  Completed = 'completed',
  Failed = 'failed',
}

// Interfaces
export interface IMultiLangText {
  uz: string;
  en?: string;
  ru?: string;
}

export interface IMultiLangAudio {
  uz?: string;
  ru?: string;
}

export interface IOnboardingQA {
  question: string;
  answer: string;
  questionType: string;
}

export interface IOnboardingQuestion {
  question: string;
  questionType: string;
  suggestedAnswers: string[];
}

export interface IFlashcardWord {
  word: string;
  translation: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface IFlashcardWordRef {
  wordMediaId: {
    _id: string;
    word: string;
    translations: Record<string, string>;
    wordAudioUrl?: string;
    imageUrl?: string;
  };
}

export interface IStoryTranscript {
  word: string;
  audioStartAt: number;
  audioEndAt: number;
  wordStartPosition: number;
  wordEndPosition: number;
}

export interface ITestQuestion {
  questionText?: string;
  question?: string;
  questionType?: 'multiple_choice' | 'multiple_select' | 'fill_in_blank';
  correctAnswer?: string;
  correctAnswers?: string[];
  options: string[];
  translation?: IMultiLangText;
  audioUrl?: string;
  explanation?: string;
}

export interface ICurriculumSection {
  _id: string;
  lessonId: string;
  type: SectionType;
  sectionOrder: number;
  words?: IFlashcardWord[];
  wordRefs?: IFlashcardWordRef[];
  storyText?: string;
  storyAudioUrl?: string;
  storyTranscript?: IStoryTranscript[];
  questions?: ITestQuestion[];
}

export interface ISectionStat {
  sectionId: string;
  sectionType: SectionType;
  completedAt: string;
  duration: number;
  score?: number;
  totalCorrect?: number;
  totalQuestions?: number;
}

export interface ICurriculumLesson {
  _id: string | { $oid: string };
  unitId: string;
  lessonOrder: number;
  title: string;
  description?: string;
  targetWords?: string[];
  status: string;
  sectionIds?: {
    flashcard?: string;
    story?: string;
    test?: string;
  };
}

export interface ICurriculumUnit {
  _id: string | { $oid: string };
  curriculumId: string;
  unitOrder: number;
  title: string;
  description?: string;
  status: string;
  lessons: ICurriculumLesson[];
}

export interface IUserCurriculum {
  _id: string;
  userId: string;
  nativeLanguage: string;
  targetLanguage: string;
  proficiencyLevel: string;
  generationStatus: CurriculumGenerationStatus;
  totalUnits: number;
  totalLessons: number;
  units: ICurriculumUnit[];
}

export interface IUserProgress {
  _id: string;
  userId: string;
  curriculumId: string;
  completedSections: string[];
  completedLessons: string[];
  sectionStats: ISectionStat[];
  totalTimeSpent: number;
  streakDays: number;
  lastActivityDate?: string;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ISectionResponse {
  section: ICurriculumSection;
  isCompleted: boolean;
}

export interface ICurriculumFullResponse {
  curriculum: IUserCurriculum;
  units: ICurriculumUnit[];
  progress: IUserProgress;
}

export interface ISpeechResult {
  overall_score: number;
  words: Array<{
    word: string;
    quality_score: number;
  }>;
}
