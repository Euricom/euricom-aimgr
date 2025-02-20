export function getStartOfCurrentMonth(): string {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return Math.floor(date.getTime() / 1000).toString();
}

export function getEndOfToday(): string {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return Math.floor(date.getTime() / 1000).toString();
}
