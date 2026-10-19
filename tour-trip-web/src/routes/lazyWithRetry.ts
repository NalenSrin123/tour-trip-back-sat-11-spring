import React from 'react';

const RELOAD_KEY = 'chunk-reload-ts';
const RELOAD_WINDOW_MS = 10_000;
const MAX_ATTEMPTS = 2;

export function reloadOnceOnChunkError(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (last && Date.now() - last < RELOAD_WINDOW_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

export function lazyWithRetry<T extends React.ComponentType<Record<string, unknown>>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    for (let attempt = 0; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
        }
        return await factory();
      } catch (error) {
        if (attempt === MAX_ATTEMPTS) {
          if (reloadOnceOnChunkError()) {
            await new Promise(() => undefined);
          }
          throw error;
        }
      }
    }
    throw new Error('Failed to load module after retries');
  });
}
