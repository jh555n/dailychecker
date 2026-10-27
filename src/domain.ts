export const COLORS = ['#2F654D', '#A64F31', '#54699B', '#84613A', '#875477'] as const;
export type Routine = { id: string; name: string; color: string; symbol: string };
export type Records = Record<string, Record<string, boolean>>;
export type Data = { version: 1; routines: Routine[]; records: Records };
export const initialData: Data = {
  version: 1,
  routines: [
    { id: 'no-alcohol', name: '금주하기', color: COLORS[0], symbol: '◈' },
    { id: 'no-smoking', name: '금연하기', color: COLORS[1], symbol: '◇' },
    { id: 'exercise', name: '운동하기', color: COLORS[2], symbol: '↗' },
  ],
  records: {},
};

// Local calendar dates: never use UTC ISO strings for the user's day.
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function parseDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y!, m! - 1, d!, 12);
}
export function shiftDay(key: string, amount: number): string {
  const date = parseDate(key);
  date.setDate(date.getDate() + amount);
  return dateKey(date);
}
export function validDate(key: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(key) && dateKey(parseDate(key)) === key;
}
export function streak(records: Records, id: string, today: string): number {
  let cursor = records[today]?.[id] === undefined ? shiftDay(today, -1) : today;
  let count = 0;
  while (records[cursor]?.[id] === true) {
    count++;
    cursor = shiftDay(cursor, -1);
  }
  return count;
}
export function bestStreak(records: Records, id: string, today: string): number {
  let best = 0,
    run = 0,
    previous = '';
  for (const day of Object.keys(records)
    .filter((day) => day <= today && records[day]?.[id] === true)
    .sort()) {
    run = previous && shiftDay(previous, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }
  return best;
}
export function calendarDays(anchor: string, mode: 'month' | 'week'): string[] {
  const date = parseDate(anchor);
  if (mode === 'month') date.setDate(1);
  const weekday = (date.getDay() + 6) % 7;
  const start = shiftDay(dateKey(date), -weekday);
  const count =
    mode === 'week'
      ? 7
      : Math.ceil((weekday + new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()) / 7) *
        7;
  return Array.from({ length: count }, (_, i) => shiftDay(start, i));
}
export function setRecords(
  data: Data,
  day: string,
  values: Record<string, boolean>,
  today: string,
): Data {
  if (!validDate(day) || day > today) throw new Error('오늘 또는 과거 날짜만 기록할 수 있어요.');
  const allowed = new Set(data.routines.map((r) => r.id));
  const next: Record<string, boolean> = {};
  for (const [id, value] of Object.entries(values)) {
    if (allowed.has(id) && typeof value === 'boolean') next[id] = value;
  }
  const records = { ...data.records };
  if (Object.keys(next).length) records[day] = next;
  else delete records[day];
  return { ...data, records };
}
export function removeRoutine(data: Data, id: string): Data {
  const records: Records = {};
  for (const [day, values] of Object.entries(data.records)) {
    const remaining = Object.fromEntries(Object.entries(values).filter(([key]) => key !== id));
    if (Object.keys(remaining).length) records[day] = remaining;
  }
  return { ...data, routines: data.routines.filter((r) => r.id !== id), records };
}
export function decodeData(raw: string): Data {
  const data: unknown = JSON.parse(raw);
  const object = (v: unknown): v is Record<string, unknown> =>
    !!v && typeof v === 'object' && !Array.isArray(v);
  if (!object(data) || data.version !== 1 || !Array.isArray(data.routines) || !object(data.records))
    throw new Error('저장 형식을 읽을 수 없어요.');
  const ids = new Set<string>();
  for (const routine of data.routines) {
    if (
      !object(routine) ||
      typeof routine.id !== 'string' ||
      !routine.id ||
      ids.has(routine.id) ||
      typeof routine.name !== 'string' ||
      !routine.name.trim() ||
      routine.name.length > 30 ||
      typeof routine.color !== 'string' ||
      !COLORS.includes(routine.color as (typeof COLORS)[number]) ||
      typeof routine.symbol !== 'string'
    )
      throw new Error('루틴 데이터를 읽을 수 없어요.');
    ids.add(routine.id);
  }
  for (const [day, values] of Object.entries(data.records)) {
    if (
      !validDate(day) ||
      !object(values) ||
      Object.entries(values).some(([id, v]) => !ids.has(id) || typeof v !== 'boolean')
    )
      throw new Error('기록 데이터를 읽을 수 없어요.');
  }
  return data as Data;
}
