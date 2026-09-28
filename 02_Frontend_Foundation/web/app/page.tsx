import Link from "next/link";
import { MainLayout, PageContainer } from "@/components/layout";
import { Card, CardBody } from "@/components/ui";
import {
  Brain,
  FileText,
  Code,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { HolographicHeroVisual } from "@/components/landing/HolographicHeroVisual";

export default function Home() {
  return (
    <MainLayout>
      <PageContainer size="wide">
        {/* ── Hero Section ── */}
        <section className="py-8 sm:py-16 lg:py-20 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Next-Gen AI Interview Simulator</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 dark:text-zinc-50 sm:text-5xl lg:text-6xl leading-[1.12]">
                Master Every Interview with Realistic{" "}
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                  AI Holographic
                </span>{" "}
                Practice
              </h1>

              <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-zinc-400 max-w-xl">
                Master your next interview with AI-powered mock sessions, resume
                analysis, coding challenges, and real-time performance tracking.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-500/25 transition-all duration-200 hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/features"
                  className="inline-flex items-center gap-2 justify-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 px-6 py-3.5 text-sm font-bold text-slate-900 dark:text-zinc-100 shadow-sm transition-all duration-200 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:outline-none"
                >
                  View Features
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Feature Highlights Pills */}
              <div className="pt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  AI Question Engine
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ATS Resume Optimization
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Live Code Evaluation
                </span>
              </div>
            </div>

            {/* Right Hero Column: 3D Holographic AI Interviewer Visual */}
            <div className="lg:col-span-5 xl:col-span-5 flex justify-center">
              <HolographicHeroVisual />
            </div>
          </div>
        </section>

        {/* ── Feature Highlights Grid ── */}
        <section className="pb-16 sm:pb-24 pt-8 border-t border-slate-200/60 dark:border-zinc-800/80">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-zinc-50 sm:text-3xl">
                Everything you need to ace your interview
              </h2>
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-zinc-400">
                From behavioral questions to live coding challenges, our platform
                covers every aspect of modern technical and domain interview preparation.
              </p>
            </div>
            <Link
              href="/features"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Explore all features
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/dashboard/ai-interview" className="group block">
              <Card className="h-full border-slate-200/80 dark:border-zinc-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-400/80 dark:hover:border-indigo-500/50">
                <CardBody className="p-6">
                  <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-3 w-fit mb-4 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 group-hover:scale-105 transition-transform">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    AI Interview
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    Practice with AI mock interviews tailored to your target
                    role, difficulty, and experience level.
                  </p>
                </CardBody>
              </Card>
            </Link>

            <Link href="/dashboard/resume-analysis" className="group block">
              <Card className="h-full border-slate-200/80 dark:border-zinc-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-400/80 dark:hover:border-indigo-500/50">
                <CardBody className="p-6">
                  <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-3 w-fit mb-4 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 group-hover:scale-105 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Resume Analysis
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    Get instant AI feedback on ATS compatibility, missing skills,
                    and personalized improvement steps.
                  </p>
                </CardBody>
              </Card>
            </Link>

            <Link href="/dashboard/coding-interview" className="group block">
              <Card className="h-full border-slate-200/80 dark:border-zinc-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-400/80 dark:hover:border-indigo-500/50">
                <CardBody className="p-6">
                  <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-3 w-fit mb-4 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 group-hover:scale-105 transition-transform">
                    <Code className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Coding Challenges
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    Sharpen problem-solving skills across Python, JS, TS, and Java
                    with automated AI evaluations.
                  </p>
                </CardBody>
              </Card>
            </Link>

            <Link href="/dashboard/analytics" className="group block">
              <Card className="h-full border-slate-200/80 dark:border-zinc-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-400/80 dark:hover:border-indigo-500/50">
                <CardBody className="p-6">
                  <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-3 w-fit mb-4 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 group-hover:scale-105 transition-transform">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Performance Analytics
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    Track your score trajectory over time with detailed telemetry
                    and growth insights.
                  </p>
                </CardBody>
              </Card>
            </Link>
          </div>
        </section>
      </PageContainer>
    </MainLayout>
  );
}
