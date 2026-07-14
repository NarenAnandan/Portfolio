import type { Resume, Metric } from './types';

function el(tag: string, className?: string, html?: string): HTMLElement {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (html !== undefined) n.innerHTML = html;
  return n;
}

function section(id: string): HTMLElement {
  const s = el('section', 'section');
  s.setAttribute('data-section', id);
  return s;
}

function metricSpan(m: Metric): string {
  // "30%" -> count 30 suffix % ; "95%+" -> count 95 suffix %+
  const match = m.value.match(/^(\d+)(.*)$/);
  const to = match ? match[1] : '0';
  const suffix = match ? match[2] : m.value;
  return `<span class="metric-value" data-count-to="${to}" data-suffix="${suffix}">0${suffix}</span>`;
}

export function renderContent(root: HTMLElement, data: Resume): void {
  root.innerHTML = '';
  const p = data.profile;

  // Hero
  const hero = section('hero');
  hero.appendChild(el('p', 'eyebrow', 'Hello — I’m'));
  hero.appendChild(el('h1', 'hero-name', p.name));
  hero.appendChild(el('p', 'hero-roles', p.roles.join(' · ')));
  hero.appendChild(el('p', 'hero-tagline', p.tagline));
  hero.appendChild(el('p', 'hero-exp', p.experienceLine));
  const cta = el('div', 'cta');
  cta.innerHTML =
    `<a class="btn btn-primary" href="${p.resumeUrl}" target="_blank" rel="noopener noreferrer">Download Resume</a>` +
    `<a class="btn btn-ghost" href="#contact">Get in touch →</a>`;
  hero.appendChild(cta);
  const social = el('div', 'social');
  social.innerHTML =
    `<a href="${p.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">LinkedIn</a>` +
    `<a href="${p.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">GitHub</a>`;
  hero.appendChild(social);
  root.appendChild(hero);

  // About + tech stack
  const about = section('about');
  about.appendChild(el('h2', 'section-title', 'About'));
  about.appendChild(el('p', 'about-body', data.about));
  const grid = el('div', 'tech-grid');
  for (const c of data.techStack) {
    const cat = el('div', 'tech-cat');
    cat.appendChild(el('h3', 'tech-cat-title', c.category));
    const tags = el('div', 'tech-tags');
    for (const it of c.items) tags.appendChild(el('span', 'tag', it));
    cat.appendChild(tags);
    grid.appendChild(cat);
  }
  about.appendChild(grid);
  root.appendChild(about);

  // Experience
  const exp = section('experience');
  exp.appendChild(el('h2', 'section-title', 'Experience'));
  for (const e of data.experience) {
    const card = el('article', 'exp-card');
    card.appendChild(el('h3', 'exp-role', e.role));
    card.appendChild(el('p', 'exp-company', `${e.company} · ${e.period}`));
    const ul = el('ul', 'exp-bullets');
    for (const b of e.bullets) ul.appendChild(el('li', undefined, b));
    card.appendChild(ul);
    exp.appendChild(card);
  }
  root.appendChild(exp);

  // Case studies
  const cs = section('casestudies');
  cs.appendChild(el('h2', 'section-title', 'Featured Work'));
  for (const c of data.caseStudies) {
    const card = el('article', 'case-card');
    card.appendChild(el('h3', 'case-title', c.title));
    card.appendChild(el('p', 'case-line', `<strong>Problem.</strong> ${c.problem}`));
    card.appendChild(el('p', 'case-line', `<strong>Architecture.</strong> ${c.architecture}`));
    card.appendChild(el('p', 'case-line', `<strong>Built.</strong> ${c.built}`));
    card.appendChild(el('p', 'case-line case-outcome', `<strong>Outcome.</strong> ${c.outcome}`));
    cs.appendChild(card);
  }
  root.appendChild(cs);

  // Metrics + certifications
  const metrics = section('metrics');
  metrics.appendChild(el('h2', 'section-title', 'Impact & Certifications'));
  const mrow = el('div', 'metric-row');
  for (const m of data.metrics) {
    const mc = el('div', 'metric');
    mc.innerHTML = metricSpan(m);
    mc.appendChild(el('p', 'metric-label', m.label));
    mrow.appendChild(mc);
  }
  metrics.appendChild(mrow);
  const certs = el('div', 'cert-row');
  for (const c of data.certifications) {
    const a = el('a', 'cert') as HTMLAnchorElement;
    a.href = c.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = c.name;
    certs.appendChild(a);
  }
  metrics.appendChild(certs);
  root.appendChild(metrics);

  // Education
  const edu = section('education');
  edu.appendChild(el('h2', 'section-title', 'Education'));
  for (const e of data.education) {
    const card = el('article', 'edu-card');
    card.appendChild(el('h3', 'edu-degree', e.degree));
    card.appendChild(el('p', 'edu-school', `${e.school} · ${e.period}`));
    edu.appendChild(card);
  }
  root.appendChild(edu);

  // Contact
  const contact = section('contact');
  contact.id = 'contact';
  contact.appendChild(el('h2', 'section-title', 'Contact'));
  contact.appendChild(el('p', 'contact-line', `Email: <strong>${p.email}</strong>`));
  contact.appendChild(el('p', 'contact-line', `Phone: <strong>${p.phone}</strong>`));
  const foot = el('div', 'social');
  foot.innerHTML =
    `<a href="${p.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a>` +
    `<a href="${p.github}" target="_blank" rel="noopener noreferrer">GitHub</a>`;
  contact.appendChild(foot);
  contact.appendChild(el('p', 'copyright', `© 2026 ${p.name}. All rights reserved.`));
  root.appendChild(contact);
}
