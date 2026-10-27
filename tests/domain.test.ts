import assert from 'node:assert/strict';
import test from 'node:test';
import {
  bestStreak,
  calendarDays,
  dateKey,
  decodeData,
  initialData,
  parseDate,
  removeRoutine,
  setRecords,
  shiftDay,
  streak,
  validDate,
} from '../src/domain';

test('today unrecorded preserves yesterday, explicit NO resets to zero', () => {
  const records = { '2026-10-25': { exercise: true }, '2026-10-26': { exercise: true } };
  assert.equal(streak(records, 'exercise', '2026-10-27'), 2);
  assert.equal(
    streak({ ...records, '2026-10-27': { exercise: false } }, 'exercise', '2026-10-27'),
    0,
  );
  assert.equal(
    streak({ ...records, '2026-10-27': { exercise: true } }, 'exercise', '2026-10-27'),
    3,
  );
});
test('past missing day breaks the streak, future records never count', () => {
  assert.equal(
    streak(
      { '2026-10-25': { exercise: true }, '2026-10-28': { exercise: true } },
      'exercise',
      '2026-10-27',
    ),
    0,
  );
  assert.equal(
    streak(
      { '2026-10-25': { exercise: true }, '2026-10-27': { exercise: true } },
      'exercise',
      '2026-10-27',
    ),
    1,
  );
});
test('backfill repairs a chain and an edit breaks it immediately', () => {
  let data = setRecords(initialData, '2026-10-25', { exercise: true }, '2026-10-27');
  data = setRecords(data, '2026-10-27', { exercise: true }, '2026-10-27');
  assert.equal(streak(data.records, 'exercise', '2026-10-27'), 1);
  data = setRecords(data, '2026-10-26', { exercise: true }, '2026-10-27');
  assert.equal(streak(data.records, 'exercise', '2026-10-27'), 3);
  data = setRecords(data, '2026-10-26', { exercise: false }, '2026-10-27');
  assert.equal(streak(data.records, 'exercise', '2026-10-27'), 1);
  data = setRecords(data, '2026-10-27', {}, '2026-10-27');
  assert.equal(streak(data.records, 'exercise', '2026-10-27'), 0);
});
test('leap day, year transition and local midnight use calendar dates', () => {
  assert.equal(shiftDay('2024-03-01', -1), '2024-02-29');
  assert.equal(shiftDay('2026-01-01', -1), '2025-12-31');
  assert.equal(shiftDay('2025-12-31', 1), '2026-01-01');
  assert.equal(dateKey(new Date(2026, 9, 27, 0, 1)), '2026-10-27');
  assert.equal(dateKey(new Date(2026, 9, 27, 23, 59)), '2026-10-27');
  assert.equal(
    streak(
      { '2025-12-31': { exercise: true }, '2026-01-01': { exercise: true } },
      'exercise',
      '2026-01-01',
    ),
    2,
  );
  assert.equal(validDate('2026-02-29'), false);
});
test('day arithmetic survives daylight-saving boundaries', () => {
  const original = process.env.TZ;
  try {
    process.env.TZ = 'America/New_York';
    assert.equal(shiftDay('2026-03-08', 1), '2026-03-09');
    assert.equal(shiftDay('2026-11-01', 1), '2026-11-02');
    assert.equal(dateKey(parseDate('2026-03-08')), '2026-03-08');
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});
test('month and week grids begin Monday and span year/month boundaries', () => {
  const month = calendarDays('2026-02-15', 'month');
  assert.equal(month[0], '2026-01-26');
  assert.equal(month.at(-1), '2026-03-01');
  assert.equal(month.length, 35);
  assert.deepEqual(calendarDays('2026-01-01', 'week'), [
    '2025-12-29',
    '2025-12-30',
    '2025-12-31',
    '2026-01-01',
    '2026-01-02',
    '2026-01-03',
    '2026-01-04',
  ]);
  assert.equal(calendarDays('2026-03-01', 'month').length, 42);
});
test('future dates and impossible dates cannot be recorded', () => {
  assert.throws(() => setRecords(initialData, '2026-10-28', { exercise: true }, '2026-10-27'));
  assert.throws(() => setRecords(initialData, '2026-02-31', { exercise: true }, '2026-10-27'));
});
test('routines count independently and longest streak survives breaks', () => {
  const records = {
    '2026-10-24': { exercise: true, 'no-smoking': true },
    '2026-10-25': { exercise: true, 'no-smoking': false },
    '2026-10-26': { exercise: false, 'no-smoking': true },
    '2026-10-27': { exercise: true, 'no-smoking': true },
    '2026-10-28': { exercise: true },
  };
  assert.equal(streak(records, 'exercise', '2026-10-27'), 1);
  assert.equal(streak(records, 'no-smoking', '2026-10-27'), 2);
  assert.equal(bestStreak(records, 'exercise', '2026-10-27'), 2);
});
test('deleting a routine removes its records without touching other routines', () => {
  const data = setRecords(
    initialData,
    '2026-10-27',
    { exercise: true, 'no-smoking': false },
    '2026-10-27',
  );
  const next = removeRoutine(data, 'exercise');
  assert.equal(next.routines.length, 2);
  assert.deepEqual(next.records['2026-10-27'], { 'no-smoking': false });
  assert.equal(data.routines.length, 3);
  assert.equal(data.records['2026-10-27']?.exercise, true);
});
test('persistent data round-trips YES, NO and missing; malformed data is rejected', () => {
  const data = setRecords(
    initialData,
    '2026-10-27',
    { exercise: true, 'no-smoking': false },
    '2026-10-27',
  );
  assert.deepEqual(decodeData(JSON.stringify(data)), data);
  assert.throws(() => decodeData('{broken'));
  assert.throws(() => decodeData(JSON.stringify({ ...data, version: 2 })));
  assert.throws(() =>
    decodeData(JSON.stringify({ ...data, records: { '2026-02-31': { exercise: true } } })),
  );
  assert.throws(() =>
    decodeData(JSON.stringify({ ...data, records: { '2026-10-27': { exercise: 'yes' } } })),
  );
  assert.throws(() =>
    decodeData(JSON.stringify({ ...data, routines: [data.routines[0], data.routines[0]] })),
  );
});
