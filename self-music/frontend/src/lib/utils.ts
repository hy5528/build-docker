import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Checks if the current browser is modern enough to support certain CSS features.
 * This is a client-side only function.
 * @returns {boolean} True if the browser supports advanced features, false otherwise.
 */
export function isModernBrowser(): boolean {
  // During SSR, window is undefined. Assume modern and let client-side check handle it.
  if (typeof window === 'undefined' || typeof CSS === 'undefined' || !CSS.supports) {
    return true;
  }

  // `backdrop-filter` is a good proxy for browsers with capable rendering engines.
  return CSS.supports('backdrop-filter', 'blur(10px)') || CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
}
