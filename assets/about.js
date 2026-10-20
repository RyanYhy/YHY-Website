(() => {
  'use strict';
  const stage = document.querySelector('.ryr-about');
  if (!stage) return;
  const c = JSON.parse(document.getElementById('about-data').textContent);
  const language = document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  const params = new URLSearchParams(location.search);
  const email = c.email;
  const experienceData = {[language]: c.experience};
  c.focus = [...document.querySelectorAll('.terminal-section h3')].map(heading => {
    const clone = heading.cloneNode(true); clone.querySelectorAll('a').forEach(link => link.remove()); return clone.textContent.trim();
  });
  const contact = document.querySelector('[data-about-contact]');
  const copy = contact.querySelector('[data-about-email]');
  const fallback = contact.querySelector('[data-about-email-fallback]');
  const status = contact.querySelector('[role="status"]');
  copy.hidden = false; fallback.hidden = true;
  let pending = false;
  copy.addEventListener('click', async () => {
    if (pending) return; pending = true; status.textContent = '';
    try { await navigator.clipboard.writeText(email); fallback.hidden = true; status.textContent = c.copied; }
    catch { fallback.hidden = false; status.textContent = c.failed; }
    finally { pending = false; }
  });
  document.querySelector('.interactive-shell').hidden = false;
function setupConsole(c) {
  const input = document.getElementById('shell-input');
  if (!input) return;
  const form = document.getElementById('shell-form');
  const shell = document.querySelector('.interactive-shell');
  const output = document.getElementById('shell-output');
  const status = document.getElementById('shell-status');
  const candidates = document.getElementById('shell-completions');
  const skip = document.getElementById('reply-skip');
  const companion = document.getElementById('typing-companion');
  const ruler = document.getElementById('input-measure');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  const zh = language === 'zh';
  const commands = ['help', 'hello', 'whoami', 'about', 'experience', 'interests', 'projects', 'blog', 'github', 'contact', 'email', 'copy email', 'clear', 'open notes'];
  const history = [];
  const queue = [];
  let cursor = 0, draft = '', composing = false, current = null, completion = null;
  output.setAttribute('aria-live', 'off');

  const text = (parent, value, tag = 'p') => { const el = document.createElement(tag); el.textContent = value; parent.append(el); return el; };
  const link = (parent, label, href) => { const a = document.createElement('a'); a.textContent = label + ' ↗'; a.href = href; parent.append(a); return a; };
  function idleBot() {
    if (current) return;
    form.append(companion); companion.className = 'typing-companion prompt-companion'; companion.dataset.state = 'ready';
    ruler.style.font = getComputedStyle(input).font;
    ruler.textContent = input.value || input.placeholder;
    const f = form.getBoundingClientRect(), i = input.getBoundingClientRect();
    const advance = Math.max(0, ruler.getBoundingClientRect().width - input.scrollLeft);
    companion.style.left = Math.min(i.left - f.left + advance + 12, f.width - 29) + 'px';
    companion.style.top = i.top - f.top + (i.height - 26) / 2 + 'px';
  }
  function hideCompletions() { completion = null; candidates.replaceChildren(); candidates.hidden = true; }
  function choose(value) { input.value = value; input.setSelectionRange(value.length, value.length); hideCompletions(); input.focus(); idleBot(); }
  function complete(event) {
    if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey || composing || event.isComposing) return;
    if (input.selectionStart !== input.selectionEnd || input.selectionEnd !== input.value.length) return;
    if (completion) {
      if (completion.index === completion.matches.length - 1) { hideCompletions(); return; }
      event.preventDefault(); completion.index++; input.value = completion.matches[completion.index];
      status.textContent = 'Completion: ' + input.value; idleBot(); return;
    }
    const prefix = input.value.trimStart().toLowerCase();
    if (!prefix) return;
    const matches = commands.filter(command => command.startsWith(prefix));
    if (!matches.length || (matches.length === 1 && matches[0] === prefix)) return;
    event.preventDefault();
    input.value = matches[0]; input.setSelectionRange(input.value.length, input.value.length);
    if (matches.length > 1) {
      completion = { matches, index: 0 }; candidates.hidden = false;
      for (const command of matches) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = command;
        button.addEventListener('click', () => choose(command)); candidates.append(button);
      }
    }
    status.textContent = matches.length === 1 ? 'Completed: ' + input.value : 'Completions: ' + matches.join(', ') + '. Tab for next; Shift Tab to leave.';
    idleBot();
  }
  function wait(ms, signal) {
    if (signal.aborted) return Promise.resolve(false);
    return new Promise(resolve => {
      const stop = () => { clearTimeout(timer); resolve(false); };
      const timer = setTimeout(() => { signal.removeEventListener('abort', stop); resolve(true); }, ms);
      signal.addEventListener('abort', stop, { once: true });
    });
  }
  async function copyEmail() {
    try { await navigator.clipboard.writeText(email); return c.copied; }
    catch { return c.failed + ' ' + email; }
  }
  function contact(parent) {
    parent.lang = 'en'; text(parent, email); link(parent, 'GitHub / RyanYhy', 'https://github.com/RyanYhy');
    const button = document.createElement('button'); button.type = 'button'; button.className = 'shell-copy'; button.textContent = 'Copy email';
    button.addEventListener('click', async () => { const result = await copyEmail(); if (parent.isConnected) { text(parent, result); status.textContent = result; } }); parent.append(button);
  }
  async function replyFor(job, parent) {
    switch (job.command) {
      case 'help': {
        parent.lang = 'en';
        const list = document.createElement('dl'); list.className = 'shell-help';
        for (const [name, detail] of [['hello','Say hello to RyR'],['whoami','Profile'],['about','About page'],['experience','Background & awards'],['interests','Interests'],['projects','Projects & notes'],['blog / github','Links'],['contact / email','Contact'],['copy email','Copy email'],['clear','Clear output']]) {
          text(list, name, 'dt'); text(list, detail, 'dd');
        }
        parent.append(list); break;
      }
      case 'hello': text(parent, 'RyR >').className = 'shell-speaker'; c.greeting.forEach(line => text(parent, line)); break;
      case 'about': link(parent, zh ? '关于我' : 'About me', c.urls.about); break;
      case 'whoami': text(parent, 'YHY / ' + c.role + ' / Explorer'); text(parent, c.bio); break;
      case 'experience': experienceData[language].forEach(item => text(parent, [item.period,item.title,item.detail,item.award].filter(Boolean).join(' · '))); break;
      case 'interests': c.focus.forEach(item => text(parent, item)); break;
      case 'projects': case 'open notes':
        c.records.forEach(record => { link(parent, record.title, record.url); text(parent, record.meta); });
        link(parent, c.projects, c.urls.projects); break;
      case 'blog': link(parent, zh ? '阅读博客' : 'Read the blog', c.urls.blog); break;
      case 'github': link(parent, 'GitHub / RyanYhy', 'https://github.com/RyanYhy'); break;
      case 'contact': case 'email': contact(parent); break;
      case 'copy email': text(parent, await job.copyResult); break;
      default: parent.lang = 'en'; text(parent, 'Command not found. Type help.');
    }
  }
  async function typeReply(job, reply) {
    const walker = document.createTreeWalker(reply, NodeFilter.SHOW_TEXT);
    const segments = []; let node;
    while ((node = walker.nextNode())) if (node.textContent && node.parentElement.tagName !== 'BUTTON') segments.push({node, value:node.textContent});
    const controls = [...reply.querySelectorAll('a, button')]; controls.forEach(el => { el.inert = true; });
    const buttons = [...reply.querySelectorAll('button')]; buttons.forEach(button => { button.hidden = true; });
    segments.forEach(segment => { segment.node.textContent = ''; });
    const immediate = () => job.fastForward || reduce.matches || forced.matches || params.get('motion') === 'off' || document.hidden;
    if (!immediate() && !(await wait(220, job.controller.signal))) return false;
    for (const segment of segments) {
      if (job.controller.signal.aborted) return false;
      const chars = Array.from(segment.value);
      const parent = segment.node.parentElement;
      companion.className = 'typing-companion inline-companion'; companion.dataset.state = 'typing'; companion.style.removeProperty('left'); companion.style.removeProperty('top'); parent.append(companion);
      for (let index = 0; index < chars.length; index += 2) {
        if (job.controller.signal.aborted) return false;
        if (immediate()) { segment.node.textContent = segment.value; break; }
        segment.node.textContent += chars.slice(index, index + 2).join('');
        output.scrollTop = output.scrollHeight;
        if (!(await wait(80, job.controller.signal))) return false;
      }
      if (!immediate() && parent.tagName !== 'DT' && !(await wait(350, job.controller.signal))) return false;
    }
    controls.forEach(el => { el.inert = false; }); buttons.forEach(button => { button.hidden = false; }); return true;
  }
  async function pump() {
    if (current || !queue.length) return;
    const job = queue.shift(); current = job; shell.dataset.replyState = 'typing'; skip.hidden = false;
    const entry = document.createElement('div'); entry.className = 'shell-entry';
    const echo = text(entry, '~ $ ' + job.raw); echo.className = 'shell-echo'; echo.lang = 'en';
    const reply = document.createElement('div'); reply.className = 'shell-reply'; reply.lang = zh ? 'zh-CN' : 'en'; reply.setAttribute('aria-busy','true'); entry.append(reply);
    try {
      await replyFor(job, reply); if (job.controller.signal.aborted) return;
      output.append(entry); while (output.children.length > 20) output.firstElementChild.remove();
      const done = await typeReply(job, reply);
      if (!done || job.controller.signal.aborted) return;
      reply.setAttribute('aria-busy','false'); status.textContent = reply.innerText;
    } finally {
      if (current === job) { current = null; skip.hidden = true; shell.dataset.replyState = 'idle'; idleBot(); output.scrollTop = output.scrollHeight; pump(); }
    }
  }
  function run(raw) {
    raw = raw.trim(); if (!raw) return;
    const command = raw.toLowerCase().replace(/\s+/g,' ');
    history.push(raw); if (history.length > 30) history.shift(); cursor = history.length; draft = ''; input.value = ''; hideCompletions();
    if (command === 'clear') {
      queue.splice(0); if (current) current.controller.abort(); current = null;
      output.replaceChildren(); skip.hidden = true; shell.dataset.replyState = 'idle'; status.textContent = 'Output cleared.'; idleBot(); return;
    }
    if (queue.length >= 5) { status.textContent = 'Queue full. Wait or clear.'; return; }
    const job = {raw,command,controller:new AbortController(),fastForward:false};
    if (command === 'copy email') job.copyResult = copyEmail();
    queue.push(job); if (current) status.textContent = 'Queued: ' + raw;
    pump(); idleBot();
  }
  shell.dataset.replyState = 'idle';
  skip.addEventListener('click', () => { if (current) current.fastForward = true; });
  form.addEventListener('submit', event => { event.preventDefault(); if (!composing) run(input.value); });
  document.querySelectorAll('[data-command]').forEach(button => button.addEventListener('click', () => run(button.dataset.command)));
  input.addEventListener('input', () => { hideCompletions(); idleBot(); });
  input.addEventListener('scroll', idleBot);
  input.addEventListener('compositionstart', () => { composing = true; }); input.addEventListener('compositionend', () => { composing = false; });
  input.addEventListener('keydown', event => {
    if (composing || event.isComposing) return;
    if (event.key === 'Tab') { complete(event); return; }
    if (event.key === 'ArrowUp' && history.length) { event.preventDefault(); hideCompletions(); if (cursor === history.length) draft = input.value; cursor = Math.max(0,cursor-1); input.value = history[cursor]; idleBot(); }
    else if (event.key === 'ArrowDown' && cursor < history.length) { event.preventDefault(); hideCompletions(); cursor++; input.value = cursor === history.length ? draft : history[cursor]; idleBot(); }
    else if (event.key === 'Escape') { hideCompletions(); input.blur(); }
  });
  forced.addEventListener('change', () => { if (forced.matches && current) current.fastForward = true; });
  reduce.addEventListener('change', () => { if (reduce.matches && current) current.fastForward = true; });
  document.addEventListener('visibilitychange', () => { if (document.hidden && current) current.fastForward = true; });
  window.addEventListener('pagehide', () => {queue.splice(0); current?.controller.abort();});
  new ResizeObserver(idleBot).observe(form); document.fonts.ready.then(idleBot); idleBot();
}

