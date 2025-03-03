export function getStartOfCurrentMonth(): string {
  const date = new Date();
  // Set to the first day of the current month
  date.setUTCDate(1); // Use UTC to avoid timezone issues
  date.setUTCHours(0, 0, 0, 0);
  return Math.floor(date.getTime() / 1000).toString();
}

export function getEndOfCurrentMonth(): string {
  const date = new Date();
  // Move to first day of next month
  date.setUTCMonth(date.getUTCMonth() + 1);
  date.setUTCDate(1);
  // Subtract 1 day to get the last day of the current month
  date.setUTCDate(date.getUTCDate() - 1);
  // Set time to end of day (23:59:59.999)
  date.setUTCHours(23, 59, 59, 999);

  return Math.floor(date.getTime() / 1000).toString();
}
