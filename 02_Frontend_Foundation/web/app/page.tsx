import { MainLayout, PageContainer } from "@/components/layout";
import { Card, CardBody } from "@/components/ui";
import { Brain, FileText, Code, TrendingUp, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <MainLayout>
      <PageContainer size="wide">
        {/* Hero Section */}
        <section className="py-12 sm:py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-[0.2em] text-sky-700 uppercase">
              AI-Powered Interview Prep
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              AI Interview Simulator
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Master your next interview with AI-powered mock sessions, resume
              analysis, coding challenges, and real-time performance tracking.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-md bg-sky-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 focus:outline-none"
              >
                Get Started
              </a>
              <a
                href="/features"
                className="inline-flex items-center gap-2 justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:outline-none"
              >
                View Features
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="pb-16 sm:pb-24">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Everything you need to ace your interview
          </h2>
          <p className="mt-3 max-w-2xl text-base text-slate-600">
            From behavioral questions to coding challenges, our platform covers
            every aspect of interview preparation.
          </p>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardBody>
                <div className="rounded-lg bg-sky-50 p-3 w-fit mb-4">
                  <Brain className="w-8 h-8 text-sky-700" />
                </div>
                <h3 className="font-semibold text-slate-900">AI Interview</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Practice with AI-powered mock interviews tailored to your
                  target role and experience level.
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="rounded-lg bg-sky-50 p-3 w-fit mb-4">
                  <FileText className="w-8 h-8 text-sky-700" />
                </div>
                <h3 className="font-semibold text-slate-900">Resume Analysis</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Get instant AI-powered feedback on your resume with
                  actionable suggestions for improvement.
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="rounded-lg bg-sky-50 p-3 w-fit mb-4">
                  <Code className="w-8 h-8 text-sky-700" />
                </div>
                <h3 className="font-semibold text-slate-900">Coding Challenges</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Sharpen your problem-solving skills with curated coding
                  challenges across multiple languages.
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <div className="rounded-lg bg-sky-50 p-3 w-fit mb-4">
                  <TrendingUp className="w-8 h-8 text-sky-700" />
                </div>
                <h3 className="font-semibold text-slate-900">Performance Analytics</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Track your progress over time with detailed analytics and
                  personalized improvement insights.
                </p>
              </CardBody>
            </Card>
          </div>
        </section>
      </PageContainer>
    </MainLayout>
  );
}
