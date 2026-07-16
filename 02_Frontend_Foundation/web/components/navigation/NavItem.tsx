"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type NavItemProps = {
  href: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: "topbar" | "sidebar" | "mobile";
};

const variantClasses = {
  topbar: "px-3 py-1.5 text-sm",
  sidebar: "w-full px-3 py-2 text-sm",
  mobile: "w-full px-4 py-3 text-base",
};

export function NavItem({
  href,
  icon,
  label,
  onClick,
  variant = "topbar",
}: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <motion.div whileHover={{ y: -0.5 }} whileTap={{ scale: 0.99 }} className="w-full">
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center gap-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
          isActive
            ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-l-2 border-indigo-600 dark:border-indigo-500 pl-2"
            : "text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40 hover:text-slate-900 dark:hover:text-zinc-100 border-l-2 border-transparent"
        } ${variantClasses[variant]}`}
      >
        {icon ? <span className={`text-base shrink-0 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-zinc-500"}`}>{icon}</span> : null}
        <span className="truncate">{label}</span>
      </Link>
    </motion.div>
  );
}
