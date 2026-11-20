const countFormat = new Intl.NumberFormat();

/** 12345 → "12,345" in the user's locale. */
export function formatCount(value: number): string {
  return countFormat.format(value);
}

/** Milliseconds as a clock: "0:42", "4:02", "1:04:02". */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${seconds}`
    : `${minutes}:${seconds}`;
}

/** Rough reading time for a word count: "under a minute", "about 4 min", "about 1 h 20 min". */
export function formatReadingTime(words: number, wpm: number): string {
  const minutes = Math.round(words / wpm);
  if (minutes < 1) return 'under a minute';
  if (minutes < 60) return `about ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `about ${hours} h` : `about ${hours} h ${rest} min`;
}
