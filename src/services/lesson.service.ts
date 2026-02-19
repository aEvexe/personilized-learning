import { apiCall } from './api';
import type { IApiResponse, ISectionResponse } from '../types/api';

export async function getFlashcard(lessonId: string): Promise<ISectionResponse> {
  const data = await apiCall<IApiResponse<ISectionResponse>>(`/lesson/${lessonId}/flashcard`);
  return data.data || (data as any);
}

export async function getStory(lessonId: string): Promise<ISectionResponse> {
  const data = await apiCall<IApiResponse<ISectionResponse>>(`/lesson/${lessonId}/story`);
  return data.data || (data as any);
}

export async function getTest(lessonId: string): Promise<ISectionResponse> {
  const data = await apiCall<IApiResponse<ISectionResponse>>(`/lesson/${lessonId}/test`);
  return data.data || (data as any);
}

export async function completeSection(
  lessonId: string,
  sectionType: string,
  timeSpent = 180
): Promise<{ completedSections: string[]; completedLessons: string[]; streakDays?: number; totalTimeSpent?: number }> {
  const data = await apiCall<IApiResponse<any>>(`/lesson/${lessonId}/${sectionType}/complete`, 'POST', {
    completedAt: new Date().toISOString(),
    timeSpent,
  });
  return data.data || {};
}

export async function completeTestWithScore(
  lessonId: string,
  testScore: number,
  timeSpent = 300
): Promise<{ completedSections: string[]; completedLessons: string[]; streakDays?: number; totalTimeSpent?: number }> {
  const data = await apiCall<IApiResponse<any>>(`/lesson/${lessonId}/test/complete`, 'POST', {
    timeSpent,
    testScore,
  });
  return data.data || {};
}
