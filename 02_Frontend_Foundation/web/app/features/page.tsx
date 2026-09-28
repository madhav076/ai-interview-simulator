import Link from "next/link";
import { MainLayout, PageContainer } from "@/components/layout";
import { Card, CardBody, Badge } from "@/components/ui";
import {
  Brain,
  ScanSearch,
  Code,
  Mic,
  FileBarChart,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "Available" | "Coming Soon";
  href?: string;
  isAvailable: boolean;
}

const features: Feature[] = [
  {
    title: "AI Interview",
    description:
      "Engage in realistic mock interviews powered by AI that dynamically generates role-tailored questions, evaluates your answers in real time, and provides detailed feedback.",
    icon: <Brain className="w-6 h-6" />,
    status: "Available",
    href: "/dashboard/ai-interview",
    isAvailable: true,
  },
  {
    title: "Resume Analysis",
    description:
      "Upload your resume and get an AI-powered evaluation of your strengths, weaknesses, ATS compatibility, missing skills, job match and personalized improvement recommendations.",
    icon: <ScanSearch className="w-6 h-6" />,
    status: "Available",
    href: "/dashboard/resume-analysis",
    isAvailable: true,
  },
  {
    title: "Coding Interview",
    description:
      "Practice coding problems by language and difficulty, solve challenges and receive AI-powered evaluation of your solution.",
    icon: <Code className="w-6 h-6" />,
    status: "Available",
    href: "/dashboard/coding-interview",
    isAvailable: true,
  },
  {
    title: "Voice Interview",
    description:
      "Practice speech-driven mock interviews with intelligent audio processing, tone and pace assessment, filler word tracking, and vocal delivery insights.",
    icon: <Mic className="w-6 h-6" />,
    status: "Coming Soon",
    isAvailable: false,
  },
  {
    title: "Performance Reports",
    description:
      "Receive comprehensive reports after each session with scoring breakdowns, answer evaluations, topic performance, and downloadable PDF summaries.",
    icon: <FileBarChart className="w-6 h-6" />,
    status: "Available",
    href: "/dashboard/reports",
    isAvailable: true,
  },
  {
    title: "Smart Analytics",
    description:
      "Track your interview preparation progress over time with intelligent analytics that highlight score trajectories, strengths, and areas for growth.",
    icon: <TrendingUp className="w-6 h-6" />,
    status: "Available",
    href: "/dashboard/analytics",
    isAvailable: true,
  },
];

export default function FeaturesPage() {
  return (
    <MainLayout>
      <PageContainer size="wide">
        {/* Page Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Platform Capabilities
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-zinc-50 sm:text-4xl lg:text-5xl">
            Features Built for Interview Success
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
            Discover the powerful AI-driven tools designed to help you prepare,
            practice, and gain confidence across every stage of your interview journey.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
          {features.map((feature) => {
            if (feature.isAvailable && feature.href) {
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
                >
                  <Card className="h-full flex flex-col justify-between cursor-pointer border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-indigo-400/80 dark:hover:border-indigo-500/50">
                    <CardBody className="p-6 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/50 p-3 text-indigo-600 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/30 group-hover:scale-105 transition-transform duration-300">
                          {feature.icon}
                        </div>
                        <Badge variant="success" className="text-[11px] font-semibold">
                          {feature.status}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed flex-1">
                        {feature.description}
                      </p>
                      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800/60 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                        <span>Try Now</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              );
            }

            return (
              <div key={feature.title} className="h-full">
                <Card className="h-full flex flex-col justify-between border-dashed border-slate-200 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-zinc-900/20 opacity-80 cursor-default">
                  <CardBody className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="rounded-xl bg-slate-100 dark:bg-zinc-800 p-3 text-slate-400 dark:text-zinc-500">
                        {feature.icon}
                      </div>
                      <Badge variant="default" className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                        {feature.status}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-300">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-zinc-500 leading-relaxed flex-1">
                      {feature.description}
                    </p>
                    <div className="mt-5 pt-4 border-t border-slate-200/50 dark:border-zinc-800/40 flex items-center justify-between text-xs font-medium text-slate-400 dark:text-zinc-500">
                      <span>In Development</span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold">Soon</span>
                    </div>
                  </CardBody>
                </Card>
              </div>
            );
          })}
        </div>
      </PageContainer>
    </MainLayout>
  );
}
