import { MainLayout, PageContainer } from "@/components/layout";
import { Card, CardBody, Badge } from "@/components/ui";
import { Sparkles, MessageSquare, FileText, Code, Mic, FileBarChart, TrendingUp } from "lucide-react";

export default function FeaturesPage() {
  return (
    <MainLayout>
      <PageContainer>
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-sky-700" />
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Features
          </h1>
        </div>
        <p className="mt-3 max-w-2xl text-base text-slate-600">
          Discover the powerful tools and features designed to help you prepare
          for every type of interview.
        </p>

        {/* Feature Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          <Card>
            <CardBody>
              <div className="rounded-lg bg-sky-50 p-3 w-fit mb-4">
                <MessageSquare className="w-6 h-6 text-sky-700" />
              </div>
              <h3 className="font-semibold text-slate-900">AI Interview</h3>
              <p className="text-sm text-slate-600 mt-1">
                Engage in realistic mock interviews powered by advanced AI that
                adapts to your responses in real time.
              </p>
              <Badge variant="default" className="mt-3">Coming Soon</Badge>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="rounded-lg bg-sky-50 p-3 w-fit mb-4">
                <FileText className="w-6 h-6 text-sky-700" />
              </div>
              <h3 className="font-semibold text-slate-900">Resume Parser</h3>
              <p className="text-sm text-slate-600 mt-1">
                Upload your resume and receive detailed analysis with
                suggestions to optimize for ATS and recruiters.
              </p>
              <Badge variant="default" className="mt-3">Coming Soon</Badge>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="rounded-lg bg-sky-50 p-3 w-fit mb-4">
                <Code className="w-6 h-6 text-sky-700" />
              </div>
              <h3 className="font-semibold text-slate-900">Coding Challenges</h3>
              <p className="text-sm text-slate-600 mt-1">
                Practice with curated coding problems spanning algorithms, data
                structures, and system design.
              </p>
              <Badge variant="default" className="mt-3">Coming Soon</Badge>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="rounded-lg bg-sky-50 p-3 w-fit mb-4">
                <Mic className="w-6 h-6 text-sky-700" />
              </div>
              <h3 className="font-semibold text-slate-900">Voice Analysis</h3>
              <p className="text-sm text-slate-600 mt-1">
                Get feedback on your speaking pace, clarity, filler words, and
                overall communication effectiveness.
              </p>
              <Badge variant="default" className="mt-3">Coming Soon</Badge>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="rounded-lg bg-sky-50 p-3 w-fit mb-4">
                <FileBarChart className="w-6 h-6 text-sky-700" />
              </div>
              <h3 className="font-semibold text-slate-900">Performance Reports</h3>
              <p className="text-sm text-slate-600 mt-1">
                Receive comprehensive reports after each session with scoring
                breakdowns and improvement areas.
              </p>
              <Badge variant="default" className="mt-3">Coming Soon</Badge>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="rounded-lg bg-sky-50 p-3 w-fit mb-4">
                <TrendingUp className="w-6 h-6 text-sky-700" />
              </div>
              <h3 className="font-semibold text-slate-900">Smart Analytics</h3>
              <p className="text-sm text-slate-600 mt-1">
                Track your progress over time with intelligent analytics that
                highlight trends and growth areas.
              </p>
              <Badge variant="default" className="mt-3">Coming Soon</Badge>
            </CardBody>
          </Card>
        </div>
      </PageContainer>
    </MainLayout>
  );
}
