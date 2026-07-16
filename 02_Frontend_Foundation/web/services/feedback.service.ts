import { api } from "@/lib/axios";

export type EvaluationResult = {
  interviewId: string;
  score: number;
  totalQuestions: number;
  answeredQuestions: number;
};

export type FeedbackResult = {
  interviewId: string;
  score: number;
  feedback: string;
};

/** Evaluate user's answers for an interview to calculate final score. */
export async function evaluateInterview(
  interviewId: string
): Promise<EvaluationResult> {
  const { data } = await api.post<EvaluationResult>("/api/evaluation/evaluate", {
    interviewId,
  });
  return data;
}

/** Get saved evaluation details for an interview. */
export async function getEvaluation(
  interviewId: string
): Promise<EvaluationResult> {
  const { data } = await api.get<EvaluationResult>(
    `/api/evaluation/${interviewId}`
  );
  return data;
}

/** Generate AI feedback for a completed interview based on score. */
export async function generateFeedback(
  interviewId: string
): Promise<FeedbackResult> {
  const { data } = await api.post<FeedbackResult>("/api/feedback/generate", {
    interviewId,
  });
  return data;
}

/** Get saved AI feedback details for an interview. */
export async function getFeedback(
  interviewId: string
): Promise<FeedbackResult> {
  const { data } = await api.get<FeedbackResult>(
    `/api/feedback/${interviewId}`
  );
  return data;
}
