"use client";

import { useState, useCallback } from "react";

export function useLoading(initial = false) {
  const [isLoading, setIsLoading] = useState(initial);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  return { isLoading, startLoading, stopLoading, setIsLoading };
}
