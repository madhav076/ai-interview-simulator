// ─── User Types ──────────────────────────────────────────

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
};

// ─── Resume Types ────────────────────────────────────────

export type Resume = {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  parsedData?: Record<string, unknown>;
};

// ─── Interview Types ─────────────────────────────────────

export type InterviewType = "behavioral" | "technical" | "hr";
export type InterviewStatus = "pending" | "in-progress" | "completed";
/** Must match backend enum exactly (capital first letter). */
export type InterviewDifficulty = "Easy" | "Medium" | "Hard";

export type Interview = {
  id: string;
  type: InterviewType;
  status: InterviewStatus;
  startedAt?: string;
  completedAt?: string;
  score?: number;
};

/** A single question as stored in the backend Interview.questions array. */
export type Question = {
  id: number;
  text: string;
  type: "technical" | "behavioral";
  userAnswer?: string;
};

/** Full AI Interview record returned from the backend. */
export type AIInterview = {
  id: string;
  title: string;
  jobRole: string;
  difficulty: InterviewDifficulty;
  numberOfQuestions: number;
  questions: Question[];
  score: number;
  createdAt: string;
};

// ─── Coding Types ────────────────────────────────────────

export type Difficulty = "easy" | "medium" | "hard";

export type CodingChallenge = {
  id: string;
  title: string;
  difficulty: Difficulty;
  language: string;
  completedAt?: string;
};

// ─── Report Types ────────────────────────────────────────

export type Report = {
  id: string;
  interviewId: string;
  generatedAt: string;
  overallScore: number;
  summary: string;
};

// ─── Analytics Types ─────────────────────────────────────

export type PerformanceStats = {
  totalInterviews: number;
  averageScore: number;
  totalCodingProblems: number;
  improvementRate: number;
};

// ─── Theme Types ─────────────────────────────────────────

export type Theme = "light" | "dark" | "system";
