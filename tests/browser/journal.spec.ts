import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-27T12:00:00+09:00') });
  await page.goto('/');
  await expect(page.getByRole('tab', { name: '나의 기록' })).toBeVisible();
});

test('record YES and NO, backfill, edit, and retain data across reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.getByRole('button', { name: '＋  기록 남기기' }).click();
  await page.getByRole('button', { name: '금주하기 YES', exact: true }).click();
  await page.getByRole('button', { name: '금연하기 NO', exact: true }).click();
  await page.getByRole('button', { name: '기록 저장하기' }).click();
  await expect(page.getByText('현재 1일 연속', { exact: true })).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: '2026-10-27, 오늘, YES 1개, NO 1개', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '2026-10-26, YES 0개, NO 0개', exact: true }).click();
  await page.getByRole('button', { name: '＋  기록 남기기' }).click();
  await page.getByRole('button', { name: '금주하기 YES', exact: true }).click();
  await page.getByRole('button', { name: '기록 저장하기' }).click();
  await expect(page.getByText('현재 2일 연속', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('현재 2일 연속', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '2026-10-26, YES 1개, NO 0개', exact: true }).click();
  await page.getByRole('button', { name: '＋  기록 남기기' }).click();
  await page.getByRole('button', { name: '금주하기 NO', exact: true }).click();
  await page.getByRole('button', { name: '기록 저장하기' }).click();
  await expect(page.getByText('현재 1일 연속', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: '2026-10-28, YES 0개, NO 0개, 미래 날짜', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: '주 보기', exact: true }).click();
  await expect(page.getByRole('button', { name: /^2026-/ })).toHaveCount(7);
  await page.getByRole('button', { name: '이전 주', exact: true }).click();
  await expect(page.getByRole('button', { name: /^2026-10-19,/ })).toBeVisible();
  await page.getByRole('button', { name: '오늘', exact: true }).click();
  await page.getByRole('button', { name: '월 보기', exact: true }).click();
  await expect(page.getByRole('button', { name: /^2026-/ })).toHaveCount(35);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('tablist', { name: '기록 메뉴' }).evaluate(el => el.scrollIntoView({ block: 'start' }));
  await page.screenshot({ path: 'test-results/live-calendar.png' });
  await page.getByRole('tab', { name: '돌아보기' }).click();
  await expect(page.getByText('나의 꾸준함을 돌아봐요')).toBeVisible();
  expect(errors).toEqual([]);
});

test('narrow screen supports keyboard routine creation and record editing without losing focus', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.getByRole('tab', { name: '루틴 관리' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: '＋ 추가', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('textbox', { name: '루틴 이름' }).fill('테스트용 책 10쪽 읽기');
  await page.getByRole('button', { name: '루틴 추가하기', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('테스트용 책 10쪽 읽기', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: '나의 기록' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: '＋  기록 남기기' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  for (let i = 0; i < 18; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null)).toBe(true);
  }
  await page.getByRole('button', { name: '테스트용 책 10쪽 읽기 YES', exact: true }).focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: '테스트용 책 10쪽 읽기 YES', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '기록 저장하기' }).focus();
  await page.keyboard.press('Enter');
  await page.reload();
  await expect(page.getByText('현재 1일 연속', { exact: true })).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: '＋  기록 남기기' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.screenshot({ path: 'test-results/live-record-mobile.png' });
});

test('create, rename, reject duplicates, confirm deletion and persist management', async ({
  page,
}) => {
  await page.getByRole('tab', { name: '루틴 관리' }).click();
  await page.getByRole('button', { name: '＋ 추가', exact: true }).click();
  await page.getByRole('textbox', { name: '루틴 이름' }).fill('독서하기');
  await page.getByRole('button', { name: '파랑 색상' }).click();
  await page.getByRole('button', { name: '루틴 추가하기', exact: true }).click();
  await expect(page.getByText('독서하기', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '독서하기 수정' }).click();
  await page.getByRole('textbox', { name: '루틴 이름' }).fill('금주하기');
  await expect(page.getByRole('button', { name: '변경 저장하기' })).toBeDisabled();
  await page.getByRole('textbox', { name: '루틴 이름' }).fill('책 10쪽 읽기');
  await page.getByRole('button', { name: '변경 저장하기' }).click();
  await page.reload();
  await page.getByRole('tab', { name: '루틴 관리' }).click();
  await page.getByRole('button', { name: '책 10쪽 읽기 수정' }).click();
  await page.getByRole('button', { name: '이 루틴 삭제', exact: true }).click();
  await page.getByRole('button', { name: '취소', exact: true }).click();
  await expect(page.getByRole('textbox', { name: '루틴 이름' })).toHaveValue('책 10쪽 읽기');
  await page.getByRole('button', { name: '이 루틴 삭제', exact: true }).click();
  await page.getByRole('button', { name: '루틴과 기록 삭제', exact: true }).click();
  await expect(page.getByText('책 10쪽 읽기', { exact: true })).toHaveCount(0);
});

