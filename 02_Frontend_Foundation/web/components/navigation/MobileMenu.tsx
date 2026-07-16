"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui";
import type { NavigationLink } from "./NavigationMenu";
import { NavigationMenu } from "./NavigationMenu";

type MobileMenuProps = {
  isOpen: boolean;
  items: NavigationLink[];
  onClose: () => void;
};

export function MobileMenu({ isOpen, items, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full right-4 left-4 z-40 rounded-lg border border-slate-200 bg-white p-4 shadow-lg lg:hidden"
          exit={{ opacity: 0, y: -12 }}
          initial={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <NavigationMenu
            items={items}
            onItemClick={onClose}
            variant="mobile"
          />
          <motion.div className="mt-4" whileHover={{ scale: 1.01 }}>
            <Button className="w-full" onClick={onClose} variant="secondary">
              Close Menu
            </Button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
