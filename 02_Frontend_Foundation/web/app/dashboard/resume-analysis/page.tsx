"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout";
import { Alert, Badge, Button, Card, CardBody, Input, Spinner } from "@/components/ui";
import { resumeService } from "@/services";
import type { Resume, ResumeAnalysis } from "@/types";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileCheck,
  FileText,
  Lightbulb,
  ListChecks,
  RotateCcw,
  ScanSearch,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";

const allowedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function ScoreCard({ label, value }: { label: string; value: number | null }) {
  return (
    <Card>
      <CardBody className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          {label}
        </p>
        <div className="mt-3 flex items-end gap-1">
          <span className="text-4xl font-black text-slate-900 dark:text-zinc-50">
            {value ?? "-"}
          </span>
          <span className="mb-1 text-sm font-semibold text-slate-400 dark:text-zinc-500">
            /100
          </span>
        </div>
      </CardBody>
    </Card>
  );
}

function AnalysisSection({
  icon,
  title,
  items,
  emptyText,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="text-indigo-600 dark:text-indigo-400">{icon}</span>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
          {title}
        </h2>
      </div>
      <Card>
        <CardBody className="p-5">
          {items.length ? (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-slate-600 dark:text-zinc-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 dark:text-zinc-400">{emptyText}</p>
          )}
        </CardBody>
      </Card>
    </section>
  );
}

export default function ResumeAnalysisPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [targetJobRole, setTargetJobRole] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResume = useCallback(async () => {
    setIsFetching(true);
    try {
      const list = await resumeService.getResumes();
      const latest = list[0] ?? null;
      setResume(latest);
      setAnalysis(latest?.analysis ?? null);
      setTargetJobRole(latest?.analysisTargetRole ?? "");
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchResume().catch(() => setIsFetching(false));
  }, [fetchResume]);

  async function uploadFile(file: File) {
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF or DOCX resume.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be 10 MB or less.");
      return;
    }

    setError(null);
    setIsUploading(true);
    setAnalysis(null);

    try {
      const uploaded = await resumeService.uploadResume(file);
      setResume(uploaded);
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Upload failed. Please try again.",
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function analyzeCurrentResume() {
    if (!resume) {
      setError("Upload a resume before running analysis.");
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const result = await resumeService.analyzeResume(resume.id, targetJobRole);
      setResume(result.resume);
      setAnalysis(result.analysis);
    } catch (err: unknown) {
      const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(
        typeof apiMessage === "string" && apiMessage.trim().length > 0 && !apiMessage.startsWith("{")
          ? apiMessage
          : "Resume analysis failed. Please try again.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-6 dark:border-zinc-800 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
              <ScanSearch className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              Resume Analysis
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">
            Upload a PDF or DOCX resume and get AI-backed scoring, recommendations, and an action plan.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="error" className="mt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="leading-normal">{error}</div>
            {resume && (
              <Button
                variant="secondary"
                className="w-fit shrink-0 self-start text-xs sm:self-auto"
                onClick={analyzeCurrentResume}
                disabled={isAnalyzing || isUploading}
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Try Again
              </Button>
            )}
          </div>
        </Alert>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) uploadFile(file);
        }}
        aria-label="Upload resume for analysis"
      />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <Card
            className={`border-2 border-dashed ${
              dragActive
                ? "border-indigo-600 bg-indigo-50/20 dark:border-indigo-500 dark:bg-indigo-950/10"
                : "border-slate-200 dark:border-zinc-800"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <CardBody className="flex flex-col items-center justify-center p-8 text-center">
              {isUploading ? (
                <>
                  <Spinner size="large" className="mb-4 text-indigo-600" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                    Uploading resume...
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-4 rounded-full bg-slate-50 p-3 text-slate-400 dark:bg-zinc-950/30 dark:text-zinc-600">
                    <Upload className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                    Upload Resume
                  </p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                    PDF or DOCX, up to 10 MB
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-6 px-4 py-1.5 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isAnalyzing}
                  >
                    Choose file
                  </Button>
                </>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Active Resume
              </p>
              {isFetching ? (
                <div className="mt-5 flex justify-center">
                  <Spinner size="medium" />
                </div>
              ) : resume ? (
                <div className="mt-4 flex items-start gap-3">
                  <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800 dark:text-zinc-200">
                      {resume.fileName}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400 dark:text-zinc-500">
                      Uploaded {new Date(resume.uploadedAt).toLocaleDateString("en-IN")}
                    </p>
                    {resume.analyzedAt && <Badge variant="success">Analyzed</Badge>}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500 dark:text-zinc-400">
                  No resume uploaded yet.
                </p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Target Job Role
                </label>
                <Input
                  value={targetJobRole}
                  onChange={(event) => setTargetJobRole(event.target.value)}
                  placeholder="e.g. Frontend Developer"
                  disabled={isAnalyzing}
                />
              </div>
              <Button
                className="w-full gap-2"
                onClick={analyzeCurrentResume}
                disabled={!resume || isUploading || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Spinner size="small" />
                    <span>Analyzing resume with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Analyze</span>
                  </>
                )}
              </Button>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <ScoreCard label="Overall Resume Score" value={analysis?.overallScore ?? null} />
            <ScoreCard label="ATS Compatibility" value={analysis?.atsCompatibilityScore ?? null} />
            <ScoreCard label="Job Match" value={analysis?.jobMatchScore ?? null} />
          </div>

          {!analysis ? (
            <Card>
              <CardBody className="flex flex-col items-center p-10 text-center">
                <FileText className="mb-3 h-9 w-9 text-slate-300 dark:text-zinc-700" />
                <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                  Upload Resume, Analyze, Show Score, Strengths, Weaknesses, Missing Skills,
                  Recommendations, Action Plan
                </p>
              </CardBody>
            </Card>
          ) : (
            <>
              <AnalysisSection
                icon={<ClipboardCheck className="h-4 w-4" />}
                title="Strengths"
                items={analysis.strengths}
                emptyText="No strengths were returned for this resume."
              />
              <AnalysisSection
                icon={<AlertTriangle className="h-4 w-4" />}
                title="Weaknesses"
                items={analysis.weaknesses}
                emptyText="No weaknesses were returned for this resume."
              />
              <AnalysisSection
                icon={<Target className="h-4 w-4" />}
                title="Missing Skills"
                items={analysis.missingRecommendedSkills}
                emptyText="No missing skills were returned for this resume."
              />
              <section>
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span className="text-indigo-600 dark:text-indigo-400">
                    <Lightbulb className="h-4 w-4" />
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    Project & Experience Quality
                  </h2>
                </div>
                <Card>
                  <CardBody className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm text-slate-600 dark:text-zinc-300">
                        {analysis.projectExperienceQuality.summary}
                      </p>
                      <Badge>{analysis.projectExperienceQuality.score}/100</Badge>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {analysis.projectExperienceQuality.suggestions.map((item) => (
                        <li key={item} className="text-sm text-slate-500 dark:text-zinc-400">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardBody>
                </Card>
              </section>
              <AnalysisSection
                icon={<Lightbulb className="h-4 w-4" />}
                title="Recommendations"
                items={analysis.improvementSuggestions}
                emptyText="No recommendations were returned for this resume."
              />
              <AnalysisSection
                icon={<ListChecks className="h-4 w-4" />}
                title="Action Plan"
                items={analysis.actionPlan}
                emptyText="No action plan was returned for this resume."
              />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
