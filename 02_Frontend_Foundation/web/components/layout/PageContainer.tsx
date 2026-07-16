"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  size?: "default" | "wide";
};

export function PageContainer({
  children,
  className = "",
  size = "default",
}: PageContainerProps) {
  const widthClass = size === "wide" ? "max-w-7xl" : "max-w-5xl";

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={`mx-auto w-full ${widthClass} px-4 py-10 sm:px-6 lg:px-8 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
