"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardBody, Badge, Button, Spinner } from "@/components/ui";
import { TrendingUp, MessageSquare, Code, FileText, Target, AlertCircle, Calendar, Trophy, BarChart2 } from "lucide-react";
import { getProgressData } from "@/services/analytics.service";

type AnalyticsData = Awaited<ReturnType<typeof getProgressData>>;

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("30"); // days

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await getProgressData(timeRange);
        setAnalytics(data);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Spinner size="medium" />
          <p className="text-xs text-slate-400 dark:text-zinc-500 animate-pulse">Computing progress telemetry...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <p className="text-sm text-slate-655 dark:text-zinc-400">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  const thisMonthCount = (analytics?.interviewsCompletedThisMonth || 0) + (analytics?.codingInterviewsCompletedThisMonth || 0);

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              Analytics
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">
            Track your progress, historical performance, and identify areas for improvement.
          </p>
        </div>
      </div>

      {/* Time Range Selector */}
      <Card className="mt-8 bg-white dark:bg-zinc-900/30">
        <CardBody className="p-4 flex items-center justify-between flex-wrap gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 flex items-center gap-1.5">
            <Calendar size={14} className="text-indigo-600 dark:text-indigo-400" /> Range
          </span>
          <div className="flex gap-2">
            {[
              { label: "7 Days", val: "7" },
              { label: "30 Days", val: "30" },
              { label: "90 Days", val: "90" },
              { label: "All Time", val: "all" },
            ].map((btn) => (
              <button
                key={btn.val}
                onClick={() => setTimeRange(btn.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === btn.val
                    ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20"
                    : "text-slate-500 dark:text-zinc-400 border border-transparent hover:bg-slate-50 dark:hover:bg-zinc-800"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Chart Placeholders */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-indigo-100/30 dark:border-indigo-950/5">
          <CardBody className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="text-indigo-600 dark:text-indigo-400" /> Performance This Month
            </h3>
            <div className="bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-800/80 rounded-xl h-48 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-5xl font-black text-indigo-650 dark:text-indigo-400">{analytics?.averageScoreThisMonth || 0}%</p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-3 max-w-xs leading-relaxed">
                Average performance rating scored across <span className="font-semibold text-slate-800 dark:text-zinc-300">{thisMonthCount} active sessions</span> generated during this monthly cycle.
              </p>
            </div>
          </CardBody>
        </Card>
        
        <Card className="border border-emerald-100/30 dark:border-emerald-950/5">
          <CardBody className="p-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <Trophy size={16} className="text-emerald-600 dark:text-emerald-400" /> Peak Performance
            </h3>
            <div className="bg-slate-50/50 dark:bg-zinc-950/20 border border-slate-100 dark:border-zinc-800/80 rounded-xl h-48 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-5xl font-black text-emerald-600 dark:text-emerald-400">{analytics?.highestInterviewScore || 0}%</p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-3 max-w-xs leading-relaxed">
                Highest overall mock rating achieved across all evaluated sessions in history. Keep practicing to raise the peak!
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Stats Summary */}
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mt-8 mb-4 px-1">Summary Breakdown</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card>
          <CardBody className="p-5 flex items-center gap-4">
            <div className="p-3 bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 rounded-xl shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Total Interviews</span>
              <p className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-0.5">{analytics?.totalInterviews || 0}</p>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-5 flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Coding assessments</span>
              <p className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-0.5">{analytics?.totalCodingInterviews || 0}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Resumes Scanned</span>
              <p className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-0.5">{analytics?.totalResumes || 0}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Lifetime Avg. Score</span>
              <p className="text-2xl font-black text-slate-900 dark:text-zinc-100 mt-0.5">{analytics?.averageInterviewScore || 0}%</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
