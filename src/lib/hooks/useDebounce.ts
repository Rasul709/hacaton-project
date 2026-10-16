import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any fast-changing value (such as search inputs)
 * preventing high-frequency query re-fetches and server load.
 *
 * @param value The value to debounce
 * @param delay Milliseconds delay (defaults to 300ms)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
