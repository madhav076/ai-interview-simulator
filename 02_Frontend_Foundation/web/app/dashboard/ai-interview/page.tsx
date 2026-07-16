"use client";

import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/layout";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Spinner,
  Textarea,
} from "@/components/ui";
import {
  MessageSquare,
  Brain,
  Code,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  RotateCcw,
  Clock,
  Sparkles,
  Trophy,
  History,
  Play,
  ClipboardList
} from "lucide-react";
import {
  createInterview,
  generateQuestions,
  getInterviewHistory,
  submitAnswer,
} from "@/services/interview.service";
import {
  evaluateInterview,
  generateFeedback,
} from "@/services/feedback.service";
import type { AIInterview, InterviewDifficulty, Question } from "@/types";
import { Input } from "@/components/ui/Input";

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTIES: { label: string; value: InterviewDifficulty }[] = [
  { label: "Easy", value: "Easy" },
  { label: "Medium", value: "Medium" },
  { label: "Hard", value: "Hard" },
];

const QUESTION_COUNTS = [3, 5, 7, 10];

// ─── View states ─────────────────────────────────────────────────────────────
type View = "setup" | "generating" | "session" | "complete" | "history";

// ─── Helper: extract error message ───────────────────────────────────────────
function extractError(err: unknown): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data
      ?.message ?? "Something went wrong. Please try again."
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AIInterviewPage() {
  const [view, setView] = useState<View>("setup");

  // ── Setup form state ──────────────────────────────────────────────────────
  const [jobRole, setJobRole] = useState("");
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("Medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [setupError, setSetupError] = useState<string | null>(null);

  // ── Active session state ──────────────────────────────────────────────────
  const [interview, setInterview] = useState<AIInterview | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draftAnswer, setDraftAnswer] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answeredSet, setAnsweredSet] = useState<Set<number>>(new Set());

  // ── History state ─────────────────────────────────────────────────────────
  const [history, setHistory] = useState<AIInterview[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // ── Evaluation & Feedback states ──────────────────────────────────────────
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const currentQuestion: Question | undefined = questions[currentIndex];
  const totalAnswered = answeredSet.size;
  const progressPct = questions.length > 0 ? (totalAnswered / questions.length) * 100 : 0;

  function resetToSetup() {
    setView("setup");
    setInterview(null);
    setQuestions([]);
    setCurrentIndex(0);
    setDraftAnswer("");
    setSetupError(null);
    setSubmitError(null);
    setAnsweredSet(new Set());
    setFinalScore(null);
    setAiFeedback(null);
    setEvaluationError(null);
    setIsEvaluating(false);
  }

  // ─── Action: Start Interview ──────────────────────────────────────────────

  async function handleStart() {
    setSetupError(null);
    if (!jobRole.trim()) {
      setSetupError("Please enter a job role.");
      return;
    }

    setView("generating");
    try {
      const created = await createInterview(jobRole.trim(), difficulty, numQuestions);
      const qs = await generateQuestions(created.id);
      const withQuestions: AIInterview = { ...created, questions: qs };
      setInterview(withQuestions);
      setQuestions(qs);
      setCurrentIndex(0);
      setDraftAnswer(qs[0]?.userAnswer ?? "");
      setAnsweredSet(new Set());
      setView("session");
    } catch (err) {
      setSetupError(extractError(err));
      setView("setup");
    }
  }

  // ─── Action: Navigate Questions ───────────────────────────────────────────

  function goTo(index: number) {
    setCurrentIndex(index);
    setDraftAnswer(questions[index]?.userAnswer ?? "");
    setSubmitError(null);
  }

  // ─── Action: Submit Answer ────────────────────────────────────────────────

  async function handleSubmitAnswer() {
    if (!interview || !currentQuestion) return;
    if (!draftAnswer.trim()) {
      setSubmitError("Please write your answer before submitting.");
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const updatedQuestions = await submitAnswer(
        interview.id,
        currentQuestion.id,
        draftAnswer.trim(),
      );

      setQuestions(updatedQuestions);
      const newAnswered = new Set(answeredSet);
      newAnswered.add(currentQuestion.id);
      setAnsweredSet(newAnswered);

      if (currentIndex < questions.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setDraftAnswer(updatedQuestions[nextIndex]?.userAnswer ?? "");
      }
    } catch (err) {
      setSubmitError(extractError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  // ─── Action: Complete Interview ───────────────────────────────────────────

  async function handleComplete() {
    if (!interview) return;
    setIsEvaluating(true);
    setEvaluationError(null);
    setView("complete");
    try {
      const evalRes = await evaluateInterview(interview.id);
      setFinalScore(evalRes.score);

      const feedbackRes = await generateFeedback(interview.id);
      setAiFeedback(feedbackRes.feedback);
    } catch (err) {
      setEvaluationError(extractError(err));
    } finally {
      setIsEvaluating(false);
    }
  }

  // ─── Action: Load History ─────────────────────────────────────────────────

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const list = await getInterviewHistory();
      setHistory(list);
      setView("history");
    } catch (err) {
      setHistoryError(extractError(err));
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              AI Interview
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">
            Practice with AI-powered mock interviews tailored to your target role.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-2">
          {view !== "setup" && view !== "history" && (
            <Button variant="outline" onClick={resetToSetup} className="text-xs py-1.5 px-3">
              New Interview
            </Button>
          )}
          {view === "setup" && (
            <Button variant="outline" onClick={loadHistory} disabled={historyLoading} className="gap-2 text-xs py-1.5 px-3">
              {historyLoading ? <Spinner size="small" /> : <History size={14} />}
              View History
            </Button>
          )}
        </div>
      </div>

      {/* ── SETUP VIEW ─────────────────────────────────────────────────── */}
      {view === "setup" && (
        <div className="mt-8 space-y-8 animate-[fade-in_0.3s_ease-out]">
          {/* Interview type cards */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4 px-1">Choose Interview Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Card className="hover:border-indigo-500/30 transition-all duration-300">
                <CardBody className="p-5 flex flex-col justify-between min-h-48">
                  <div>
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg w-8 h-8 flex items-center justify-center mb-4">
                      <Brain size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Behavioral Interview</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      Practice answering behavioral questions using the STAR method with AI-generated scenarios.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Badge variant="default">Recommended</Badge>
                  </div>
                </CardBody>
              </Card>

              <Card className="hover:border-indigo-500/30 transition-all duration-300">
                <CardBody className="p-5 flex flex-col justify-between min-h-48">
                  <div>
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg w-8 h-8 flex items-center justify-center mb-4">
                      <Code size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Technical Interview</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      Test your knowledge of technical concepts, system design, and domain-specific expertise.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Badge variant="warning">Advanced</Badge>
                  </div>
                </CardBody>
              </Card>

              <Card className="hover:border-indigo-500/30 transition-all duration-300">
                <CardBody className="p-5 flex flex-col justify-between min-h-48">
                  <div>
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg w-8 h-8 flex items-center justify-center mb-4">
                      <Briefcase size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">HR Interview</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      Prepare for HR rounds covering salary expectations, culture fit, and career aspirations.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Badge variant="success">Beginner Friendly</Badge>
                  </div>
                </CardBody>
              </Card>
            </div>
          </section>

          {/* Setup form */}
          <section className="max-w-2xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4 px-1">Configure Your Session</h2>
            <Card>
              <CardBody className="space-y-6 p-6">
                {setupError && (
                  <Alert variant="error">{setupError}</Alert>
                )}

                <Input
                  label="Job Role"
                  name="jobRole"
                  type="text"
                  placeholder="e.g. Frontend Developer, Data Scientist, Product Manager"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  className="w-full"
                />

                {/* Difficulty selector */}
                <div className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">Difficulty Level</span>
                  <div className="flex gap-3">
                    {DIFFICULTIES.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setDifficulty(d.value)}
                        className={`flex-1 rounded-lg border py-2 text-xs font-bold transition-all duration-300 ${
                          difficulty === d.value
                            ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/15 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/10"
                            : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of questions selector */}
                <div className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                    Number of Questions
                  </span>
                  <div className="flex gap-3">
                    {QUESTION_COUNTS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNumQuestions(n)}
                        className={`flex-1 rounded-lg border py-2 text-xs font-bold transition-all duration-300 ${
                          numQuestions === n
                            ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/15 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/10"
                            : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </CardBody>
              <CardFooter className="flex justify-end p-6">
                <Button variant="primary" onClick={handleStart} className="gap-2 px-5 py-2 text-sm">
                  <Play size={14} /> Start Interview
                </Button>
              </CardFooter>
            </Card>
          </section>
        </div>
      )}

      {/* ── GENERATING VIEW ────────────────────────────────────────────── */}
      {view === "generating" && (
        <div className="mt-20 flex flex-col items-center gap-4 text-center justify-center py-12 animate-[fade-in_0.3s_ease-out]">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-full relative">
            <div className="absolute inset-0 rounded-full border border-indigo-500 animate-ping opacity-25"></div>
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-2">
            Generating your questions with Gemini AI…
          </h2>
          <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-xs leading-relaxed">
            Gemini is analyzing the job role and tailoring a custom scenario based interview path.
          </p>
        </div>
      )}

      {/* ── SESSION VIEW ───────────────────────────────────────────────── */}
      {view === "session" && interview && currentQuestion && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-6 items-start animate-[fade-in_0.3s_ease-out]">
          {/* Question navigator vertical layout */}
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 px-1">Navigator</span>
            <div className="grid grid-cols-5 lg:grid-cols-3 gap-2 bg-white dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-800 p-3.5 rounded-xl shadow-sm">
              {questions.map((q, i) => {
                const isCurrent = i === currentIndex;
                const isAnswered = answeredSet.has(q.id);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => goTo(i)}
                    className={`h-9 w-9 rounded-lg text-xs font-bold transition-all border ${
                      isCurrent
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                        : isAnswered
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30"
                          : "bg-white dark:bg-zinc-950 text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900"
                    }`}
                    aria-label={`Go to question ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question card */}
          <div className="space-y-5">
            {/* Header progress info */}
            <div className="flex items-center justify-between flex-wrap gap-2 px-1">
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-zinc-500">
                <ClipboardList size={14} />
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span>•</span>
                <span>{totalAnswered} / {questions.length} Completed</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="default">{interview.jobRole}</Badge>
                <Badge variant={currentQuestion.type === "technical" ? "warning" : "default"}>
                  {currentQuestion.type}
                </Badge>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full rounded-full bg-slate-100 dark:bg-zinc-900 h-1.5 overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <Card>
              <CardBody className="p-6 space-y-5">
                <div className="p-4 bg-slate-50/50 dark:bg-zinc-950/30 rounded-xl border border-slate-100 dark:border-zinc-800/40">
                  <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100 leading-relaxed">
                    {currentQuestion.text}
                  </p>
                </div>

                {submitError && (
                  <Alert variant="error">{submitError}</Alert>
                )}

                <Textarea
                  name="answer"
                  label="Your Response"
                  placeholder="Draft your response here. Try to use structured details (e.g. STAR method for behavioral)..."
                  rows={6}
                  value={draftAnswer}
                  onChange={(e) => setDraftAnswer(e.target.value)}
                  disabled={isSubmitting}
                  className="text-sm w-full"
                />

                {/* Answered indicator */}
                {answeredSet.has(currentQuestion.id) && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Response successfully saved. You can edit and update below.</span>
                  </div>
                )}
              </CardBody>
              
              <CardFooter className="flex items-center justify-between p-6 flex-wrap gap-4 border-t border-slate-100 dark:border-zinc-800/60">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => goTo(currentIndex - 1)}
                    disabled={currentIndex === 0 || isSubmitting}
                    className="gap-1 text-xs py-1.5 px-3"
                  >
                    <ChevronLeft size={14} /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => goTo(currentIndex + 1)}
                    disabled={currentIndex === questions.length - 1 || isSubmitting}
                    className="gap-1 text-xs py-1.5 px-3"
                  >
                    Next <ChevronRight size={14} />
                  </Button>
                </div>

                <div className="flex gap-2.5">
                  <Button
                    variant="secondary"
                    onClick={handleSubmitAnswer}
                    disabled={isSubmitting || !draftAnswer.trim()}
                    className="gap-2 text-xs py-1.5 px-3.5"
                  >
                    {isSubmitting ? <Spinner size="small" /> : null}
                    {answeredSet.has(currentQuestion.id) ? "Update Response" : "Save Response"}
                  </Button>

                  {totalAnswered > 0 && (
                    <Button variant="primary" onClick={handleComplete} className="text-xs py-1.5 px-3.5">
                      Finish Session
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {/* ── COMPLETE VIEW ──────────────────────────────────────────────── */}
      {view === "complete" && interview && (
        <div className="mt-8 max-w-2xl mx-auto animate-[fade-in_0.3s_ease-out] space-y-6">
          <Card className="text-center p-8 flex flex-col items-center gap-5">
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-zinc-50">
                Session Finished!
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                You resolved {answeredSet.size} of {questions.length} mock questions for the <span className="font-semibold text-indigo-600 dark:text-indigo-400">{interview.jobRole}</span> target role.
              </p>
            </div>

            {/* Answered vs Skipped counts */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-2">
              <div className="bg-slate-50 dark:bg-zinc-950/30 border border-slate-100 dark:border-zinc-800 p-4 rounded-xl">
                <p className="text-2xl font-black text-slate-900 dark:text-zinc-100">{answeredSet.size}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mt-0.5">Answered</p>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-950/30 border border-slate-100 dark:border-zinc-800 p-4 rounded-xl">
                <p className="text-2xl font-black text-slate-900 dark:text-zinc-100">{questions.length - answeredSet.size}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mt-0.5">Skipped</p>
              </div>
            </div>

            {/* AI Evaluation Loading */}
            {isEvaluating && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <Spinner size="medium" />
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold animate-pulse">Running AI evaluations and generating performance reports...</p>
              </div>
            )}

            {/* AI Evaluation Error */}
            {evaluationError && (
              <Alert variant="error" className="w-full mt-4">
                {evaluationError}
              </Alert>
            )}

            {/* AI Evaluation Results */}
            {!isEvaluating && !evaluationError && finalScore !== null && (
              <div className="w-full space-y-5 mt-4">
                {/* Circular Score representation */}
                <div className="flex flex-col items-center p-6 bg-indigo-50/10 dark:bg-indigo-950/5 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Trophy size={64} className="text-indigo-600" />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Aggregate Rating</span>
                  <p className="text-5xl font-black text-slate-900 dark:text-zinc-100 mt-2">{finalScore}<span className="text-lg font-bold text-slate-400">/100</span></p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-2.5 max-w-xs">
                    Score generated based on completeness and answer submissions (10 points per answer).
                  </p>
                </div>

                {aiFeedback && (
                  <div className="text-left space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> AI Feedback Summary
                    </h3>
                    <div className="text-xs leading-relaxed text-slate-700 dark:text-zinc-300 bg-slate-50/50 dark:bg-zinc-950/30 border border-slate-150 dark:border-zinc-800/80 rounded-xl p-4 whitespace-pre-line leading-relaxed font-normal">
                      {aiFeedback}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-6 justify-center">
              <Button variant="primary" onClick={resetToSetup} className="gap-2 text-xs py-1.5 px-3.5">
                <RotateCcw size={14} /> Start New
              </Button>
              <Button variant="secondary" onClick={loadHistory} className="text-xs py-1.5 px-3.5">
                Go to History
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── HISTORY VIEW ───────────────────────────────────────────────── */}
      {view === "history" && (
        <div className="mt-8 space-y-6 animate-[fade-in_0.3s_ease-out]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1">Past Sessions</h2>
            <Button variant="outline" onClick={resetToSetup} className="text-xs py-1.5 px-3">
              Back to Setup
            </Button>
          </div>

          {historyLoading && (
            <div className="flex justify-center py-12">
              <Spinner size="large" />
            </div>
          )}

          {historyError && (
            <Alert variant="error">{historyError}</Alert>
          )}

          {!historyLoading && !historyError && history.length === 0 && (
            <Card>
              <CardBody className="text-center py-12">
                <MessageSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-700 mb-3" />
                <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">No mock history found</p>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Generate your first mock session to review your results here.</p>
                <Button variant="primary" onClick={resetToSetup} className="mt-4 text-xs py-1.5 px-3.5">Start Now</Button>
              </CardBody>
            </Card>
          )}

          {!historyLoading && history.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((item) => (
                <Card key={item.id} className="hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                  <CardBody className="p-5 flex flex-col justify-between h-36">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-900 dark:text-zinc-100 truncate">
                          {item.title || item.jobRole}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{item.score || 0}</span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">rating</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-zinc-800/80 pt-3.5 mt-2">
                      <div className="flex gap-2">
                        <Badge variant="warning">{item.difficulty}</Badge>
                        <Badge variant="default">{item.numberOfQuestions} questions</Badge>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
