// The independent About page has no terminal or homepage animation dependency.
(() => {
  const dataNode = document.getElementById('about-page-data');
  if (!dataNode) return;
  const data = JSON.parse(dataNode.textContent);
  const robot = document.querySelector('[data-ryr-button]');
  const reply = document.querySelector('[data-ryr-status]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const forced = matchMedia('(forced-colors: active)');
  let greeting = 0;
  let timer;
  const stop = () => { clearTimeout(timer); robot.classList.remove('is-greeting'); };
  robot.disabled = false;
  robot.addEventListener('click', () => {
    stop();
    reply.textContent = data.greetings[greeting++ % data.greetings.length];
    if (!reduced.matches && !forced.matches) {
      // Restart the short hop even when the visitor clicks again mid-greeting.
      void robot.offsetWidth;
      robot.classList.add('is-greeting');
      timer = setTimeout(stop, 1440);
    }
  });
  reduced.addEventListener('change', stop);
  forced.addEventListener('change', stop);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  const email = document.querySelector('[data-contact-email]');
  const fallback = document.querySelector('[data-contact-fallback]');
  const status = document.getElementById('about-email-status');
  email.hidden = false;
  fallback.hidden = true;
  email.addEventListener('click', async () => {
    status.textContent = '';
    try {
      await navigator.clipboard.writeText(email.dataset.contactEmail);
      fallback.hidden = true;
      status.textContent = data.copied;
    } catch {
      fallback.hidden = false;
      status.textContent = data.copy_failed;
    }
  });
})();
