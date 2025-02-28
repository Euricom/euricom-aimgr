export function getStartOfCurrentMonth(): string {
  const date = new Date();
  // Set to first day of current month
  date.setDate(1);
  // Set time to start of day (00:00:00.000)
  date.setHours(0, 0, 0, 0);
  return Math.floor(date.getTime() / 1000).toString();
}

/**
 * Gets the end of the current month (last day at 23:59:59.999) in Unix timestamp
 * @returns Unix timestamp as string
 */
export function getEndOfCurrentMonth(): string {
  const date = new Date();
  // Move to first day of next month
  date.setMonth(date.getMonth() + 1);
  date.setDate(1);
  // Subtract 1 millisecond to get last moment of current month
  date.setTime(date.getTime() - 1);
  // Set time to end of day (23:59:59.999)
  date.setHours(23, 59, 59, 999);
  return Math.floor(date.getTime() / 1000).toString();
}
