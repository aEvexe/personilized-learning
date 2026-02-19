import { apiCall } from './api';
import type { IOnboardingQuestion, ICurriculumFullResponse, IApiResponse } from '../types/api';

export async function getOnboardingQuestions(): Promise<IOnboardingQuestion[]> {
  const data = await apiCall<IApiResponse<IOnboardingQuestion[]>>('/onboarding/questions');
  return data.data || (data as any).questions || [];
}

export async function createCurriculum(body: {
  level: string;
  targetLanguage: string;
  nativeLanguage: string;
  onboardingAnswers: Array<{ question: string; answer: string }>;
}): Promise<void> {
  await apiCall('/curriculum/create', 'POST', body);
}

export async function getCurriculumFull(): Promise<ICurriculumFullResponse> {
  const response = await apiCall<IApiResponse<ICurriculumFullResponse>>('/curriculum-full');
  const data = response.data || (response as any);
  return {
    curriculum: data.curriculum || data,
    units: data.units || data.curriculum?.units || [],
    progress: data.progress || {},
  } as ICurriculumFullResponse;
}
