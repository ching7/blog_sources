// 首屏原则：/ 与 /desk/ 在常见桌面视口下不出现纵向滚动。需先 astro preview 在 4321 端口。
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { GREETINGS } from '../src/data/greetings.mjs';

const BASE = process.env.FOLD_BASE ?? 'http://localhost:4321';
const LONGEST = GREETINGS.map((g) => g.text).sort((a, b) => b.length - a.length)[0];
let browser;
before(async () => { browser = await chromium.launch({ channel: 'chrome' }); });
after(async () => { await browser?.close(); });

for (const [w, h] of [[1280, 720], [1440, 900]]) {
  for (const path of ['/', '/desk/']) {
    test(`${path} 在 ${w}x${h} 首屏放得下（最长欢迎语）`, async () => {
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      await page.goto(BASE + path, { waitUntil: 'networkidle' });
      await page.evaluate((t) => { document.querySelector('[data-greeting-text]').textContent = t; }, LONGEST);
      await page.evaluate(() => document.fonts.ready);
      const { sh, ih } = await page.evaluate(() => ({ sh: document.documentElement.scrollHeight, ih: innerHeight }));
      await page.close();
      assert.ok(sh <= ih, `${sh} > ${ih}`);
    });
  }
}