function setupProfileStream() {
  const container = document.querySelector('.ryr-about .composition');
  const control = document.getElementById('stream-control');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  control.hidden = false;
  const selectors = [ '.profile-content .pixel-heading', '.experience-entry', '.terminal-section > h2', '.terminal-section h3', '.record', '.interactive-shell'];
  const stages = [...container.querySelectorAll(selectors.join(','))];
  stages.forEach((stage, index) => { stage.classList.add('stream-stage'); stage.dataset.streamIndex = index; });
  let timer;
  let cursor;
  function finish() {
    clearTimeout(timer);
    stages.forEach(stage => { stage.classList.remove('stream-pending'); stage.inert = false; });
    container.dataset.streamState = 'complete'; container.setAttribute('aria-busy', 'false');
    control.textContent = '[replay]'; control.setAttribute('aria-label', 'Replay profile output');
    control.hidden = reduce.matches || forced.matches;
  }
  function start(manual = false) {
    clearTimeout(timer);
    if (reduce.matches || forced.matches || (!manual && params.get('motion') === 'off')) { finish(); return; }
    cursor = 0;
    container.dataset.streamState = 'streaming'; container.setAttribute('aria-busy', 'true');
    control.textContent = '[skip]'; control.setAttribute('aria-label', 'Skip profile output');
    stages.forEach(stage => { stage.classList.add('stream-pending'); stage.inert = true; });
    const next = () => {
      if (cursor === stages.length) { finish(); return; }
      stages[cursor].classList.remove('stream-pending'); stages[cursor].inert = false; cursor++;
      timer = setTimeout(next, 250);
    };
    next();
  }
  control.addEventListener('click', () => container.dataset.streamState === 'streaming' ? finish() : start(true));
  forced.addEventListener('change', () => { if (forced.matches) finish(); else control.hidden = reduce.matches; });
  reduce.addEventListener('change', () => { if (reduce.matches) finish(); else control.hidden = false; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); });
  start();
}

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  const motion = document.querySelector('[data-about-motion]');
  let paused = false;
  function syncMotion() {
    const disabled = reduce.matches || forced.matches || params.get('motion') === 'off';
    stage.classList.toggle('bots-static', disabled);
    stage.classList.toggle('bots-paused', paused || document.hidden);
    motion.hidden = disabled;
    motion.setAttribute('aria-pressed', String(paused));
    motion.setAttribute('aria-label', paused ? motion.dataset.resume : motion.dataset.pause);
    motion.textContent = paused ? '[resume bot]' : '[pause bot]';
  }
  motion.addEventListener('click', () => {paused = !paused; syncMotion();});
  reduce.addEventListener('change', syncMotion); forced.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  syncMotion(); setupConsole(c); setupProfileStream();
})();
