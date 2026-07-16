"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Code,
  FileBarChart,
  TrendingUp,
  Settings,
  Bell,
} from "lucide-react";
import { NavItem } from "@/components/navigation";

const sidebarItems = [
  { href: "/dashboard", icon: <LayoutDashboard size={16} />, label: "Dashboard" },
  { href: "/dashboard/resume", icon: <FileText size={16} />, label: "Resume" },
  {
    href: "/dashboard/ai-interview",
    icon: <MessageSquare size={16} />,
    label: "AI Interview",
  },
  {
    href: "/dashboard/coding-interview",
    icon: <Code size={16} />,
    label: "Coding Interview",
  },
  { href: "/dashboard/reports", icon: <FileBarChart size={16} />, label: "Reports" },
  { href: "/dashboard/analytics", icon: <TrendingUp size={16} />, label: "Analytics" },
  { href: "/dashboard/notifications", icon: <Bell size={16} />, label: "Notifications" },
  { href: "/dashboard/settings", icon: <Settings size={16} />, label: "Settings" },
];

export function Sidebar() {
  return (
    <motion.aside
      animate={{ opacity: 1, x: 0 }}
      className="border-b border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/10 p-4 md:min-h-[calc(100vh-73px)] md:w-64 md:shrink-0 md:border-r md:border-b-0 md:p-6 transition-all duration-300"
      initial={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="md:sticky md:top-24">
        <p className="mb-3.5 px-3 text-[10px] font-bold tracking-[0.2em] text-slate-400 dark:text-zinc-500 uppercase">
          Workspace
        </p>
        <div className="overflow-x-auto md:overflow-visible">
          <div className="flex min-w-max gap-1 md:min-w-0 md:flex-col">
            {sidebarItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                variant="sidebar"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
