import Link from "next/link";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
];

export function Footer() {
  return (
    <footer id="about" className="border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 transition-colors duration-300">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 text-sm text-slate-500 dark:text-zinc-400 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <p className="font-semibold text-slate-900 dark:text-zinc-100">AI Interview Simulator</p>
          <p className="mt-1 text-xs">
            &copy; {new Date().getFullYear()} AI Interview Simulator. All rights
            reserved.
          </p>
          <p className="mt-1 font-medium text-xs">Developer: Madhav Goyal</p>
          <p className="mt-1 text-[10px] text-slate-400 dark:text-zinc-600">Version 1.0.0</p>
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-zinc-100">Quick Links</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {quickLinks.map((link) => (
              <Link
                className="hover:text-indigo-600 dark:hover:text-indigo-400 text-xs transition"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
