"use client";

import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
  label?: string;
};

export function Input({
  className = "",
  disabled,
  error,
  id,
  label,
  ...props
}: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="grid gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-zinc-300">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`w-full rounded-lg border bg-white dark:bg-zinc-950 px-3.5 py-2 text-sm text-slate-900 dark:text-zinc-100 shadow-sm transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-zinc-900/50 disabled:text-slate-400 dark:disabled:text-zinc-500 ${
          error ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-slate-200 dark:border-zinc-800"
        } ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-red-500 font-medium mt-0.5">
          {error}
        </p>
      ) : null}
    </div>
  );
}
