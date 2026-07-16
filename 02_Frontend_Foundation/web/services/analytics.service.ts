import { api } from "@/lib/axios";
import type { PerformanceStats } from "@/types";

type AnalyticsResponse = {
  analytics: {
    totalInterviews: number;
    totalCodingInterviews: number;
    totalResumes: number;
    averageInterviewScore: number;
    highestInterviewScore: number;
    interviewsCompletedThisMonth: number;
    codingInterviewsCompletedThisMonth: number;
    averageScoreThisMonth: number;
  };
};

/** Get overall performance statistics. */
export async function getPerformanceStats(): Promise<PerformanceStats> {
  const { data } = await api.get<AnalyticsResponse>("/api/analytics");
  const a = data.analytics;
  return {
    totalInterviews: a.totalInterviews + a.totalCodingInterviews,
    averageScore: a.averageInterviewScore,
    totalCodingProblems: a.totalCodingInterviews,
    improvementRate: 0, // Not calculated by the backend
  };
}

/** Get progress data — proxies to the same /api/analytics endpoint. */
export async function getProgressData(_timeRange: string): Promise<AnalyticsResponse["analytics"]> {
  const { data } = await api.get<AnalyticsResponse>("/api/analytics");
  return data.analytics;
}

/** Get interview performance trends — proxies to /api/analytics. */
export async function getInterviewTrends(): Promise<AnalyticsResponse["analytics"]> {
  const { data } = await api.get<AnalyticsResponse>("/api/analytics");
  return data.analytics;
}
