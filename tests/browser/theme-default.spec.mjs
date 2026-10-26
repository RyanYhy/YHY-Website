import {expect, test} from '@playwright/test';

const root = page => page.locator('html');
const toggle = page => page.locator('[data-td-theme-toggle]:visible').first();
const ready = page => expect.poll(() => root(page).getAttribute('data-td-theme-init')).toBeNull();

for (const route of ['', 'en/', 'about/', 'blog/', 'experience/2026-raicom/overview/', 'links/']) {
  test(`fresh visitor defaults dark on ${route || 'home'} despite a light OS`, async ({page}) => {
    await page.emulateMedia({colorScheme: 'light'});
    await page.goto(route || './');
    await ready(page);
    await expect(root(page)).toHaveAttribute('data-bs-theme', 'dark');
    await expect(root(page)).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('[data-site-theme-color]')).toHaveAttribute('content', '#0e0b0b');
    expect(await page.evaluate(() => localStorage.getItem('td-color-theme'))).toBeNull();
    await page.emulateMedia({colorScheme: 'dark'});
    await page.emulateMedia({colorScheme: 'light'});
    await expect(root(page)).toHaveAttribute('data-bs-theme', 'dark');
  });
}

test('manual light choice persists across reload, language and page changes', async ({page}) => {
  await page.emulateMedia({colorScheme: 'dark'});
  await page.goto('./'); await ready(page); await toggle(page).click();
  await expect(root(page)).toHaveAttribute('data-bs-theme', 'light');
  await expect(page.locator('[data-site-theme-color]')).toHaveAttribute('content', '#f6efe6');
  expect(await page.evaluate(() => localStorage.getItem('td-color-theme'))).toBe('light');
  await page.reload(); await ready(page);
  await expect(root(page)).toHaveAttribute('data-bs-theme', 'light');
  await page.goto('en/about/'); await ready(page);
  await expect(root(page)).toHaveAttribute('data-bs-theme', 'light');
  await toggle(page).click(); await expect(root(page)).toHaveAttribute('data-bs-theme', 'dark');
  await page.reload(); await ready(page); await expect(root(page)).toHaveAttribute('data-bs-theme', 'dark');
});

test('explicit auto continues following OS changes', async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('td-color-theme', 'auto'));
  await page.emulateMedia({colorScheme: 'light'}); await page.goto('./'); await ready(page);
  await expect(root(page)).toHaveAttribute('data-bs-theme', 'light');
  await page.emulateMedia({colorScheme: 'dark'});
  await expect(root(page)).toHaveAttribute('data-bs-theme', 'dark');
  await page.emulateMedia({colorScheme: 'light'});
  await expect(root(page)).toHaveAttribute('data-bs-theme', 'light');
});

test('invalid stored preference falls back to dark', async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('td-color-theme', 'invalid'));
  await page.emulateMedia({colorScheme: 'light'}); await page.goto('./'); await ready(page);
  await expect(root(page)).toHaveAttribute('data-bs-theme', 'dark');
});

test('blocked storage keeps dark default and a working in-page switch', async ({page}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {get() {throw new DOMException('Blocked', 'SecurityError');}});
  });
  await page.emulateMedia({colorScheme: 'light'}); await page.goto('./'); await ready(page);
  await expect(root(page)).toHaveAttribute('data-bs-theme', 'dark');
  await toggle(page).click(); await expect(root(page)).toHaveAttribute('data-bs-theme', 'light');
  await page.emulateMedia({colorScheme: 'dark'});
  await expect(root(page)).toHaveAttribute('data-bs-theme', 'light');
  await toggle(page).click(); await expect(root(page)).toHaveAttribute('data-bs-theme', 'dark');
});

test('static HTML is dark even with JavaScript disabled and a light OS', async ({browser, baseURL}) => {
  const context = await browser.newContext({javaScriptEnabled: false, colorScheme: 'light'});
  try {
    const page = await context.newPage(); await page.goto(baseURL);
    await expect(root(page)).toHaveAttribute('data-bs-theme', 'dark');
    await expect(root(page)).toHaveCSS('color-scheme', 'dark');
  } finally { await context.close(); }
});

for (const preference of [null, 'light']) {
  test(`head resolves ${preference || 'default dark'} before styles and runtime load`, async ({page}) => {
    if (preference) await page.addInitScript(value => localStorage.setItem('td-color-theme', value), preference);
    await page.emulateMedia({colorScheme: 'light'});
    let release;
    const gate = new Promise(resolve => {release = resolve;});
    await page.route(/\.(css|js)(\?.*)?$/, async route => {await gate; await route.abort();});
    try {
      await page.goto('./', {waitUntil: 'commit'});
      await expect(root(page)).toHaveAttribute('data-bs-theme', preference || 'dark');
      await expect(root(page)).toHaveCSS('background-color', preference ? 'rgb(246, 239, 230)' : 'rgb(14, 11, 11)');
      expect(await root(page).getAttribute('data-td-theme-init')).not.toBeNull();
    } finally { release(); await page.unrouteAll({behavior: 'wait'}); }
  });
}
