/** Date helpers. The backend stores naive UTC timestamps; we parse them as UTC. */

/** Parse a backend timestamp (naive UTC ISO string) into a Date. */
export function parseUtc(iso: string): Date {
  // Append Z if the string carries no timezone so it is read as UTC.
  const normalized = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
  return new Date(normalized);
}

export function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/** Whole-day difference (dueDate - today). Negative = overdue, 0 = today. */
export function daysUntil(due: Date, now = new Date()): number {
  const a = startOfDay(now).getTime();
  const b = startOfDay(due).getTime();
  return Math.round((b - a) / 86_400_000);
}

export type DueBucket = 'overdue' | 'today' | 'upcoming';

export function dueBucket(due: Date, now = new Date()): DueBucket {
  const d = daysUntil(due, now);
  if (d < 0) return 'overdue';
  if (d === 0) return 'today';
  return 'upcoming';
}

/** Human label for a group header, e.g. "Water Today", "Overdue", "Wednesday, May 22". */
export function groupLabel(due: Date, now = new Date()): string {
  const d = daysUntil(due, now);
  if (d < 0) return 'Overdue';
  if (d === 0) return 'Water Today';
  if (d === 1) return 'Tomorrow';
  return due.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

/** Short relative phrase used on cards, e.g. "in 3 days", "2 days ago", "Today". */
export function relativeDue(due: Date, now = new Date()): string {
  const d = daysUntil(due, now);
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d === -1) return 'Yesterday';
  if (d < 0) return `${Math.abs(d)} days ago`;
  return `in ${d} days`;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(d: Date): string {
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Groups plants by their due-day, preserving overdue/today first then chronological. */
export function groupByDueDate<T extends { next_due_at: string }>(
  items: T[],
  now = new Date(),
): { key: string; label: string; bucket: DueBucket; items: T[] }[] {
  const groups = new Map<string, { label: string; bucket: DueBucket; sort: number; items: T[] }>();

  for (const item of items) {
    const due = parseUtc(item.next_due_at);
    const bucket = dueBucket(due, now);
    // Overdue plants collapse into a single group; others group per calendar day.
    const dayKey = bucket === 'overdue' ? 'overdue' : startOfDay(due).toISOString();
    const sort = bucket === 'overdue' ? -1 : startOfDay(due).getTime();
    if (!groups.has(dayKey)) {
      groups.set(dayKey, { label: groupLabel(due, now), bucket, sort, items: [] });
    }
    groups.get(dayKey)!.items.push(item);
  }

  return [...groups.entries()]
    .sort((a, b) => a[1].sort - b[1].sort)
    .map(([key, g]) => ({ key, label: g.label, bucket: g.bucket, items: g.items }));
}
