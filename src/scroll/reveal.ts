export function initReveal(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sections = Array.from(document.querySelectorAll<HTMLElement>('.section'));

  if (reduced) {
    sections.forEach((s) => s.classList.add('in-view'));
    document.querySelectorAll<HTMLElement>('.metric-value').forEach(setFinal);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const section = entry.target as HTMLElement;
        section.classList.add('in-view');
        if (section.dataset.section === 'metrics') {
          section.querySelectorAll<HTMLElement>('.metric-value').forEach(animateCount);
        }
        io.unobserve(section);
      }
    },
    { threshold: 0.25 },
  );
  sections.forEach((s) => io.observe(s));
}

function setFinal(el: HTMLElement): void {
  const to = el.dataset.countTo ?? '0';
  const suffix = el.dataset.suffix ?? '';
  el.textContent = `${to}${suffix}`;
}

function animateCount(el: HTMLElement): void {
  const to = Number(el.dataset.countTo ?? '0');
  const suffix = el.dataset.suffix ?? '';
  const durationMs = 1200;
  const startTime = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - startTime) / durationMs);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = `${Math.round(eased * to)}${suffix}`;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
