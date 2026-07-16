"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  MobileMenu,
  NavigationMenu,
  type NavigationLink,
} from "@/components/navigation";

const publicNavItems: NavigationLink[] = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md transition-all duration-300">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <motion.span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 dark:bg-indigo-500 text-sm font-bold text-white shadow-sm shadow-indigo-500/20"
            whileHover={{ rotate: 3, scale: 1.04 }}
          >
            AI
          </motion.span>
          <span className="truncate text-base font-bold text-slate-900 dark:text-zinc-50 sm:text-lg tracking-tight">
            AI Interview Simulator
          </span>
        </Link>

        <div className="hidden lg:block">
          <NavigationMenu items={publicNavItems} />
        </div>

        <motion.button
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 transition hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-200 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none lg:hidden"
          onClick={() => setIsMenuOpen((current) => !current)}
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span className="grid gap-1">
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
            <span className="block h-0.5 w-5 bg-current" />
          </span>
        </motion.button>

        <MobileMenu
          isOpen={isMenuOpen}
          items={publicNavItems}
          onClose={() => setIsMenuOpen(false)}
        />
      </div>
    </header>
  );
}
