import type { HTMLAttributes } from "react";

type SpinnerSize = "small" | "medium" | "large";

type SpinnerProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
  size?: SpinnerSize;
};

const sizeClasses: Record<SpinnerSize, string> = {
  small: "h-4 w-4 border-2",
  medium: "h-6 w-6 border-2",
  large: "h-10 w-10 border-4",
};

export function Spinner({
  className = "",
  label = "Loading",
  size = "medium",
  ...props
}: SpinnerProps) {
  return (
    <div
      aria-label={label}
      role="status"
      className={`inline-block animate-spin rounded-full border-slate-200 dark:border-zinc-800 border-t-indigo-600 dark:border-t-indigo-400 ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
}