test('midnight updates today; unrecorded yesterday resets the streak', async ({ page }) => {
  await page.getByRole('button', { name: '＋  기록 남기기' }).click();
  await page.getByRole('button', { name: '금주하기 YES', exact: true }).click();
  await page.getByRole('button', { name: '기록 저장하기' }).click();
  await page.clock.setSystemTime(new Date('2026-10-28T00:00:01+09:00'));
  await page.clock.runFor(15000);
  await expect(page.getByText('10.28 오늘', { exact: true })).toBeVisible();
  await expect(page.getByText('현재 1일 연속', { exact: true })).toBeVisible();
  await page.clock.setSystemTime(new Date('2026-10-29T00:00:01+09:00'));
  await page.clock.runFor(15000);
  await expect(page.getByText('10.29 오늘', { exact: true })).toBeVisible();
  await expect(page.getByText('현재 0일 연속', { exact: true })).toHaveCount(3);
});

test('corrupt storage is not overwritten and can be retried', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('dailychecker:v1', '{invalid'));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('기존 데이터는 그대로 보존됩니다');
  expect(await page.evaluate(() => localStorage.getItem('dailychecker:v1'))).toBe('{invalid');
  await page.evaluate(() => localStorage.removeItem('dailychecker:v1'));
  await page.getByRole('button', { name: '다시 불러오기' }).click();
  await expect(page.getByRole('tab', { name: '나의 기록' })).toBeVisible();
});

test('privacy information is readable without login', async ({ page }) => {
  await page.getByRole('button', { name: '개인정보 안내', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '개인정보 안내' })).toBeVisible();
  await expect(page.getByText('이 기기에 저장해요', { exact: true })).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
      .violations,
  ).toEqual([]);
  await page.getByRole('button', { name: '닫기', exact: true }).click();
});

test('failed storage write keeps the editor open and preserves the previous record', async ({
  page,
}) => {
  await page.getByRole('button', { name: '＋  기록 남기기' }).click();
  await page.getByRole('button', { name: '금주하기 YES', exact: true }).click();
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Full', 'QuotaExceededError');
    };
  });
  await page.getByRole('button', { name: '기록 저장하기' }).click();
  await expect(page.getByRole('alert')).toContainText('기록을 저장하지 못했어요');
  await expect(page.getByRole('button', { name: '금주하기 YES', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(await page.evaluate(() => localStorage.getItem('dailychecker:v1'))).toBeNull();
  await page.reload();
  await expect(page.getByText('현재 0일 연속', { exact: true })).toHaveCount(3);
});

test('calendar and forms pass automated WCAG checks; keyboard opens and closes a dialog', async ({
  page,
}) => {
  const audit = () =>
    new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect((await audit()).violations).toEqual([]);
  const opener = page.getByRole('button', { name: '＋  기록 남기기' });
  await opener.focus();
  await page.keyboard.press('Enter');
  // The dialog becomes active after its opening animation ends.
  await expect(page.getByRole('dialog')).toBeVisible();
  expect((await audit()).violations).toEqual([]);
  await page.keyboard.press('Tab');
  expect(
    await page.evaluate(() => document.activeElement?.closest('[aria-modal="true"]') !== null),
  ).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: '기록 저장하기' })).toHaveCount(0);
  await expect(opener).toBeFocused();
  await page.getByRole('tab', { name: '루틴 관리' }).click();
  await page.getByRole('button', { name: '＋ 추가', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect((await audit()).violations).toEqual([]);
});

for (const width of [320, 768, 1024, 1440]) {
  test(`responsive layout at ${width}px and usable record dialog`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.getByRole('button', { name: '월 보기' })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: `test-results/calendar-${width}.png`, fullPage: true });
    await page.getByRole('button', { name: '＋  기록 남기기' }).click();
    await expect(page.getByRole('button', { name: '기록 저장하기' })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.getByRole('button', { name: '닫기', exact: true }).click();
  });
}
