"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardBody, Button, Spinner } from "@/components/ui";
import { FileBarChart, AlertCircle, Download, FileText, BarChart2 } from "lucide-react";
import { getAllInterviews, InterviewRecord, downloadReportPdf } from "@/services/report.service";
import { format } from "date-fns";

export default function ReportsPage() {
  const [reports, setReports] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "interview" | "coding">("all");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await getAllInterviews();
        setReports(data || []);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleDownload = async (interviewId: string, role: string) => {
    try {
      setDownloadingId(interviewId);
      await downloadReportPdf(interviewId, role);
    } catch (err: unknown) {
      console.error(err);
      alert("Failed to download PDF report. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filter === "all") return true;
    const isCoding =
      r.topic.toLowerCase().includes("coding") ||
      r.role.toLowerCase().includes("coding") ||
      r.topic === "Coding";
    if (filter === "interview") return !isCoding;
    if (filter === "coding") return isCoding;
    return true;
  });

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <FileBarChart className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              Reports
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">
            View detailed performance reports and analytics from your sessions.
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <Card className="mt-8 bg-white dark:bg-zinc-900/30">
        <CardBody className="p-4 flex items-center justify-between flex-wrap gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Filter reports</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === "all"
                  ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20"
                  : "text-slate-500 dark:text-zinc-400 border border-transparent hover:bg-slate-50 dark:hover:bg-zinc-800"
              }`}
            >
              All Reports
            </button>
            <button
              onClick={() => setFilter("interview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === "interview"
                  ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20"
                  : "text-slate-500 dark:text-zinc-400 border border-transparent hover:bg-slate-50 dark:hover:bg-zinc-800"
              }`}
            >
              AI Interviews
            </button>
            <button
              onClick={() => setFilter("coding")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === "coding"
                  ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20"
                  : "text-slate-500 dark:text-zinc-400 border border-transparent hover:bg-slate-50 dark:hover:bg-zinc-800"
              }`}
            >
              Coding assessments
            </button>
          </div>
        </CardBody>
      </Card>

      {/* Reports List */}
      <section className="mt-8 mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4 px-1">Your Generated Records</h2>
        
        {loading ? (
          <div className="flex flex-col justify-center items-center py-12 gap-2">
            <Spinner size="medium" />
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 animate-pulse">Loading reports summary...</p>
          </div>
        ) : error ? (
          <Card>
            <CardBody className="flex flex-col items-center justify-center py-8 gap-4 text-center">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="text-sm text-slate-650 dark:text-zinc-400">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
            </CardBody>
          </Card>
        ) : filteredReports.length > 0 ? (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report._id} className="hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                <CardBody className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-5">
                  <div className="flex gap-4 items-start min-w-0">
                    <div className="hidden sm:flex bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-50 truncate">{report.role}</h3>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 leading-relaxed">
                        Topic: {report.topic || "Coding"} • Difficulty: {report.difficulty}
                      </p>
                      <p className="text-[10px] text-slate-450 dark:text-zinc-500 mt-1">
                        Date: {format(new Date(report.createdAt), "PPP")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 dark:border-zinc-800">
                    {report.score !== undefined && (
                      <div className="text-left sm:text-right mr-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">Performance</span>
                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{report.score}%</span>
                      </div>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => handleDownload(report._id, report.role || "Report")}
                      disabled={downloadingId === report._id}
                      className="flex gap-2 text-xs py-1.5 px-3 w-full sm:w-auto"
                    >
                      {downloadingId === report._id ? (
                        <Spinner size="small" />
                      ) : (
                        <Download className="w-4.5 h-4.5" />
                      )}
                      <span>Download PDF</span>
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardBody className="py-12 text-center p-6 flex flex-col items-center">
              <BarChart2 className="w-10 h-10 mx-auto text-slate-350 dark:text-zinc-700 mb-3" />
              <p className="text-sm font-semibold text-slate-900 dark:text-zinc-150">No reports generated yet</p>
              <p className="text-xs text-slate-450 dark:text-zinc-500 mt-1 max-w-xs leading-relaxed">
                Complete your first mock interview or coding session to view high-fidelity PDF outputs.
              </p>
            </CardBody>
          </Card>
        )}
      </section>
    </DashboardLayout>
  );
}
