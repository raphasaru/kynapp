'use client'

import { useState, useEffect } from 'react'

/**
 * Hook to detect media query matches
 * @param query - Media query string (e.g., '(min-width: 768px)')
 * @returns boolean - true if query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Set initial value
    setMatches(media.matches)

    // Create listener
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)

    // Add listener
    media.addEventListener('change', listener)

    // Cleanup
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
