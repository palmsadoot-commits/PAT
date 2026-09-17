export function calculateDueDate(startDate: string, durationDays: number): string {
  const date = new Date(startDate);
  date.setDate(date.getDate() + durationDays);
  return date.toISOString();
}

export function calculateRemainingDays(dueDate: string): number {
  const now = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateUsedDays(startDate: string): number {
  const now = new Date();
  const start = new Date(startDate);
  const diffTime = now.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

export function getSLAStatus(dueDate: string, warningDays: number): 'ON_TRACK' | 'DUE_SOON' | 'OVERDUE' | 'COMPLETED' {
  const remaining = calculateRemainingDays(dueDate);
  if (remaining < 0) return 'OVERDUE';
  if (remaining <= warningDays) return 'DUE_SOON';
  return 'ON_TRACK';
}

export function isOverdue(dueDate: string): boolean {
  return calculateRemainingDays(dueDate) < 0;
}

export function getBusinessDaysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  let count = 0;
  const curDate = new Date(startDate.getTime());
  
  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
}

export function nowISO(): string {
  const now = new Date();
  now.setHours(now.getHours() + 7);
  const isoString = now.toISOString();
  return isoString.replace('Z', '+07:00');
}
