export const APP_NAME = "AI Interview Simulator";
export const APP_VERSION = "0.1.0";
export const APP_DESCRIPTION =
  "Practice interviews with AI-powered feedback";

export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  FEATURES: "/features",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  RESUME: "/dashboard/resume",
  AI_INTERVIEW: "/dashboard/ai-interview",
  CODING_INTERVIEW: "/dashboard/coding-interview",
  REPORTS: "/dashboard/reports",
  ANALYTICS: "/dashboard/analytics",
  SETTINGS: "/dashboard/settings",
} as const;

export const LIMITS = {
  MAX_RESUME_SIZE_MB: 10,
  MAX_INTERVIEW_DURATION_MINUTES: 60,
  MAX_CODE_LENGTH: 10000,
} as const;
