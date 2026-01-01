"use client";

import { useEffect } from "react";

/**
 * Performance monitoring component
 * Logs slow renders and provides performance insights
 */
export function PerformanceMonitor({ 
  componentName = "Component",
  threshold = 100 // Log if render takes more than 100ms
}: { 
  componentName?: string;
  threshold?: number;
}) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > threshold) {
        console.warn(
          `⚠️ Slow render detected: ${componentName} took ${renderTime.toFixed(0)}ms`
        );
      }
    };
  }, [componentName, threshold]); // CRITICAL: Add deps to prevent continuous re-renders

  return null;
}

/**
 * Custom hook to measure function execution time
 */
export function usePerformanceLog(operationName: string) {
  return {
    start: () => {
      const startTime = performance.now();
      return {
        end: () => {
          const endTime = performance.now();
          const duration = endTime - startTime;
          
          if (duration > 50) {
            console.warn(
              `⚠️ Slow operation: ${operationName} took ${duration.toFixed(0)}ms`
            );
          } else {
            console.log(
              `✅ ${operationName}: ${duration.toFixed(0)}ms`
            );
          }
        }
      };
    }
  };
}
