"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type BreadcrumbItem = {
  href?: string;
  label: string;
};

type BreadcrumbProps = {
  items?: BreadcrumbItem[];
};

function titleize(segment: string) {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const pathname = usePathname();
  const generatedItems =
    items ??
    pathname
      .split("/")
      .filter(Boolean)
      .map((segment, index, segments) => ({
        href: `/${segments.slice(0, index + 1).join("/")}`,
        label: titleize(segment),
      }));

  const breadcrumbItems = [{ href: "/", label: "Home" }, ...generatedItems];

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <li
              className="flex items-center gap-2"
              key={`${item.href}-${item.label}`}
            >
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {item.href && !isLast ? (
                <Link className="hover:text-sky-700" href={item.href}>
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-slate-700">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
