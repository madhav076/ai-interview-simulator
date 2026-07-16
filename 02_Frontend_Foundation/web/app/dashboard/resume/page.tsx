"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { Alert, Badge, Button, Card, CardBody, Spinner } from "@/components/ui";
import { FileText, Upload, CheckCircle, Sparkles, TrendingUp, ThumbsUp, AlertTriangle, Cpu, FileCheck } from "lucide-react";
import { resumeService } from "@/services";
import type { Resume } from "@/types";

export default function ResumePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resume, setResume] = useState<Resume | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  /** Fetch the latest uploaded resume on mount. */
  const fetchResume = useCallback(async () => {
    setIsFetching(true);
    try {
      const list = await resumeService.getResumes();
      setResume(list[0] ?? null);
    } catch {
      // silently ignore — empty state is shown
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  /** Handle file selection from the hidden input. */
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
  }

  /** Upload logic */
  async function uploadFile(file: File) {
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are supported. Please choose a PDF.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be 10 MB or less.");
      return;
    }

    setUploadError(null);
    setUploadSuccess(false);
    setIsUploading(true);

    try {
      const uploaded = await resumeService.uploadResume(file);
      setResume(uploaded);
      setUploadSuccess(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Upload failed. Please try again.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  /** Drag events handling */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              Resume Manager
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">
            Upload and manage your resumes for AI-powered analysis and feedback.
          </p>
        </div>
      </div>

      {/* Status alerts */}
      {uploadSuccess && (
        <Alert variant="success" className="mt-6">
          Resume uploaded successfully!
        </Alert>
      )}
      {uploadError && (
        <Alert variant="error" className="mt-6">
          {uploadError}
        </Alert>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Upload PDF resume"
      />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 items-start">
        {/* Left Side: Upload zone and file status */}
        <div className="space-y-6">
          {/* Upload Area */}
          <Card 
            className={`border-2 border-dashed transition-all duration-300 ${
              dragActive 
                ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/5 scale-[1.01]" 
                : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/10"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <CardBody className="flex flex-col items-center justify-center py-14 text-center">
              {isUploading ? (
                <>
                  <Spinner size="large" className="mb-4 text-indigo-600" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                    Running AI Document Parser...
                  </p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Analyzing formatting, keyword density, and metrics...</p>
                </>
              ) : (
                <>
                  <div className="p-3 bg-slate-50 dark:bg-zinc-950/30 text-slate-400 dark:text-zinc-600 rounded-full mb-4">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                    Drag and drop your resume here, or click to browse
                  </p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Maximum file size: 10 MB • Supported: PDF only</p>
                  <Button
                    variant="secondary"
                    className="mt-6 text-xs py-1.5 px-4"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    Choose file
                  </Button>
                </>
              )}
            </CardBody>
          </Card>

          {/* Your Resumes List */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3 px-1">Active Resume</h2>
            <Card>
              <CardBody className="p-5">
                {isFetching ? (
                  <div className="flex justify-center py-4">
                    <Spinner size="medium" />
                  </div>
                ) : resume ? (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800 dark:text-zinc-200">
                          {resume.fileName}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">
                          Uploaded{" "}
                          {new Date(resume.uploadedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-700 mb-2" />
                    <p className="text-xs text-slate-400 dark:text-zinc-500">
                      No resumes uploaded yet. Upload your first resume to get started.
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          </section>
        </div>

        {/* Right Side: Simulated Scan Summary */}
        <div className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 px-1">AI Resume Insights</h2>
          {resume ? (
            <div className="space-y-5 animate-[fade-in_0.3s_ease-out]">
              {/* ATS Score gauge representation */}
              <Card className="border border-indigo-100/50 dark:border-indigo-950/5">
                <CardBody className="p-6 text-center flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Estimated ATS Score</span>
                  
                  {/* Concentric Circle Gauge */}
                  <div className="relative flex items-center justify-center w-28 h-28 mt-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        className="stroke-slate-100 dark:stroke-zinc-800"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="56"
                        cy="56"
                        r="48"
                        className="stroke-indigo-600 dark:stroke-indigo-500"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={301.6}
                        strokeDashoffset={301.6 - (301.6 * 84) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-2xl font-black text-slate-900 dark:text-zinc-100">84%</span>
                  </div>
                  
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-4 leading-relaxed">
                    Overall, your document exhibits strong formatting, but key metrics could be added to project descriptions.
                  </p>
                </CardBody>
              </Card>

              {/* Analysis Cards */}
              <div className="grid grid-cols-1 gap-3">
                <Card>
                  <CardBody className="p-4 flex items-start gap-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                      <ThumbsUp size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">Formatting & Structure</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Section headers are fully readable by parser engines.</p>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="p-4 flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                      <Cpu size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">Keyword Density</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Identified core tech keywords: JS, React, Node.js, Express.</p>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="p-4 flex items-start gap-3">
                    <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                      <AlertTriangle size={14} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">Quantifiable Metrics</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Action item: Add quantitative outcomes to project nodes.</p>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          ) : (
            <Card>
              <CardBody className="py-8 text-center p-6 flex flex-col items-center">
                <Sparkles className="w-8 h-8 text-slate-300 dark:text-zinc-700 mb-2" />
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  Submit a PDF resume to get instant ATS scores and formatting scanner advice.
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
