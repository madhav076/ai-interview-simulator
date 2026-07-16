import { api } from "@/lib/axios";

export interface DashboardSummary {
  totalInterviews: number;
  totalCodingInterviews: number;
  totalResumes: number;
  averageScore: number;
}

export interface RecentInterview {
  _id: string;
  role: string;
  topic: string;
  createdAt: string;
  score?: number;
}

export interface RecentCodingInterview {
  _id: string;
  title: string;
  difficulty: string;
  language: string;
  createdAt: string;
  score?: number;
}

export interface DashboardResponse {
  message: string;
  summary: DashboardSummary;
  recentInterviews: RecentInterview[];
  recentCodingInterviews: RecentCodingInterview[];
}

export const getDashboardSummary = async (): Promise<DashboardResponse> => {
  const response = await api.get("/api/dashboard");
  return response.data;
};
