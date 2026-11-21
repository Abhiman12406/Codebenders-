/**
 * Date utility functions designed to eliminate timezone discrepancies
 * when parsing "YYYY-MM-DD" date strings in the browser.
 */

/**
 * Parses a YYYY-MM-DD string into a local midnight Date object
 * avoiding UTC conversion off-by-one errors.
 */
export function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  
  return new Date(dateStr);
}

/**
 * Calculates calendar days difference from today to target date string.
 * Positive (> 0): Target date was X days in the past (overdue).
 * Zero (=== 0): Target date is today.
 * Negative (< 0): Target date is X days in the future.
 */
export function getDaysDiff(targetDateStr) {
  if (!targetDateStr) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = parseLocalDate(targetDateStr);
  target.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - target.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}
