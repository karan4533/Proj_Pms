"use client";

import { useEffect } from "react";
import { checkAndClearCache } from "@/lib/cache-manager";

/**
 * Cache Checker - Runs on app load to ensure fresh cache
 */
export function CacheChecker() {
  useEffect(() => {
    checkAndClearCache();
  }, []);

  return null;
}
