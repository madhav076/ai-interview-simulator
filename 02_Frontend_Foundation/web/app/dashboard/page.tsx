"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout";
import { Card, CardBody, Button, Badge } from "@/components/ui";
import { LayoutDashboard, MessageSquare, FileText, Code, TrendingUp, Clock, AlertCircle, ArrowRight, Zap, Trophy, BarChart2 } from "lucide-react";
import { getDashboardSummary, DashboardResponse } from "@/services/dashboard.service";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await getDashboardSummary();
        setDashboardData(data);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-500"></div>
          <p className="text-xs text-slate-400 dark:text-zinc-500 animate-pulse">Loading summary data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-slate-600 dark:text-zinc-400 text-sm font-medium">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </DashboardLayout>
    );
  }

  const { summary, recentInterviews = [], recentCodingInterviews = [] } = dashboardData || {};

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
              Dashboard
            </h1>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-zinc-400">
            Monitor your interview preparation progress and manage your activities.
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-2">
          <Link href="/dashboard/ai-interview">
            <Button variant="primary" className="gap-2 text-xs py-1.5 px-3.5">
              <Zap size={14} /> Start AI Session
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <CardBody className="flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Total AI Interviews</span>
              <div className="p-2 bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 rounded-lg">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50">{summary?.totalInterviews || 0}</p>
          </CardBody>
        </Card>
        
        <Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <CardBody className="flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Coding Challenges</span>
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Code className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50">{summary?.totalCodingInterviews || 0}</p>
          </CardBody>
        </Card>

        <Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <CardBody className="flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Uploaded Resumes</span>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50">{summary?.totalResumes || 0}</p>
          </CardBody>
        </Card>

        <Card className="hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <CardBody className="flex flex-col justify-between h-28">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Avg. Score</span>
              <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50">{summary?.averageScore || 0}%</p>
              <div className="w-16 bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full" 
                  style={{ width: `${summary?.averageScore || 0}%` }}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity */}
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-slate-400 dark:text-zinc-500 mb-4 px-1">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Recent AI Interviews
          </h2>
          <Card>
            <CardBody className="divide-y divide-slate-100 dark:divide-zinc-800/60 p-0">
              {recentInterviews.length > 0 ? (
                <div className="flex flex-col">
                  {recentInterviews.map((interview) => (
                    <div key={interview._id} className="flex justify-between items-center py-4 px-6 hover:bg-slate-50/50 dark:hover:bg-zinc-800/10 transition-colors first:rounded-t-xl last:rounded-b-xl">
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-zinc-100">{interview.role}</p>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                          {interview.topic} • {interview.createdAt ? formatDistanceToNow(new Date(interview.createdAt), { addSuffix: true }) : "N/A"}
                        </p>
                      </div>
                      {interview.score !== undefined && (
                        <Badge variant={interview.score >= 70 ? "success" : interview.score >= 40 ? "warning" : "error"}>
                          {interview.score}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-600 mb-2" />
                  <p className="text-xs text-slate-400 dark:text-zinc-500">No recent AI interviews.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-slate-400 dark:text-zinc-500 mb-4 px-1">
            <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Recent Coding Challenges
          </h2>
          <Card>
            <CardBody className="divide-y divide-slate-100 dark:divide-zinc-800/60 p-0">
              {recentCodingInterviews.length > 0 ? (
                <div className="flex flex-col">
                  {recentCodingInterviews.map((interview) => (
                    <div key={interview._id} className="flex justify-between items-center py-4 px-6 hover:bg-slate-50/50 dark:hover:bg-zinc-800/10 transition-colors first:rounded-t-xl last:rounded-b-xl">
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-zinc-100">{interview.title}</p>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
                          {interview.difficulty} • {interview.language} • {interview.createdAt ? formatDistanceToNow(new Date(interview.createdAt), { addSuffix: true }) : "N/A"}
                        </p>
                      </div>
                      {interview.score !== undefined && (
                        <Badge variant={interview.score >= 70 ? "success" : interview.score >= 40 ? "warning" : "error"}>
                          {interview.score}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Code className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-600 mb-2" />
                  <p className="text-xs text-slate-400 dark:text-zinc-500">No recent coding challenges.</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mt-12 mb-8">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-400 dark:text-zinc-500 mb-4 px-1">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="hover:shadow-md transition-shadow">
            <CardBody className="flex flex-col justify-between h-40 p-6">
              <div>
                <div className="p-2 w-8 h-8 flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg mb-4">
                  <Zap size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">AI Mock Sessions</h3>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Start a custom behavioral or technical mock interview.</p>
              </div>
              <Link href="/dashboard/ai-interview" className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:gap-2 transition-all mt-4">
                Configure & Start <ArrowRight size={12} className="ml-1" />
              </Link>
            </CardBody>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardBody className="flex flex-col justify-between h-40 p-6">
              <div>
                <div className="p-2 w-8 h-8 flex items-center justify-center bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 rounded-lg mb-4">
                  <Code size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Code Challenges</h3>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Test your coding logic in a premium IDE environment.</p>
              </div>
              <Link href="/dashboard/coding-interview" className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:gap-2 transition-all mt-4">
                Open IDE <ArrowRight size={12} className="ml-1" />
              </Link>
            </CardBody>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardBody className="flex flex-col justify-between h-40 p-6">
              <div>
                <div className="p-2 w-8 h-8 flex items-center justify-center bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg mb-4">
                  <FileText size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Resume Upload</h3>
                <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Submit your PDF resume to generate tailored interview paths.</p>
              </div>
              <Link href="/dashboard/resume" className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:gap-2 transition-all mt-4">
                Manage PDF <ArrowRight size={12} className="ml-1" />
              </Link>
            </CardBody>
          </Card>
        </div>
      </section>
    </DashboardLayout>
  );
}
