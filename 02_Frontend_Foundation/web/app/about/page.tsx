import { MainLayout, PageContainer } from "@/components/layout";
import { Card, CardBody } from "@/components/ui";
import { Info, Target, Eye, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <MainLayout>
      <PageContainer>
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Info className="w-8 h-8 text-sky-700" />
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            About Us
          </h1>
        </div>
        <p className="mt-3 max-w-2xl text-base text-slate-600">
          Learn more about our mission to revolutionize interview preparation
          through artificial intelligence.
        </p>

        {/* Mission */}
        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Target className="w-6 h-6 text-sky-700" />
            Our Mission
          </h2>
          <Card className="mt-4">
            <CardBody>
              <p className="text-slate-600 leading-7">
                We are on a mission to democratize interview preparation by
                providing everyone access to AI-powered coaching. Our platform
                simulates real interview scenarios, analyzes your responses, and
                delivers personalized feedback to help you succeed.
              </p>
            </CardBody>
          </Card>
        </section>

        {/* Vision */}
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Eye className="w-6 h-6 text-sky-700" />
            Our Vision
          </h2>
          <Card className="mt-4">
            <CardBody>
              <p className="text-slate-600 leading-7">
                We envision a world where every candidate can walk into an
                interview with confidence. By combining cutting-edge AI with
                proven interview methodologies, we aim to become the go-to
                platform for comprehensive interview readiness.
              </p>
            </CardBody>
          </Card>
        </section>

        {/* Team */}
        <section className="mt-10 pb-12">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            <Users className="w-6 h-6 text-sky-700" />
            Our Team
          </h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardBody className="flex flex-col items-center py-8">
                <Users className="w-12 h-12 text-slate-400 mb-3" />
                <h3 className="font-semibold text-slate-900">Madhav Goyal</h3>
                <p className="text-sm text-slate-500">Developer</p>
              </CardBody>
            </Card>
          </div>
        </section>
      </PageContainer>
    </MainLayout>
  );
}
