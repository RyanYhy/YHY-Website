import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import {expect,test} from '@playwright/test';

const locales=[{name:'zh',route:'./',nav:['关于','博客','项目','友链'],hello:'你好，我是 RyR',copied:'邮箱已复制'}, {name:'en',route:'en/',nav:['About','Blog','Projects','Links'],hello:"Hello! I'm RyR",copied:'Email address copied'}];
const email='19525920060@163.com';
const ready=page=>expect(page.locator('.composition')).toHaveAttribute('data-stream-state','complete');

for(const locale of locales){
 for(const width of [360,768,1440])for(const theme of ['light','dark']){
  test(`${locale.name} ${width}px ${theme}: identity, routes and axe`,async({page,baseURL})=>{
   await page.setViewportSize({width,height:1000});
   await page.addInitScript(theme=>localStorage.setItem('td-color-theme',theme),theme);
   expect((await page.goto(locale.route+'?motion=off')).status()).toBe(200);
   await expect(page.locator('html')).toHaveAttribute('data-bs-theme',theme);
   await ready(page);await expect(page.locator('h1')).toHaveText('YHY');
   const avatar=page.locator('.td-about__avatar');await expect(avatar).toBeVisible();
   expect(await avatar.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
   await expect(avatar).toHaveCSS('transform','matrix(0, -1, 1, 0, 0, 0)');
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   const nav=page.locator('.td-nav-links [data-td-navbar-region="desktop"][data-td-navbar-level="0"]');
   expect((await nav.allTextContents()).slice(0,4).map(text=>text.trim())).toEqual(locale.nav);
   await expect(page.locator('.td-language-selector__trigger').first()).toHaveAttribute('href',new URL(locale.name==='zh'?'en/':'./',baseURL).pathname);
   await expect(page.locator('.giscus,.td-shell-sidebar,.td-shell-toc,[data-td-page-actions],a[href*="/learn/"]')).toHaveCount(0);
   for(const id of ['experience','interests','robotics','intelligence','projects','shell-title'])await expect(page.locator('#'+id)).toBeVisible();
   const actions=page.locator('.page-actions .primary');
   await expect(actions).toHaveCount(4);
   const prefix=locale.name==='en'?'en/':'';
   expect(await actions.evaluateAll(links=>links.map(link=>new URL(link.href).pathname))).toEqual(['experience/','blog/','about/','links/'].map(route=>new URL(prefix+route,baseURL).pathname));
   expect((await actions.allTextContents()).map(text=>text.replace('↗','').trim())).toEqual(locale.name==='zh'?['查看项目','博客','关于','友链']:['View projects','Blog','About','Links']);
   await expect(page.locator('.record')).toHaveCount(2);
   for(const href of await page.locator('.record').evaluateAll(links=>links.map(link=>link.href)))expect((await page.request.get(href)).status()).toBe(200);
   const github=page.locator('.contact-icon[href]');await expect(github).toHaveAttribute('href','https://github.com/RyanYhy');
   await github.focus();await page.keyboard.press('Tab');await expect(page.locator('[data-about-email]')).toBeFocused();
   const {violations}=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(violations).toEqual([]);
   if(process.env.ABOUT_SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.ABOUT_SCREENSHOT_DIR,`about-${locale.name}-${width}-${theme}.png`),fullPage:true});
  });
 }
 test(`${locale.name}: hello is completed and slowly spoken by RyR`,async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('td-color-theme','light'));
  await page.goto(locale.route);await ready(page);
  const input=page.locator('#shell-input');await input.fill('hell');await input.press('Tab');await expect(input).toHaveValue('hello');
  await input.press('Enter');await expect(page.locator('.interactive-shell')).toHaveAttribute('data-reply-state','typing');
  await expect(page.locator('.inline-companion')).toBeVisible();
  await expect(page.locator('.shell-speaker')).toHaveText('RyR >');
  await expect(page.locator('.interactive-shell')).toHaveAttribute('data-reply-state','idle',{timeout:12000});
  await expect(page.locator('.shell-reply')).toContainText(locale.hello);
  const {violations}=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(violations).toEqual([]);
  expect(await page.locator('.prompt-companion svg').evaluate(el=>getComputedStyle(el).animationName)).toBe('bot-idle-hop');
  await page.locator('[data-command="help"]').click();await expect(page.locator('#reply-skip')).toBeVisible();await page.locator('#reply-skip').click();
  await expect(page.locator('.interactive-shell')).toHaveAttribute('data-reply-state','idle');await expect(page.locator('.shell-help')).toContainText('hello');
  await expect(page.locator('.shell-form button')).toHaveCount(0);
 });
 test(`${locale.name}: email copy and failure fallback`,async({page,context})=>{
  await context.grantPermissions(['clipboard-read','clipboard-write']);await page.goto(locale.route+'?motion=off');
  await page.locator('[data-about-email]').click();await expect(page.locator('#about-copy-status')).toHaveText(locale.copied);
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(email);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined}));
  await page.locator('[data-about-email]').click();await expect(page.locator('[data-about-email-fallback]')).toBeVisible();await expect(page.locator('[data-about-email-fallback]')).toHaveText(email);
 });
}

