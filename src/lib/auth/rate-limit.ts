/**
 * In-memory, per process. Passenger may run several processes, so the
 * effective limit can be a multiple of maxFailures; acceptable for one admin.
 */
export function createRateLimiter({ maxFailures, windowMs }: { maxFailures: number; windowMs: number }) {
  const failures = new Map<string, number[]>();

  function recent(key: string, now: number) {
    const times = (failures.get(key) ?? []).filter((time) => now - time < windowMs);
    if (times.length > 0) failures.set(key, times);
    else failures.delete(key);
    return times;
  }

  return {
    isBlocked(key: string, now = Date.now()) {
      return recent(key, now).length >= maxFailures;
    },
    recordFailure(key: string, now = Date.now()) {
      failures.set(key, [...recent(key, now), now]);
    },
    reset(key: string) {
      failures.delete(key);
    },
  };
}
