"use client";

import { NavItem } from "./NavItem";

export type NavigationLink = {
  href: string;
  label: string;
  icon?: string;
};

type NavigationMenuProps = {
  items: NavigationLink[];
  onItemClick?: () => void;
  variant?: "topbar" | "sidebar" | "mobile";
};

export function NavigationMenu({
  items,
  onItemClick,
  variant = "topbar",
}: NavigationMenuProps) {
  const direction = variant === "topbar" ? "flex-row items-center" : "flex-col";

  return (
    <nav className={`flex gap-1 ${direction}`} aria-label="Primary navigation">
      {items.map((item) => (
        <NavItem
          href={item.href}
          icon={item.icon}
          key={item.href}
          label={item.label}
          onClick={onItemClick}
          variant={variant}
        />
      ))}
    </nav>
  );
}
