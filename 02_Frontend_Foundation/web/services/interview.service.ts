import { api } from "@/lib/axios";
import type { AIInterview, Interview, InterviewDifficulty, Question } from "@/types";

// ─── Raw backend shapes ───────────────────────────────────────────────────────

type RawInterview = {
  id?: string;
  _id?: string;
  title?: string;
  jobRole?: string;
  difficulty?: string;
  numberOfQuestions?: number;
  questions?: Question[];
  score?: number;
  answeredQuestions?: number;
  totalQuestions?: number;
  createdAt?: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toId(raw: RawInterview): string {
  return (raw.id ?? raw._id ?? "") as string;
}

function toAIInterview(raw: RawInterview): AIInterview {
  return {
    id: toId(raw),
    title: raw.title ?? "",
    jobRole: raw.jobRole ?? "",
    difficulty: (raw.difficulty as InterviewDifficulty) ?? "Easy",
    numberOfQuestions: raw.numberOfQuestions ?? 0,
    questions: raw.questions ?? [],
    score: raw.score ?? 0,
    createdAt: raw.createdAt ?? new Date().toISOString(),
  };
}

// ─── Interview CRUD ───────────────────────────────────────────────────────────

/**
 * Create a new interview session.
 * POST /api/interview/create
 * Body: { jobRole, difficulty, numberOfQuestions }
 * Returns: { interview: RawInterview }
 */
export async function createInterview(
  jobRole: string,
  difficulty: InterviewDifficulty,
  numberOfQuestions: number,
): Promise<AIInterview> {
  const { data } = await api.post<{ interview: RawInterview }>(
    "/api/interview/create",
    { jobRole, difficulty, numberOfQuestions },
  );
  return toAIInterview(data.interview);
}

/**
 * Get all interviews for the logged-in user.
 * GET /api/interview
 * Returns: { interviews: RawInterview[] }
 */
export async function getInterviewHistory(): Promise<AIInterview[]> {
  const { data } = await api.get<{ interviews: RawInterview[] }>(
    "/api/interview",
  );
  return (data.interviews ?? []).map(toAIInterview);
}

/**
 * Get a single interview by ID.
 * GET /api/interview/:id
 * Returns: { interview: RawInterview }
 */
export async function getInterviewById(id: string): Promise<AIInterview> {
  const { data } = await api.get<{ interview: RawInterview }>(
    `/api/interview/${id}`,
  );
  return toAIInterview(data.interview);
}

/**
 * Delete an interview session.
 * DELETE /api/interview/:id
 */
export async function deleteInterview(id: string): Promise<void> {
  await api.delete(`/api/interview/${id}`);
}

// ─── AI Question Generation ───────────────────────────────────────────────────

/**
 * Trigger Gemini AI to generate questions for an existing interview.
 * POST /api/ai/generate
 * Body: { interviewId }
 * Returns: { interviewId, questions: Question[] }
 */
export async function generateQuestions(
  interviewId: string,
): Promise<Question[]> {
  const { data } = await api.post<{ questions: Question[] }>(
    "/api/ai/generate",
    { interviewId },
  );
  return data.questions ?? [];
}

/**
 * Fetch already-generated questions for an interview.
 * GET /api/ai/questions/:interviewId
 * Returns: { interviewId, questions: Question[] }
 */
export async function getQuestions(interviewId: string): Promise<Question[]> {
  const { data } = await api.get<{ questions: Question[] }>(
    `/api/ai/questions/${interviewId}`,
  );
  return data.questions ?? [];
}

// ─── Answer Submission ────────────────────────────────────────────────────────

/**
 * Submit the user's answer for a specific question.
 * POST /api/answer/submit
 * Body: { interviewId, questionId (number), answer }
 * Returns: { questions: Question[] }
 */
export async function submitAnswer(
  interviewId: string,
  questionId: number,
  answer: string,
): Promise<Question[]> {
  const { data } = await api.post<{ questions: Question[] }>(
    "/api/answer/submit",
    { interviewId, questionId, answer },
  );
  return data.questions ?? [];
}

/**
 * Get all submitted answers for an interview.
 * GET /api/answer/:interviewId
 * Returns: { answers: { questionId, questionText, userAnswer }[] }
 */
export async function getAnswers(
  interviewId: string,
): Promise<{ questionId: number; questionText: string; userAnswer: string | null }[]> {
  const { data } = await api.get<{
    answers: { questionId: number; questionText: string; userAnswer: string | null }[];
  }>(`/api/answer/${interviewId}`);
  return data.answers ?? [];
}

// ─── Legacy aliases (kept for backward compat) ───────────────────────────────

/** @deprecated Use createInterview instead. */
export async function startInterview(
  config: Record<string, unknown>,
): Promise<Interview> {
  const result = await createInterview(
    config.jobRole as string,
    (config.difficulty as InterviewDifficulty) ?? "Easy",
    (config.numberOfQuestions as number) ?? 5,
  );
  return {
    id: result.id,
    type: "behavioral",
    status: "in-progress",
    score: result.score,
  };
}

/** @deprecated Use deleteInterview instead. */
export async function endInterview(id: string): Promise<void> {
  return deleteInterview(id);
}
