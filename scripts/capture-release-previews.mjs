import fs from 'node:fs';
import { chromium } from '@playwright/test';

const destination = new URL('../release/screenshots/web-previews/', import.meta.url);
fs.mkdirSync(destination, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_PATH ||
    (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
  args: ['--no-sandbox'],
});
try {
  for (const [device, width, height, scale] of [
    ['phone', 440, 956, 3],
    ['tablet', 1032, 1376, 2],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: scale,
      timezoneId: 'Asia/Seoul',
    });
    await context.addInitScript(() => {
      const routines = [
        { id: 'reading', name: '책 10쪽 읽기', color: '#2F654D', symbol: '◈' },
        { id: 'exercise', name: '30분 운동하기', color: '#54699B', symbol: '↗' },
        { id: 'water', name: '물 충분히 마시기', color: '#A64F31', symbol: '◇' },
      ];
      const records = {};
      for (let day = 10; day <= 27; day++)
        records[`2026-10-${day}`] = {
          reading: day !== 17,
          exercise: day % 4 !== 0,
          water: day % 5 !== 0,
        };
      delete records['2026-10-27'].water;
      localStorage.setItem('dailychecker:v1', JSON.stringify({ version: 1, routines, records }));
    });
    const page = await context.newPage();
    await page.clock.install({ time: new Date('2026-10-27T12:00:00+09:00') });
    await page.goto(process.env.PREVIEW_BASE_URL || 'http://127.0.0.1:8082');
    const navigation = page.getByRole('tablist', { name: '기록 메뉴' });
    await navigation.waitFor();
    await navigation.evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: new URL(`${device}-01-calendar.png`, destination).pathname });
    await page.getByRole('button', { name: '＋  기록 남기기' }).click();
    await page.getByRole('dialog').waitFor();
    await page.screenshot({ path: new URL(`${device}-02-record.png`, destination).pathname });
    await page.getByRole('button', { name: '닫기', exact: true }).click();
    await page.getByRole('tab', { name: '돌아보기' }).click();
    await navigation.evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await page.screenshot({ path: new URL(`${device}-03-insights.png`, destination).pathname });
    await context.close();
  }
} finally {
  await browser.close();
}
console.log('Created six web-only layout previews. These are NOT native App Store screenshots.');
