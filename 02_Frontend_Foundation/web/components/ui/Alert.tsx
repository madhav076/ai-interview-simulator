import type { HTMLAttributes, ReactNode } from "react";

type AlertVariant = "success" | "error" | "warning" | "info";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  title?: string;
  variant?: AlertVariant;
};

const variantClasses: Record<AlertVariant, string> = {
  success: "border-emerald-200 dark:border-emerald-950/30 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-900 dark:text-emerald-300",
  error: "border-red-200 dark:border-red-950/30 bg-red-50/50 dark:bg-red-950/10 text-red-900 dark:text-red-300",
  warning: "border-amber-200 dark:border-amber-950/30 bg-amber-50/50 dark:bg-amber-950/10 text-amber-900 dark:text-amber-300",
  info: "border-indigo-200 dark:border-indigo-950/30 bg-indigo-50/50 dark:bg-indigo-950/10 text-indigo-900 dark:text-indigo-300",
};

export function Alert({
  children,
  className = "",
  title,
  variant = "info",
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={`rounded-lg border px-4 py-3 shadow-sm transition-all duration-300 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {title ? <p className="font-semibold text-sm mb-1">{title}</p> : null}
      <div className="text-sm leading-relaxed">
        {children}
      </div>
    </div>
  );
}
