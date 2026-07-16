import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

type CardSectionProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <article
      className={`overflow-hidden rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm transition-all duration-300 hover:shadow-md hover:border-slate-300/80 dark:hover:border-zinc-800 ${className}`}
      {...props}
    >
      {children}
    </article>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: CardSectionProps) {
  return (
    <div
      className={`border-b border-slate-100 dark:border-zinc-800/60 px-6 py-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
  ...props
}: CardSectionProps) {
  return (
    <div className={`px-6 py-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: CardSectionProps) {
  return (
    <div
      className={`border-t border-slate-100 dark:border-zinc-800/60 bg-slate-50/30 dark:bg-zinc-900/10 px-6 py-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