test('six poses, whole-body rock, pause and idle hop',async({page})=>{
 await page.goto('./');await ready(page);
 const mascot=page.locator('.brand-mascot');await expect(mascot.locator('.hero-frame')).toHaveCount(6);
 expect(await mascot.locator('svg').evaluate(el=>getComputedStyle(el).animationName)).toBe('hero-run-rock');
 expect(await page.locator('.prompt-companion svg').evaluate(el=>getComputedStyle(el).animationName)).toBe('bot-idle-hop');
 const toggle=page.locator('[data-about-motion]');await toggle.click();await expect(toggle).toHaveAttribute('aria-pressed','true');
 expect(await mascot.evaluate(el=>el.getAnimations({subtree:true}).every(a=>a.playState==='paused'))).toBe(true);
 await toggle.click();expect(await mascot.evaluate(el=>el.getAnimations({subtree:true}).some(a=>a.playState==='running'))).toBe(true);
});
test('clear cancels current and queued results; no late output',async({page})=>{
 await page.goto('./');await ready(page);const input=page.locator('#shell-input');
 await input.fill('hello');await input.press('Enter');await expect(page.locator('.inline-companion')).toBeVisible();
 await input.fill('experience');await input.press('Enter');await input.fill('clear');await input.press('Enter');
 await expect(page.locator('.shell-entry')).toHaveCount(0);await page.waitForTimeout(400);await expect(page.locator('.shell-entry')).toHaveCount(0);await expect(page.locator('.prompt-companion')).toBeVisible();
});
test('reduced motion and forced colors immediately reveal content without animation',async({page})=>{
 for(const media of [{reducedMotion:'reduce'},{reducedMotion:'no-preference',forcedColors:'active'}]){
  await page.emulateMedia(media);await page.goto('en/');await ready(page);
  await expect(page.locator('.ryr-about')).toHaveClass(/bots-static/);await expect(page.locator('[data-about-motion]')).toBeHidden();
  expect(await page.locator('.brand-mascot').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
  await page.locator('#shell-input').fill('hello');await page.locator('#shell-input').press('Enter');await expect(page.locator('.shell-reply')).toContainText("Hello! I'm RyR");
 }
});
test('complete profile and email remain available without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({javaScriptEnabled:false});
 try{const page=await context.newPage();await page.goto(new URL('./',baseURL).href);
  await expect(page.locator('[data-about-email-fallback]')).toBeVisible();await expect(page.locator('#robotics')).toBeVisible();await expect(page.locator('.record')).toHaveCount(2);
  for(const selector of ['.interactive-shell','[data-about-motion]','[data-about-email]'])await expect(page.locator(selector)).toBeHidden();
  expect(await page.locator('.brand-mascot').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
 }finally{await context.close();}
});
test('theme toggle and existing site routes remain usable',async({page,request})=>{
 await page.addInitScript(()=>{if(!localStorage.getItem('td-color-theme'))localStorage.setItem('td-color-theme','light');});await page.goto('./?motion=off');
 await page.locator('[data-td-theme-toggle]:visible').first().click();await expect(page.locator('html')).toHaveAttribute('data-bs-theme','dark');await expect(page.locator('body')).toHaveCSS('background-color','rgb(16, 16, 18)');
 for(const prefix of ['', 'en/']){
  for(const route of ['', 'about/','blog/','experience/','links/','experience/sample-project/'])expect((await request.get(prefix+route)).status()).toBe(200);
  expect((await request.get(prefix+'learn/')).status()).toBe(404);
 }
 expect((await request.get('experience/2026-raicom/overview/')).status()).toBe(200);
});

for(const language of ['zh','en'])for(const width of [360,768,1440])for(const theme of ['light','dark']){
 test(`${language} independent About ${width}px ${theme}`,async({page,baseURL})=>{
  await page.setViewportSize({width,height:1000});
  await page.addInitScript(theme=>localStorage.setItem('td-color-theme',theme),theme);
  const prefix=language==='en'?'en/':'';
  expect((await page.goto(prefix+'about/')).status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('yhy');
  await expect(page.locator('.about-text-panel')).toBeVisible();
  await expect(page.locator('[data-ryr-button]')).toBeEnabled();
  const identityBox=await page.locator('.about-identity').boundingBox();
  const robotBox=await page.locator('.about-robot-stage').boundingBox();
  if(width<768)expect(identityBox.y).toBeLessThan(robotBox.y);
  else {
   expect(robotBox.x).toBeLessThan(identityBox.x);
   const noteBox=await page.locator('.about-text-panel').boundingBox();
   expect(noteBox.x).toBeGreaterThanOrEqual(identityBox.x);
   expect(noteBox.x+noteBox.width).toBeLessThanOrEqual(identityBox.x+identityBox.width+1);
  }
  const noteBox=await page.locator('.about-text-panel').boundingBox();
  const contactsBox=await page.locator('.about-contacts').boundingBox();
  expect(noteBox.y).toBeGreaterThan(contactsBox.y+contactsBox.height);
  const stats=page.locator('.about-stats a');
  await expect(stats).toHaveCount(3);
  expect(await stats.evaluateAll(links=>links.map(a=>new URL(a.href).pathname))).toEqual(['blog/','experience/','tags/'].map(route=>new URL(prefix+route,baseURL).pathname));
  const numbers=await page.locator('.about-stat-value').allTextContents();
  expect(numbers.every(value=>/^\d+$/.test(value))).toBe(true);
  expect(numbers[1]).toBe('2');
  const image=page.locator('.about-portrait img');
  expect(await image.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
  await expect(image).toHaveCSS('transform','matrix(0, -1, 1, 0, 0, 0)');
  await expect(page.locator('.about-contact-icon[href]')).toHaveAttribute('href','https://github.com/RyanYhy');
  await expect(page.locator('.ryr-about,.interactive-shell,#about-data,.wordmark')).toHaveCount(0);
  await expect(page.locator('textarea')).toHaveCount(0);
  expect(await page.locator('.about-text-panel').evaluate(el=>el.getBoundingClientRect().height)).toBeGreaterThanOrEqual(340);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('.td-language-selector__trigger').first()).toHaveAttribute('href',new URL(language==='zh'?'en/about/':'about/',baseURL).pathname);
  await expect(page.locator('#projects')).toHaveAttribute('href',new URL(prefix+'#projects',baseURL).pathname+'#projects');
  const {violations}=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(violations).toEqual([]);
 });
}

for(const locale of locales){
 test(`${locale.name} About companion, keyboard, copy and fallback`,async({page,context})=>{
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto((locale.name==='en'?'en/':'')+'about/');
  const robot=page.locator('[data-ryr-button]');await robot.focus();await page.keyboard.press('Enter');
  await expect(page.locator('[data-ryr-status]')).toContainText(locale.name==='zh'?'你好，我是 RyR':"Hi, I'm RyR");
  await expect(robot).toHaveClass(/is-greeting/);
  expect(await robot.evaluate(el=>el.getAnimations({subtree:true}).some(animation=>animation.playState==='running'))).toBe(true);
  await expect(robot).not.toHaveClass(/is-greeting/,{timeout:4000});
  await page.keyboard.press('Space');await expect(page.locator('[data-ryr-status]')).toContainText(locale.name==='zh'?'很高兴见到你':'Nice to meet you');
  await page.locator('[data-contact-email]').click();await expect(page.locator('#about-email-status')).toHaveText(locale.copied);
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe(email);
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined}));
  await page.locator('[data-contact-email]').click();await expect(page.locator('[data-contact-fallback]')).toBeVisible();
  await expect(page.locator('[data-contact-fallback]')).toHaveText(email);
 });
}

