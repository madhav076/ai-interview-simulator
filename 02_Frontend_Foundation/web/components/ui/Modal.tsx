"use client";

import type { ReactNode } from "react";

type ModalProps = {
  body: ReactNode;
  footer?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

export function Modal({ body, footer, isOpen, onClose, title }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 dark:bg-black/60 backdrop-blur-sm px-4 py-6 animate-[fade-in_0.2s_ease-out]"
      role="dialog"
    >
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl animate-[slide-up_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800/60 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">{title}</h2>
          <button
            aria-label="Close modal"
            className="rounded-lg p-1 text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
            onClick={onClose}
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 text-sm leading-relaxed text-slate-600 dark:text-zinc-300">{body}</div>
        {footer ? (
          <div className="border-t border-slate-100 dark:border-zinc-800/60 bg-slate-50/30 dark:bg-zinc-950/10 px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
