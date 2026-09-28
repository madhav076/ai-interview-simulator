"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout";
import {
  Card,
  CardBody,
  Badge,
  Button,
  Spinner,
  Alert,
} from "@/components/ui";
import { Code, CheckCircle, Play, Save, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Info, Terminal } from "lucide-react";
import {
  createCodingInterview,
  submitCodingSolution,
  runTests,
  type CodingQuestion,
  type CodingInterviewRecord,
} from "@/services/coding.service";

const LANGUAGES = ["Python", "JavaScript", "TypeScript", "Java"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

type DifficultyType = (typeof DIFFICULTIES)[number];

function sanitizeErrorMessage(err: unknown): string {
  if (!err) return "Failed to start coding interview. Please try again.";
  let msg = "";
  if (typeof err === "object" && err !== null) {
    const axiosErr = err as { response?: { data?: { message?: string; error?: string } }; message?: string };
    msg = axiosErr.response?.data?.message || axiosErr.response?.data?.error || axiosErr.message || "";
  } else {
    msg = String(err);
  }

  // Defensively parse stringified JSON if raw provider error payload was present
  if (msg.trim().startsWith("{") && msg.trim().endsWith("}")) {
    try {
      const parsed = JSON.parse(msg.trim());
      if (parsed?.error?.message) {
        msg = parsed.error.message;
      } else if (parsed?.message) {
        msg = parsed.message;
      }
    } catch {
      // ignore
    }
  }

  const lower = msg.toLowerCase();
  if (lower.includes("503") || lower.includes("unavailable") || lower.includes("high demand") || lower.includes("busy")) {
    return "The AI service is temporarily busy due to high demand. Please try again in a few moments.";
  }
  if (lower.includes("429") || lower.includes("rate limit") || lower.includes("quota") || lower.includes("resource_exhausted")) {
    return "AI service request limit reached. Please wait a moment and try again.";
  }
  if (lower.includes("timeout") || lower.includes("fetch failed") || lower.includes("network")) {
    return "The connection timed out while generating challenges. Please try again.";
  }

  return msg.length > 250 ? "AI service is temporarily busy. Please try again." : msg;
}

export default function CodingInterviewPage() {
  // View states: 'setup' | 'generating' | 'session' | 'complete'
  const [view, setView] = useState<"setup" | "generating" | "session" | "complete">("setup");

  // Setup form states
  const [selectedLanguage, setSelectedLanguage] = useState("JavaScript");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyType>("Medium");
  const [numQuestions, setNumQuestions] = useState(1);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [generatingMessage, setGeneratingMessage] = useState("Designing test suites and compiling starter boilerplate code templates...");
  const [isRetrying, setIsRetrying] = useState(false);

  // Active session states
  const [codingInterview, setCodingInterview] = useState<CodingInterviewRecord | null>(null);
  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editorCode, setEditorCode] = useState("");
  
  // Interaction states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Test Run Results
  const [testResults, setTestResults] = useState<Array<{ input: string; expected: string; actual: string; passed: boolean }> | null>(null);
  const [runPassed, setRunPassed] = useState<boolean | null>(null);

  // Completed stats
  const [submittedSet, setSubmittedSet] = useState<Set<number>>(new Set());

  const currentChallenge: CodingQuestion | undefined = questions[currentIndex];

  // Action: Start Interview with auto-retry feedback and fallback
  const handleStartInterview = async () => {
    setView("generating");
    setSetupError(null);
    setIsRetrying(false);
    setGeneratingMessage("Designing test suites and compiling starter boilerplate code templates...");

    const maxFrontendAttempts = 2;
    for (let attempt = 1; attempt <= maxFrontendAttempts; attempt++) {
      try {
        if (attempt > 1) {
          setIsRetrying(true);
          setGeneratingMessage("AI service is temporarily busy. Retrying...");
        }

        const result = await createCodingInterview(
          selectedLanguage,
          selectedDifficulty,
          numQuestions
        );

        setCodingInterview(result);
        setQuestions(result.questions);
        setCurrentIndex(0);
        setEditorCode(result.questions[0]?.codeTemplate || "");
        setSubmittedSet(new Set());
        setIsRetrying(false);
        setView("session");
        return;
      } catch (err: unknown) {
        console.warn(`[CodingInterviewPage] Generation attempt ${attempt} failed:`, err);
        if (attempt < maxFrontendAttempts) {
          setIsRetrying(true);
          setGeneratingMessage("AI service is temporarily busy. Retrying...");
          await new Promise((res) => setTimeout(res, 2000));
        } else {
          setIsRetrying(false);
          setSetupError(sanitizeErrorMessage(err));
          setView("setup");
        }
      }
    }
  };

  // Action: Switch Question
  const handleSwitchQuestion = (index: number) => {
    setCurrentIndex(index);
    setEditorCode(questions[index]?.userCode || questions[index]?.codeTemplate || "");
    setTestResults(null);
    setRunPassed(null);
    setSuccessMsg(null);
    setFeedbackError(null);
  };

  // Action: Run Test Cases
  const handleRunCode = async () => {
    if (!currentChallenge) return;
    setIsRunningTests(true);
    setFeedbackError(null);
    setSuccessMsg(null);
    try {
      const result = await runTests(
        codingInterview?.id || "",
        editorCode,
        currentChallenge.testCases
      );
      setTestResults(result.results);
      setRunPassed(result.success);
      if (result.success) {
        setSuccessMsg("All sample test cases passed!");
      } else {
        setFeedbackError("Some test cases failed. Please check your logic.");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setFeedbackError(error.response?.data?.message || (err as Error)?.message || "Failed to run test cases.");
    } finally {
      setIsRunningTests(false);
    }
  };

  // Action: Submit Code
  const handleSubmitCode = async () => {
    if (!codingInterview || !currentChallenge) return;
    setIsSubmitting(true);
    setFeedbackError(null);
    setSuccessMsg(null);
    try {
      await submitCodingSolution(
        codingInterview.id,
        currentChallenge.id,
        editorCode
      );

      // Save code locally in questions state
      const updatedQuestions = [...questions];
      updatedQuestions[currentIndex].userCode = editorCode;
      setQuestions(updatedQuestions);

      const newSubmitted = new Set(submittedSet);
      newSubmitted.add(currentChallenge.id);
      setSubmittedSet(newSubmitted);

      setSuccessMsg("Solution submitted successfully!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setFeedbackError(
        error?.response?.data?.message || error?.message || "Failed to submit coding solution."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset page
  const handleReset = () => {
    setView("setup");
    setCodingInterview(null);
    setQuestions([]);
    setCurrentIndex(0);
    setEditorCode("");
    setTestResults(null);
    setRunPassed(null);
    setSuccessMsg(null);
    setFeedbackError(null);
    setSubmittedSet(new Set());
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Code className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              Coding Interview
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">
            Solve coding challenges and improve your problem-solving skills under real conditions.
          </p>
        </div>
        
        {view !== "setup" && view !== "generating" && (
          <div className="mt-4 md:mt-0">
            <Button variant="outline" onClick={handleReset} className="text-xs py-1.5 px-3">
              New Assessment
            </Button>
          </div>
        )}
      </div>

      {/* --- SETUP VIEW --- */}
      {view === "setup" && (
        <div className="mt-8 space-y-6 max-w-2xl animate-[fade-in_0.3s_ease-out]">
          <Card>
            <CardBody className="space-y-6 p-6">
              {setupError && (
                <div className="space-y-3">
                  <Alert variant="error">{setupError}</Alert>
                  <div className="flex justify-start">
                    <Button
                      variant="outline"
                      onClick={handleStartInterview}
                      className="gap-2 px-4 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
                    >
                      <RefreshCw size={13} /> Try Again
                    </Button>
                  </div>
                </div>
              )}

              {/* Language Selection */}
              <div className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Select Programming Language</span>
                <div className="flex gap-2.5 flex-wrap">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLanguage(lang)}
                      className={`rounded-lg border px-4 py-2 text-xs font-bold transition-all duration-300 ${
                        selectedLanguage === lang
                          ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/15 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/10"
                          : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Select Difficulty</span>
                <div className="flex gap-2.5 flex-wrap">
                  {DIFFICULTIES.map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`rounded-lg border px-4 py-2 text-xs font-bold transition-all duration-300 ${
                        selectedDifficulty === diff
                          ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/15 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/10"
                          : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900"
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of challenges selection */}
              <div className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Number of Challenges</span>
                <div className="flex gap-2.5">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNumQuestions(num)}
                      className={`w-12 h-10 rounded-lg border text-xs font-bold transition-all duration-300 ${
                        numQuestions === num
                          ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/15 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/10"
                          : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </CardBody>
            <CardBody className="pt-4 p-6 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
              <Button variant="primary" onClick={handleStartInterview} className="gap-2 px-5 py-2 text-sm">
                <Play size={14} /> Start Coding Assessment
              </Button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* --- GENERATING VIEW --- */}
      {view === "generating" && (
        <div className="mt-20 flex flex-col items-center gap-4 text-center justify-center py-12 animate-[fade-in_0.3s_ease-out]">
          <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-full relative">
            <div className="absolute inset-0 rounded-full border border-indigo-500 animate-ping opacity-25"></div>
            <Code className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mt-2">
            {isRetrying ? "AI service is temporarily busy. Retrying..." : "Generating challenges using Gemini AI..."}
          </h2>
          <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-xs leading-relaxed">
            {generatingMessage}
          </p>
        </div>
      )}

      {/* --- SESSION VIEW --- */}
      {view === "session" && codingInterview && currentChallenge && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-[fade-in_0.3s_ease-out]">
          
          {/* Left panel: Problem Description */}
          <div className="space-y-5">
            <Card>
              <CardBody className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    CHALLENGE {currentIndex + 1} OF {questions.length}
                  </span>
                  <Badge variant={selectedDifficulty === "Easy" ? "success" : selectedDifficulty === "Medium" ? "warning" : "error"}>
                    {currentChallenge.difficulty || selectedDifficulty}
                  </Badge>
                </div>
                
                <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-50">
                  {currentChallenge.title}
                </h2>
                
                <div className="text-xs leading-relaxed text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-950/30 border border-slate-100 dark:border-zinc-850 rounded-xl p-4 whitespace-pre-line font-normal">
                  {currentChallenge.description}
                </div>

                {/* Example Test Cases */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2.5 flex items-center gap-1.5">
                    <Info size={14} className="text-indigo-600 dark:text-indigo-400" /> Examples
                  </h3>
                  <div className="space-y-2">
                    {currentChallenge.testCases.slice(0, 2).map((tc, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-800/60 rounded-lg p-3 font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                        <div><span className="font-semibold text-slate-400">Input:</span> {tc.input}</div>
                        <div className="mt-1"><span className="font-semibold text-slate-400">Output:</span> {tc.output}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Test Run Results */}
            {testResults && (
              <Card className="border border-indigo-100/50 dark:border-indigo-950/5">
                <CardBody className="space-y-3.5 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-2">
                      <Terminal size={14} className="text-indigo-600 dark:text-indigo-400" /> Test Run Results
                    </h3>
                    <Badge variant={runPassed ? "success" : "error"}>
                      {runPassed ? "PASSED" : "FAILED"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {testResults.map((tr, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border text-[11px] font-mono ${
                        tr.passed ? "bg-emerald-50/50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/10 dark:border-emerald-900/30 dark:text-emerald-300" : "bg-red-50/50 border-red-100 text-red-800 dark:bg-red-950/10 dark:border-red-900/30 dark:text-red-300"
                      }`}>
                        <div>Input: {tr.input}</div>
                        <div>Expected Output: {tr.expected}</div>
                        <div>Actual Output: {tr.actual}</div>
                        <div className="mt-1.5 font-bold flex items-center gap-1">
                          {tr.passed ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                          {tr.passed ? "Passed" : "Failed"}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Right panel: Editor */}
          <div className="space-y-5">
            <Card className="flex flex-col">
              <CardBody className="flex flex-col p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    <span>Code Editor</span>
                    <Badge variant="default" className="text-[10px] px-1.5 py-0">{selectedLanguage}</Badge>
                  </div>
                  {submittedSet.has(currentChallenge.id) && (
                    <Badge variant="success" className="flex items-center gap-1">
                      <CheckCircle size={12} /> Submitted
                    </Badge>
                  )}
                </div>

                {successMsg && <Alert variant="success">{successMsg}</Alert>}
                {feedbackError && <Alert variant="error">{feedbackError}</Alert>}

                {/* Textarea styled like an IDE */}
                <div className="relative border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm bg-zinc-950">
                  {/* Editor Header decoration */}
                  <div className="flex items-center justify-between bg-zinc-900 px-4 py-2 border-b border-zinc-800">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest font-mono">
                      {selectedLanguage === "Python" ? "solution.py" : selectedLanguage === "TypeScript" ? "solution.ts" : selectedLanguage === "Java" ? "Solution.java" : "solution.js"}
                    </span>
                  </div>
                  
                  <div className="flex min-h-[350px]">
                    {/* Line numbers mock decoration */}
                    <div className="bg-zinc-900/50 border-r border-zinc-800 text-zinc-600 font-mono text-xs select-none py-4 px-2.5 text-right w-10 flex flex-col gap-0.5 leading-6">
                      {Array.from({ length: 15 }, (_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>
                    
                    <textarea
                      value={editorCode}
                      onChange={(e) => setEditorCode(e.target.value)}
                      className="w-full h-full min-h-[350px] font-mono text-xs p-4 bg-transparent text-emerald-400 focus:text-emerald-300 dark:text-emerald-400 dark:focus:text-emerald-300 focus:outline-none resize-none leading-6 placeholder:text-zinc-700"
                      placeholder="// write your code here..."
                      disabled={isSubmitting || isRunningTests}
                    />
                  </div>
                </div>

                {/* Question Switcher / Action buttons */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800/60 flex-wrap">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={currentIndex === 0}
                      onClick={() => handleSwitchQuestion(currentIndex - 1)}
                      className="text-xs py-1.5 px-3"
                    >
                      <ChevronLeft size={14} /> Prev
                    </Button>
                    <Button
                      variant="outline"
                      disabled={currentIndex === questions.length - 1}
                      onClick={() => handleSwitchQuestion(currentIndex + 1)}
                      className="text-xs py-1.5 px-3"
                    >
                      Next <ChevronRight size={14} />
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={handleRunCode}
                      disabled={isRunningTests || isSubmitting}
                      className="flex items-center gap-1.5 text-xs py-1.5 px-3.5"
                    >
                      {isRunningTests ? <Spinner size="small" /> : <Play size={12} />}
                      Run Code
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSubmitCode}
                      disabled={isSubmitting || isRunningTests}
                      className="flex items-center gap-1.5 text-xs py-1.5 px-3.5"
                    >
                      {isSubmitting ? <Spinner size="small" /> : <Save size={12} />}
                      Submit Solution
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Complete Assessment Trigger */}
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => setView("complete")}
                disabled={submittedSet.size === 0}
                className="w-full sm:w-auto text-xs py-2 px-5"
              >
                Complete Assessment ({submittedSet.size}/{questions.length} submitted)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- COMPLETE assessment VIEW --- */}
      {view === "complete" && codingInterview && (
        <div className="mt-12 flex flex-col items-center gap-5 text-center max-w-md mx-auto animate-[fade-in_0.3s_ease-out]">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-zinc-50">
              Assessment Completed!
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
              Your solutions have been logged for performance evaluations.
            </p>
          </div>

          <Card className="w-full">
            <CardBody className="space-y-4 p-6">
              <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-zinc-800/80 pb-2.5">
                <span className="font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Language</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{codingInterview.programmingLanguage}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-zinc-800/80 pb-2.5">
                <span className="font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Difficulty</span>
                <Badge variant={selectedDifficulty === "Easy" ? "success" : selectedDifficulty === "Medium" ? "warning" : "error"}>
                  {codingInterview.difficulty}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-slate-100 dark:border-zinc-800/80 pb-2.5">
                <span className="font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Total Challenges</span>
                <span className="font-bold text-slate-800 dark:text-zinc-200">{questions.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-1">
                <span className="font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Solutions Submitted</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{submittedSet.size} / {questions.length}</span>
              </div>
            </CardBody>
          </Card>

          <Button variant="primary" onClick={handleReset} className="w-full mt-4 text-xs py-2 px-5">
            <RefreshCw className="w-4 h-4 mr-2" /> Start New Assessment
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
}