test('About respects reduced motion and remains readable without JavaScript',async({page,browser,baseURL})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('about/');await page.locator('[data-ryr-button]').click();
 await expect(page.locator('[data-ryr-status]')).toContainText('RyR');
 expect(await page.locator('[data-ryr-button]').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
 const context=await browser.newContext({javaScriptEnabled:false});
 try{const staticPage=await context.newPage();await staticPage.goto(new URL('about/',baseURL).href);
  await expect(staticPage.locator('.about-text-panel')).toBeVisible();await expect(staticPage.locator('[data-contact-fallback]')).toHaveText(email);
  await expect(staticPage.locator('[data-contact-email]')).toBeHidden();await expect(staticPage.locator('[data-ryr-button]')).toBeDisabled();
 }finally{await context.close();}
});

test('light mode has a light reading surface and a matching light console; theme selection persists',async({page})=>{
 await page.addInitScript(()=>{if(!localStorage.getItem('td-color-theme'))localStorage.setItem('td-color-theme','light');});
 await page.goto('./?motion=off');
 const colors=await page.evaluate(()=>({panel:getComputedStyle(document.querySelector('.composition')).backgroundColor,console:getComputedStyle(document.querySelector('.interactive-shell')).backgroundColor,wordmark:getComputedStyle(document.querySelector('.wordmark')).color}));
 expect(colors).toEqual({panel:'rgb(252, 250, 245)',console:'rgb(240, 236, 229)',wordmark:'rgb(151, 34, 62)'});
 await page.locator('[data-td-theme-toggle]:visible').first().click();
 await expect(page.locator('html')).toHaveAttribute('data-bs-theme','dark');
 expect(await page.locator('.composition').evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(21, 20, 25)');
 await page.locator('a[href$="/about/"]').first().click();await expect(page.locator('.about-text-panel')).toBeVisible();
 await expect(page.locator('html')).toHaveAttribute('data-bs-theme','dark');
 expect(await page.evaluate(()=>localStorage.getItem('td-color-theme'))).toBe('dark');
});

test('home identity and entry points are immediately visible; about command opens the separate page',async({page,baseURL})=>{
 await page.goto('./',{waitUntil:'domcontentloaded'});
 await expect(page.locator('.identity')).toBeVisible();await expect(page.locator('.page-actions')).toBeVisible();
 await ready(page);const input=page.locator('#shell-input');await input.fill('about');await input.press('Enter');
 await expect(page.locator('.interactive-shell')).toHaveAttribute('data-reply-state','idle');
 const link=page.locator('.shell-reply a');await expect(link).toHaveAttribute('href',new URL('about/',baseURL).pathname);
 await link.click();await expect(page.locator('.about-text-panel')).toBeVisible();await expect(page.locator('.interactive-shell')).toHaveCount(0);
});
