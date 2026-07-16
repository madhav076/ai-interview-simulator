"use client";

import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string;
  label?: string;
};

export function Textarea({
  className = "",
  disabled,
  error,
  id,
  label,
  ...props
}: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <div className="grid gap-1.5">
      {label ? (
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-slate-700 dark:text-zinc-300"
        >
          {label}
        </label>
      ) : null}
      <textarea
        id={textareaId}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        className={`min-h-28 w-full resize-y rounded-lg border bg-white dark:bg-zinc-950 px-3.5 py-2 text-sm text-slate-900 dark:text-zinc-100 shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-zinc-900/50 disabled:text-slate-400 dark:disabled:text-zinc-500 ${
          error ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-slate-200 dark:border-zinc-800"
        } ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${textareaId}-error`} className="text-xs text-red-500 font-medium mt-0.5">
          {error}
        </p>
      ) : null}
    </div>
  );
}
