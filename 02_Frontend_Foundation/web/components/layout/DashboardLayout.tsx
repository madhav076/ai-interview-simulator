import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { PageContainer } from "./PageContainer";
import { Sidebar } from "./Sidebar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar />
        <main className="min-w-0 flex-1 bg-slate-50/30 dark:bg-zinc-950/5">
          <PageContainer size="wide">{children}</PageContainer>
        </main>
      </div>
      <Footer />
    </div>
  );
}
