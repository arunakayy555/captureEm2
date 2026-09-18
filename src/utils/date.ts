/**
 * Formats seconds into "Xh YYm ZZs" (e.g., "0h 32m 18s", "1h 05m 42s")
 */
export const formatFocusDuration = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
};

/**
 * Gets the current user's local date/time information with day and date
 */
export const getCurrentFormattedDate = () => {
  const now = new Date();
  const dayName = now.toLocaleDateString(undefined, { weekday: 'long' });
  const dateStr = now.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    dayName,
    dateStr,
    full: `${dayName}, ${dateStr}`,
  };
};

/**
 * Converts a date or ISO string to a local YYYY-MM-DD string
 */
export const toDateKey = (dateInput?: string | Date): string => {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a YYYY-MM-DD string to a readable day and date (e.g. "18 September 2026")
 */
export const formatReadableDate = (dateKey: string): string => {
  if (!dateKey) return '';
  const [year, month, day] = dateKey.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  if (isNaN(d.getTime())) return dateKey;
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
