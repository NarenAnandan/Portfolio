# Infrastructure City Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the static Bootstrap portfolio as a scroll-driven Three.js "cloud infrastructure city" that flies the camera through a stylized reference architecture, positioning Naren Anandan for senior DevOps/Platform/SRE/Cloud roles.

**Architecture:** Three independent layers — a typed content layer (`src/content/`) rendered into DOM for SEO/ATS, a modular procedural 3D world (`src/world/`), and a scroll/camera layer (`src/scroll/`) that maps scroll progress to camera motion along a spline via GSAP ScrollTrigger + Lenis. Progressive enhancement: the DOM content is fully functional with the 3D canvas removed (WebGL-off, reduced-motion, low-power fallbacks).

**Tech Stack:** Vite, TypeScript, Three.js, GSAP (ScrollTrigger), Lenis, Vitest (unit), Playwright (smoke), Firebase Hosting.

## Global Constraints

- **No paid/AI asset tooling.** All 3D is procedural Three.js geometry — no Higgsfield, no external model/texture downloads.
- **No fabricated facts.** All resume copy derives from the owner's real existing content. Unknown specifics are literal `[TODO: ...]` strings in the content data, never invented numbers.
- **Real job titles preserved** exactly as in the current site.
- **Progressive enhancement is mandatory.** Every content section must be present and readable in the DOM with WebGL disabled.
- **Node** >= 18. **Package manager:** npm. **TypeScript** strict mode on.
- **Deploy target:** static build to `dist/`, hosted on Firebase Hosting (retained).
- **Accessibility:** honor `prefers-reduced-motion`; semantic headings; text lives in DOM, not canvas.
- Dependency versions: `three@^0.169`, `gsap@^3.12`, `lenis@^1.1`, `vite@^5`, `typescript@^5`, `vitest@^2`, `@playwright/test@^1.47` (use latest stable within range).

---

## File Structure

```
Portfolio/
├── index.html                 # Vite entry; canvas + content root + meta/SEO
├── package.json               # scripts + deps
├── tsconfig.json              # strict TS
├── vite.config.ts             # build → dist/, base './'
├── vitest.config.ts           # jsdom env for unit tests
├── playwright.config.ts       # smoke test config
├── src/
│   ├── main.ts                # boot: renderer, world, content, scroll, loop
│   ├── content/
│   │   ├── types.ts           # Resume data interfaces
│   │   ├── resume.ts          # the single source of truth (real content)
│   │   └── render.ts          # data → semantic DOM sections
│   ├── world/
│   │   ├── capability.ts      # WebGL detection + device tier (pure, tested)
│   │   ├── renderer.ts        # Three renderer + scene + resize + loop
│   │   ├── materials.ts       # shared emissive/glass materials + palette
│   │   ├── city.ts            # skyline + VPC district
│   │   ├── pipeline.ts        # CI/CD corridor
│   │   ├── cluster.ts         # Kubernetes cluster
│   │   ├── tower.ts           # observability tower + ground/HQ
│   │   └── postprocess.ts     # bloom pass
│   ├── scroll/
│   │   ├── path.ts            # camera spline + progress→pose math (tested)
│   │   ├── timeline.ts        # GSAP ScrollTrigger + Lenis wiring
│   │   └── reveal.ts          # section reveals + metric counters
│   └── styles/
│       └── main.css           # design system: palette, type, glass cards
├── tests/
│   ├── content.test.ts        # content data integrity
│   ├── render.test.ts         # DOM rendering (jsdom)
│   ├── capability.test.ts     # fallback logic
│   ├── path.test.ts           # camera path math
│   └── smoke.spec.ts          # Playwright end-to-end smoke
├── firebase.json              # public → dist
└── .github/workflows/firebase-hosting-merge.yml  # build then deploy
```

Legacy `index.html` (Bootstrap), `css/`, `scripts/`, `images/illustrations/`, `construction.html`, `toggle-site.sh`, `public/` are retired in Task 16 after verification.

---

## Task 1: Project scaffolding (Vite + TS + tooling)

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `index.html`
- Create: `src/main.ts` (stub)

**Interfaces:**
- Produces: a running Vite dev server; `npm run build` → `dist/`; `npm test` runs Vitest.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "portfolio",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "three": "^0.169.0",
    "gsap": "^3.12.5",
    "lenis": "^1.1.13",
    "@fontsource/space-grotesk": "^5.1.0",
    "@fontsource/ibm-plex-mono": "^5.1.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.47.0",
    "@types/three": "^0.169.0",
    "jsdom": "^25.0.0",
    "typescript": "^5.6.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "types": ["vite/client"],
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src", "tests"]
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: { outDir: 'dist', sourcemap: false, target: 'es2020' },
});
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'jsdom', include: ['tests/**/*.test.ts'] },
});
```

- [ ] **Step 5: Create `index.html`**

```html
<!doctype html>
<html lang="en-US">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Naren Anandan — DevOps · Platform · SRE · Cloud</title>
    <meta name="description" content="Naren Anandan — senior infrastructure engineer. DevOps, Platform, SRE and Cloud. AWS, Terraform, Kubernetes, CI/CD, observability." />
    <meta property="og:title" content="Naren Anandan — DevOps · Platform · SRE · Cloud" />
    <meta property="og:description" content="Senior infrastructure engineer portfolio." />
    <meta property="og:type" content="website" />
  </head>
  <body>
    <canvas id="scene" aria-hidden="true"></canvas>
    <main id="content"></main>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `src/main.ts` stub**

```ts
console.log('Infrastructure City boot');
```

- [ ] **Step 7: Install and verify dev server**

Run: `npm install && npm run build`
Expected: install succeeds; `dist/` is produced with no TS errors.

- [ ] **Step 8: Commit**

```bash
git add package.json tsconfig.json vite.config.ts vitest.config.ts index.html src/main.ts package-lock.json
git commit -m "chore: scaffold Vite + TS + Three.js project"
```

---

## Task 2: Content types + real resume data

**Files:**
- Create: `src/content/types.ts`, `src/content/resume.ts`
- Test: `tests/content.test.ts`

**Interfaces:**
- Produces: `interface Resume` and named export `resume: Resume`. Consumed by render + reveal layers.

- [ ] **Step 1: Write the failing test (`tests/content.test.ts`)**

```ts
import { describe, it, expect } from 'vitest';
import { resume } from '../src/content/resume';

describe('resume data', () => {
  it('has core profile fields', () => {
    expect(resume.profile.name).toBe('Naren Anandan');
    expect(resume.profile.roles).toContain('DevOps');
    expect(resume.profile.location).toMatch(/Ottawa/);
  });

  it('has at least 4 experience entries in reverse-chronological order', () => {
    expect(resume.experience.length).toBeGreaterThanOrEqual(4);
    expect(resume.experience[0].company).toBe('Shopliftr');
  });

  it('has categorized tech stack with real tools', () => {
    const cats = resume.techStack.map((c) => c.category);
    expect(cats).toContain('Cloud');
    const cloud = resume.techStack.find((c) => c.category === 'Cloud')!;
    expect(cloud.items).toContain('AWS');
  });

  it('has 2-4 case studies each with outcome text', () => {
    expect(resume.caseStudies.length).toBeGreaterThanOrEqual(2);
    expect(resume.caseStudies.length).toBeLessThanOrEqual(4);
    for (const cs of resume.caseStudies) {
      expect(cs.problem.length).toBeGreaterThan(0);
      expect(cs.outcome.length).toBeGreaterThan(0);
    }
  });

  it('has four real certifications with links', () => {
    expect(resume.certifications).toHaveLength(4);
    for (const c of resume.certifications) {
      expect(c.url).toMatch(/^https?:\/\//);
    }
  });

  it('never contains invented placeholder numbers outside TODO markers', () => {
    // Guard: any bracketed placeholder inside TEXT CONTENT must be an explicit TODO.
    // Scan only string leaf values so structural JSON array brackets are excluded.
    const strings: string[] = [];
    JSON.stringify(resume, (_k, v) => {
      if (typeof v === 'string') strings.push(v);
      return v;
    });
    const brackets = strings.join('\n').match(/\[[^\]]*\]/g) ?? [];
    for (const b of brackets) expect(b).toMatch(/^\[TODO/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/content.test.ts`
Expected: FAIL — cannot resolve `../src/content/resume`.

- [ ] **Step 3: Create `src/content/types.ts`**

```ts
export interface Profile {
  name: string;
  roles: string[];          // ["DevOps","Platform","SRE","Cloud"]
  tagline: string;
  experienceLine: string;
  location: string;
  email: string;
  phone: string;
  resumeUrl: string;
  linkedin: string;
  github: string;
}

export interface TechCategory { category: string; items: string[]; }

export interface ExperienceEntry {
  role: string;
  company: string;
  period: string;
  bullets: string[];
}

export interface CaseStudy {
  title: string;
  problem: string;
  architecture: string;
  built: string;
  outcome: string;
}

export interface Metric { label: string; value: string; }

export interface Certification { name: string; url: string; }

export interface EducationEntry { degree: string; school: string; period: string; }

export interface Resume {
  profile: Profile;
  about: string;
  techStack: TechCategory[];
  experience: ExperienceEntry[];
  caseStudies: CaseStudy[];
  metrics: Metric[];
  certifications: Certification[];
  education: EducationEntry[];
}
```

- [ ] **Step 4: Create `src/content/resume.ts`** (real content from existing site, senior-reframed)

```ts
import type { Resume } from './types';

export const resume: Resume = {
  profile: {
    name: 'Naren Anandan',
    roles: ['DevOps', 'Platform', 'SRE', 'Cloud'],
    tagline:
      'Senior infrastructure engineer building reliable, cost-efficient cloud platforms — automation, IaC, and observability end to end.',
    experienceLine: '5+ years in tech operations · 4+ in DevOps/Platform engineering',
    location: 'Ottawa, Ontario, Canada',
    email: 'narenanand23@gmail.com',
    phone: '+1 (902) 412-5226',
    resumeUrl:
      'https://drive.google.com/file/d/1kK_pl3gcSpJv9e3aLUcfzvSnNXxj-Qlx/view?usp=sharing',
    linkedin: 'https://www.linkedin.com/in/narenanandan/',
    github: 'https://github.com/NarenAnandan',
  },
  about:
    'I design and operate cloud infrastructure that stays reliable under load and lean on cost. My focus is automation and platform engineering: codifying infrastructure, building CI/CD that teams trust, and instrumenting systems so problems surface before users feel them. Four-plus years across DevOps, platform, and network operations have made me a fast, pragmatic engineer who ships and owns outcomes.',
  techStack: [
    { category: 'Cloud', items: ['AWS', 'GCP', 'Azure'] },
    { category: 'IaC', items: ['Terraform'] },
    { category: 'Containers', items: ['Docker', 'Kubernetes'] },
    { category: 'CI/CD', items: ['GitHub Actions'] },
    { category: 'Observability', items: ['AWS CloudWatch', 'New Relic'] },
    { category: 'SCM', items: ['Git', 'GitHub'] },
    { category: 'Scripting', items: ['Python', 'Bash'] },
  ],
  experience: [
    {
      role: 'DevOps Platform Engineer',
      company: 'Shopliftr',
      period: 'Mar 2023 – Present',
      bullets: [
        'Design, run, and optimize the company AWS cloud platform for high availability, scalability, and cost-efficiency.',
        'Led the migration from Bitbucket to GitHub as the SCM platform, cutting operational cost ~30% and improving pipeline performance.',
        'Built monitoring and logging with AWS CloudWatch and New Relic for real-time visibility, proactively resolving performance bottlenecks.',
      ],
    },
    {
      role: 'DevOps Specialist',
      company: 'Pythian Inc.',
      period: 'May 2022 – Feb 2023',
      bullets: [
        'Delivered CI/CD pipelines and build/release management within a DevOps culture.',
        'Strong Linux/Unix administration and cloud implementation across Agile teams.',
        'Designed, developed, tested, and supported solutions across a full stack of DevOps tooling.',
      ],
    },
    {
      role: 'NOC Engineer',
      company: 'Eastlink',
      period: 'Oct 2021 – Apr 2022',
      bullets: [
        'Maintained a 95%+ first-response SLA across monitoring and managed-services customers.',
        'Resolved 85% of issues internally; consistently top-10% on ticket, alarm, and outage resolution.',
      ],
    },
    {
      role: 'Graduate Teaching Assistant',
      company: 'Dalhousie University',
      period: 'Jan 2019 – Apr 2021',
      bullets: [
        'Redesigned assignments and grading for 249 students through the in-person-to-online transition.',
        'Ran weekly office hours on circuit and hardware/software design; course pass rate 100%.',
      ],
    },
  ],
  caseStudies: [
    {
      title: 'AWS platform buildout & cost optimization',
      problem:
        'The AWS environment needed to scale reliably while holding down cost.',
      architecture:
        'Consolidated the AWS footprint around high-availability, scalable services with cost controls.',
      built:
        'Designed, implemented, and optimized the platform end to end, standardizing infrastructure and resource utilization.',
      outcome:
        'Improved availability and resource efficiency. [TODO: confirm scale and % savings figures]',
    },
    {
      title: 'SCM migration: Bitbucket → GitHub',
      problem:
        'Bitbucket tooling was costly and slowed delivery workflows.',
      architecture:
        'Standardized on GitHub as SCM with GitHub Actions pipelines.',
      built:
        'Planned and led the migration and CI/CD cutover with minimal disruption.',
      outcome:
        '~30% reduction in operational cost and improved pipeline performance. [TODO: confirm team size / pipeline count]',
    },
    {
      title: 'Observability rollout (CloudWatch + New Relic)',
      problem:
        'Limited real-time visibility made performance issues reactive.',
      architecture:
        'Layered AWS CloudWatch metrics/logs with New Relic APM for full-stack visibility.',
      built:
        'Instrumented services, dashboards, and alerting for proactive detection.',
      outcome:
        'Faster detection and resolution of bottlenecks. [TODO: confirm MTTR / uptime metrics]',
    },
  ],
  metrics: [
    { label: 'Operational cost reduced', value: '30%' },
    { label: 'First-response SLA', value: '95%+' },
    { label: 'Issues resolved internally', value: '85%' },
  ],
  certifications: [
    {
      name: 'Google Associate Cloud Engineer',
      url: 'https://www.credential.net/62c5c135-c902-4a7b-b67d-2bbe33f1087f',
    },
    {
      name: 'Microsoft Azure Developer',
      url: 'https://www.credly.com/badges/1e8ae7ff-a354-485c-bfab-519ca6cac9ef/public_url',
    },
    {
      name: 'HashiCorp Terraform Associate',
      url: 'https://www.credly.com/badges/e98d85c7-7686-47a9-8572-f157384cbec3',
    },
    {
      name: 'Google Professional Cloud DevOps Engineer',
      url: 'https://www.credential.net/aa4c32b8-f2f7-4843-8d1a-b6fab153992d',
    },
  ],
  education: [
    {
      degree: 'M.Eng, Electrical & Computer Engineering',
      school: 'Dalhousie University, Canada',
      period: '2018 – 2021',
    },
    {
      degree: 'B.E, Electronics & Electrical Engineering',
      school: 'Anna University, India',
      period: '2014 – 2018',
    },
  ],
};
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/content.test.ts`
Expected: PASS (all cases).

- [ ] **Step 6: Commit**

```bash
git add src/content/types.ts src/content/resume.ts tests/content.test.ts
git commit -m "feat: add typed resume content layer"
```

---

## Task 3: Render content data into semantic DOM sections

**Files:**
- Create: `src/content/render.ts`
- Test: `tests/render.test.ts`

**Interfaces:**
- Consumes: `resume: Resume` from Task 2.
- Produces: `export function renderContent(root: HTMLElement, data: Resume): void`. Each section is a `<section data-section="hero|about|experience|casestudies|metrics|education|contact">` with a heading. Metric values render in `<span class="metric-value" data-count-to="30" data-suffix="%">`.

- [ ] **Step 1: Write the failing test (`tests/render.test.ts`)**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { renderContent } from '../src/content/render';
import { resume } from '../src/content/resume';

describe('renderContent', () => {
  let root: HTMLElement;
  beforeEach(() => {
    root = document.createElement('main');
    renderContent(root, resume);
  });

  it('renders all seven sections', () => {
    for (const s of ['hero', 'about', 'experience', 'casestudies', 'metrics', 'education', 'contact']) {
      expect(root.querySelector(`[data-section="${s}"]`)).not.toBeNull();
    }
  });

  it('renders the name as an h1', () => {
    expect(root.querySelector('h1')?.textContent).toContain('Naren Anandan');
  });

  it('renders one experience card per entry', () => {
    const cards = root.querySelectorAll('[data-section="experience"] .exp-card');
    expect(cards.length).toBe(resume.experience.length);
  });

  it('renders certification links with href', () => {
    const links = root.querySelectorAll('[data-section="metrics"] a.cert');
    expect(links.length).toBe(resume.certifications.length);
    expect((links[0] as HTMLAnchorElement).href).toMatch(/^https?:/);
  });

  it('marks metric values for counter animation', () => {
    const m = root.querySelector('[data-section="metrics"] .metric-value');
    expect(m?.getAttribute('data-count-to')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/render.test.ts`
Expected: FAIL — cannot resolve `render.ts`.

- [ ] **Step 3: Implement `src/content/render.ts`**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/render.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire into `src/main.ts` and verify in browser**

```ts
import { renderContent } from './content/render';
import { resume } from './content/resume';
import './styles/main.css';

const content = document.getElementById('content') as HTMLElement;
renderContent(content, resume);
```

Note: `src/styles/main.css` is created in Task 4; create an empty file now so the import resolves: `touch src/styles/main.css`.

Run: `npm run dev` → open the served URL.
Expected: all sections render as plain text (unstyled), no console errors.

- [ ] **Step 6: Commit**

```bash
git add src/content/render.ts tests/render.test.ts src/main.ts src/styles/main.css
git commit -m "feat: render resume content into semantic DOM"
```

---

## Task 4: Visual design system (CSS)

**Files:**
- Modify: `src/styles/main.css`
- Modify: `index.html` (add font links + `<html data-theme>` base)

**Interfaces:**
- Produces: the "control-room" visual system. Canvas is `position: fixed` behind content; content sections are translucent glass panels; each `.section` is full-viewport min-height for scroll docking. **Fonts are self-hosted via `@fontsource` (no third-party requests) so a strict CSP needs no external `font-src`/`style-src` allowances.**

- [ ] **Step 1: Self-host fonts (no Google Fonts CDN)**

Do NOT add any `fonts.googleapis.com` / `fonts.gstatic.com` link to `index.html`. Instead import the needed weights from the `@fontsource` packages (installed in Task 1) at the very top of `src/styles/main.css`. Vite bundles the woff2 files as first-party assets.

```css
@import '@fontsource/space-grotesk/400.css';
@import '@fontsource/space-grotesk/500.css';
@import '@fontsource/space-grotesk/700.css';
@import '@fontsource/ibm-plex-mono/400.css';
@import '@fontsource/ibm-plex-mono/500.css';
```

- [ ] **Step 2: Write the rest of `src/styles/main.css`** (below the `@import` lines above)

```css
:root {
  --bg: #070b14;
  --bg-2: #0c1322;
  --glass: rgba(14, 22, 38, 0.62);
  --border: rgba(90, 200, 245, 0.18);
  --cyan: #34d5eb;
  --cyan-dim: #1b9fb5;
  --amber: #ffb454;
  --text: #e6edf6;
  --muted: #94a6bd;
  --sans: 'Space Grotesk', system-ui, sans-serif;
  --mono: 'IBM Plex Mono', ui-monospace, monospace;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body { background: var(--bg); color: var(--text); font-family: var(--sans); }
body { line-height: 1.6; -webkit-font-smoothing: antialiased; }

#scene {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  display: block;
}

#content { position: relative; z-index: 1; }

.section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 920px;
  margin: 0 auto;
  padding: 12vh 6vw;
}

.eyebrow { color: var(--cyan); font-family: var(--mono); letter-spacing: 0.2em; text-transform: uppercase; font-size: 0.8rem; }
.hero-name { font-size: clamp(2.6rem, 8vw, 5.5rem); font-weight: 700; line-height: 1.02; margin: 0.2em 0; }
.hero-roles { font-family: var(--mono); color: var(--amber); font-size: clamp(1rem, 2.5vw, 1.4rem); }
.hero-tagline { color: var(--text); font-size: 1.15rem; max-width: 46ch; margin-top: 1rem; }
.hero-exp { color: var(--muted); font-family: var(--mono); font-size: 0.9rem; margin-top: 0.6rem; }

.cta { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1.8rem; }
.btn { padding: 0.75rem 1.4rem; border-radius: 8px; font-weight: 500; text-decoration: none; transition: transform 0.15s ease, box-shadow 0.15s ease; }
.btn-primary { background: var(--cyan); color: #04222b; box-shadow: 0 0 24px rgba(52, 213, 235, 0.35); }
.btn-ghost { border: 1px solid var(--border); color: var(--text); }
.btn:hover { transform: translateY(-2px); }

.social { display: flex; gap: 1.2rem; margin-top: 1.4rem; }
.social a { color: var(--muted); text-decoration: none; font-family: var(--mono); font-size: 0.9rem; }
.social a:hover { color: var(--cyan); }

.section-title { font-size: clamp(1.8rem, 5vw, 3rem); margin-bottom: 1.2rem; position: relative; }
.section-title::after { content: ''; display: block; width: 64px; height: 3px; background: var(--cyan); margin-top: 0.5rem; box-shadow: 0 0 12px var(--cyan); }

.about-body { color: var(--muted); font-size: 1.1rem; max-width: 60ch; }

.tech-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 2rem; }
.tech-cat { background: var(--glass); border: 1px solid var(--border); border-radius: 12px; padding: 1rem; backdrop-filter: blur(8px); }
.tech-cat-title { font-family: var(--mono); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--cyan); margin-bottom: 0.6rem; }
.tech-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.tag { font-family: var(--mono); font-size: 0.85rem; padding: 0.25rem 0.6rem; border: 1px solid var(--border); border-radius: 6px; color: var(--text); }

.exp-card, .case-card, .edu-card {
  background: var(--glass); border: 1px solid var(--border); border-radius: 12px;
  padding: 1.4rem; margin-bottom: 1rem; backdrop-filter: blur(8px);
}
.exp-role, .case-title, .edu-degree { font-size: 1.25rem; color: var(--text); }
.exp-company, .edu-school { font-family: var(--mono); color: var(--cyan-dim); font-size: 0.85rem; margin: 0.3rem 0 0.7rem; }
.exp-bullets { list-style: none; }
.exp-bullets li { position: relative; padding-left: 1.2rem; margin-bottom: 0.5rem; color: var(--muted); }
.exp-bullets li::before { content: '▸'; position: absolute; left: 0; color: var(--cyan); }
.case-line { color: var(--muted); margin-bottom: 0.5rem; }
.case-line strong { color: var(--text); font-family: var(--mono); font-size: 0.85rem; }
.case-outcome strong { color: var(--amber); }

.metric-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
.metric { background: var(--glass); border: 1px solid var(--border); border-radius: 12px; padding: 1.4rem; text-align: center; }
.metric-value { font-family: var(--mono); font-size: 2.6rem; color: var(--cyan); text-shadow: 0 0 18px rgba(52, 213, 235, 0.5); }
.metric-label { color: var(--muted); font-size: 0.9rem; margin-top: 0.4rem; }
.cert-row { display: flex; flex-wrap: wrap; gap: 0.8rem; }
.cert { font-family: var(--mono); font-size: 0.9rem; padding: 0.6rem 1rem; border: 1px solid var(--border); border-radius: 8px; color: var(--text); text-decoration: none; }
.cert:hover { border-color: var(--cyan); color: var(--cyan); }

.contact-line { font-size: 1.1rem; margin-bottom: 0.5rem; }
.copyright { color: var(--muted); font-size: 0.8rem; margin-top: 2rem; font-family: var(--mono); }

/* Reveal animation base (JS adds .in-view) */
.section > * { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
.section.in-view > * { opacity: 1; transform: none; }

@media (prefers-reduced-motion: reduce) {
  .section > * { opacity: 1 !important; transform: none !important; transition: none !important; }
}

/* WebGL-off fallback: solid gradient backdrop instead of canvas */
body.no-webgl { background: radial-gradient(1200px 800px at 70% 0%, var(--bg-2), var(--bg)); }
body.no-webgl #scene { display: none; }
```

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`
Expected: styled dark control-room layout; sections full-height; glass cards; content hidden until `.in-view` (added later — temporarily add `in-view` class in devtools to confirm reveal works, or accept invisible until Task 12/13).

Note: because reveal depends on JS (Task 13), temporarily append `document.querySelectorAll('.section').forEach(s=>s.classList.add('in-view'))` at the end of `main.ts` to eyeball styling; remove before committing Task 13.

- [ ] **Step 4: Commit**

```bash
git add src/styles/main.css index.html
git commit -m "feat: add control-room visual design system"
```

---

## Task 5: WebGL capability detection + device tier (pure logic, tested)

**Files:**
- Create: `src/world/capability.ts`
- Test: `tests/capability.test.ts`

**Interfaces:**
- Produces:
  - `export function detectWebGL(canvas?: HTMLCanvasElement): boolean`
  - `export type DeviceTier = 'high' | 'mid' | 'low';`
  - `export function deviceTier(width: number, hardwareConcurrency: number, reducedMotion: boolean): DeviceTier`
  - `export function pixelRatioCap(tier: DeviceTier): number`

- [ ] **Step 1: Write the failing test (`tests/capability.test.ts`)**

```ts
import { describe, it, expect } from 'vitest';
import { deviceTier, pixelRatioCap } from '../src/world/capability';

describe('deviceTier', () => {
  it('is low when reduced motion is requested', () => {
    expect(deviceTier(1920, 16, true)).toBe('low');
  });
  it('is low on narrow screens', () => {
    expect(deviceTier(600, 8, false)).toBe('low');
  });
  it('is mid on mid screens / modest cores', () => {
    expect(deviceTier(1100, 4, false)).toBe('mid');
  });
  it('is high on wide screens with many cores', () => {
    expect(deviceTier(1920, 12, false)).toBe('high');
  });
});

describe('pixelRatioCap', () => {
  it('caps low tier hardest', () => {
    expect(pixelRatioCap('low')).toBeLessThanOrEqual(pixelRatioCap('mid'));
    expect(pixelRatioCap('mid')).toBeLessThanOrEqual(pixelRatioCap('high'));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/capability.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/world/capability.ts`**

```ts
export type DeviceTier = 'high' | 'mid' | 'low';

export function detectWebGL(canvas?: HTMLCanvasElement): boolean {
  try {
    const c = canvas ?? document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    return !!gl;
  } catch {
    return false;
  }
}

export function deviceTier(
  width: number,
  hardwareConcurrency: number,
  reducedMotion: boolean,
): DeviceTier {
  if (reducedMotion) return 'low';
  if (width < 768) return 'low';
  if (width < 1280 || hardwareConcurrency < 8) return 'mid';
  return 'high';
}

export function pixelRatioCap(tier: DeviceTier): number {
  switch (tier) {
    case 'low': return 1;
    case 'mid': return 1.5;
    case 'high': return 2;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/capability.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/world/capability.ts tests/capability.test.ts
git commit -m "feat: add WebGL detection and device-tier logic"
```

---

## Task 6: Camera path spline + progress→pose math (tested)

**Files:**
- Create: `src/scroll/path.ts`
- Test: `tests/path.test.ts`

**Interfaces:**
- Produces:
  - `export interface Pose { position: THREE.Vector3; lookAt: THREE.Vector3; }`
  - `export const SECTION_KEYS: readonly string[]` — `['hero','about','experience','casestudies','metrics','education','contact']`
  - `export function cameraPath(): THREE.CatmullRomCurve3` — 7 control points, one per section landmark.
  - `export function poseAt(progress: number): Pose` — clamps progress to [0,1]; returns camera position on the curve and a lookAt slightly ahead.
  - `export function activeSectionIndex(progress: number, count: number): number`

- [ ] **Step 1: Write the failing test (`tests/path.test.ts`)**

```ts
import { describe, it, expect } from 'vitest';
import { poseAt, activeSectionIndex, cameraPath, SECTION_KEYS } from '../src/scroll/path';

describe('camera path', () => {
  it('has one control point per section', () => {
    expect(cameraPath().points.length).toBe(SECTION_KEYS.length);
  });

  it('clamps progress below 0 and above 1', () => {
    const a = poseAt(-0.5).position;
    const b = poseAt(0).position;
    const c = poseAt(2).position;
    const d = poseAt(1).position;
    expect(a.equals(b)).toBe(true);
    expect(c.equals(d)).toBe(true);
  });

  it('moves the camera as progress increases', () => {
    const p0 = poseAt(0).position;
    const p1 = poseAt(1).position;
    expect(p0.distanceTo(p1)).toBeGreaterThan(1);
  });

  it('maps progress to section index', () => {
    expect(activeSectionIndex(0, 7)).toBe(0);
    expect(activeSectionIndex(0.99, 7)).toBe(6);
    expect(activeSectionIndex(0.5, 7)).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/path.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/scroll/path.ts`**

```ts
import * as THREE from 'three';

export interface Pose {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
}

export const SECTION_KEYS = [
  'hero', 'about', 'experience', 'casestudies', 'metrics', 'education', 'contact',
] as const;

// One control point per landmark; the camera flies down and through the city.
const CONTROL_POINTS: [number, number, number][] = [
  [0, 34, 60],     // hero — orbiting above the skyline
  [-18, 20, 30],   // about — dock at VPC district
  [10, 12, 8],     // experience — pipeline corridor
  [-6, 8, -20],    // casestudies — kubernetes cluster
  [14, 16, -44],   // metrics — observability tower
  [0, 6, -66],     // education — descending to ground
  [0, 4, -84],     // contact — HQ / ground level
];

let cachedCurve: THREE.CatmullRomCurve3 | null = null;

export function cameraPath(): THREE.CatmullRomCurve3 {
  if (!cachedCurve) {
    cachedCurve = new THREE.CatmullRomCurve3(
      CONTROL_POINTS.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
      false,
      'catmullrom',
      0.5,
    );
  }
  return cachedCurve;
}

function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t));
}

export function poseAt(progress: number): Pose {
  const t = clamp01(progress);
  const curve = cameraPath();
  const position = curve.getPointAt(t);
  const aheadT = clamp01(t + 0.04);
  const lookAt = curve.getPointAt(aheadT);
  // Bias lookAt toward the world center so landmarks stay framed.
  lookAt.lerp(new THREE.Vector3(0, 4, position.z - 20), 0.4);
  return { position, lookAt };
}

export function activeSectionIndex(progress: number, count: number): number {
  const t = clamp01(progress);
  return Math.min(count - 1, Math.floor(t * count));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/path.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/scroll/path.ts tests/path.test.ts
git commit -m "feat: add camera spline path and progress-to-pose math"
```

---

## Task 7: Renderer bootstrap + shared materials

**Files:**
- Create: `src/world/renderer.ts`, `src/world/materials.ts`

**Interfaces:**
- Consumes: `capability.ts` (tier, pixelRatioCap).
- Produces:
  - `materials.ts`: `export const PALETTE`, `export function glowMaterial(color: number)`, `export function surfaceMaterial(color: number)`.
  - `renderer.ts`: `export interface World { scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer; render(): void; onResize(): void; add(obj: THREE.Object3D): void; }` and `export function createWorld(canvas: HTMLCanvasElement, tier: DeviceTier): World`.

- [ ] **Step 1: Implement `src/world/materials.ts`**

```ts
import * as THREE from 'three';

export const PALETTE = {
  bg: 0x070b14,
  cyan: 0x34d5eb,
  amber: 0xffb454,
  surface: 0x16233b,
  surfaceLight: 0x223452,
};

export function glowMaterial(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 1.4,
    roughness: 0.3,
    metalness: 0.1,
  });
}

export function surfaceMaterial(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.7,
    metalness: 0.35,
    flatShading: true,
  });
}
```

- [ ] **Step 2: Implement `src/world/renderer.ts`**

```ts
import * as THREE from 'three';
import type { DeviceTier } from './capability';
import { pixelRatioCap } from './capability';
import { PALETTE } from './materials';

export interface World {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  render(): void;
  onResize(): void;
  add(obj: THREE.Object3D): void;
}

export function createWorld(canvas: HTMLCanvasElement, tier: DeviceTier): World {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.bg);
  scene.fog = new THREE.FogExp2(PALETTE.bg, 0.011);

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.set(0, 34, 60);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: tier !== 'low', powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap(tier)));

  // Lighting: cool ambient + warm key so metals read.
  scene.add(new THREE.AmbientLight(0x3a4a66, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(30, 50, 20);
  scene.add(key);
  const rim = new THREE.PointLight(PALETTE.cyan, 2.4, 160);
  rim.position.set(-20, 24, -10);
  scene.add(rim);

  function render(): void {
    renderer.render(scene, camera);
  }
  function onResize(): void {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  function add(obj: THREE.Object3D): void {
    scene.add(obj);
  }

  return { scene, camera, renderer, render, onResize, add };
}
```

- [ ] **Step 3: Smoke-wire in `src/main.ts`** (temporary, replaced in Task 12)

```ts
import { renderContent } from './content/render';
import { resume } from './content/resume';
import { detectWebGL, deviceTier } from './world/capability';
import { createWorld } from './world/renderer';
import './styles/main.css';

const content = document.getElementById('content') as HTMLElement;
renderContent(content, resume);

const canvas = document.getElementById('scene') as HTMLCanvasElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (detectWebGL(canvas)) {
  const tier = deviceTier(window.innerWidth, navigator.hardwareConcurrency ?? 4, reduced);
  const world = createWorld(canvas, tier);
  window.addEventListener('resize', world.onResize);
  const loop = () => { world.render(); requestAnimationFrame(loop); };
  loop();
} else {
  document.body.classList.add('no-webgl');
}
```

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`
Expected: dark scene renders (empty city, fog); no console errors; content scrolls over it. Resize does not distort.

- [ ] **Step 5: Commit**

```bash
git add src/world/materials.ts src/world/renderer.ts src/main.ts
git commit -m "feat: add Three.js renderer bootstrap and shared materials"
```

---

## Task 8: City skyline + VPC district geometry

**Files:**
- Create: `src/world/city.ts`

**Interfaces:**
- Consumes: `materials.ts`.
- Produces: `export function buildCity(): THREE.Group` — instanced low-poly buildings forming a skyline near the hero/about landmarks (world z from ~+40 to ~+10), plus a bordered "VPC district" platform with glowing edges.

- [ ] **Step 1: Implement `src/world/city.ts`**

```ts
import * as THREE from 'three';
import { PALETTE, surfaceMaterial, glowMaterial } from './materials';

export function buildCity(): THREE.Group {
  const group = new THREE.Group();

  // --- Instanced buildings (skyline) ---
  const COUNT = 120;
  const box = new THREE.BoxGeometry(1, 1, 1);
  const mat = surfaceMaterial(PALETTE.surface);
  const buildings = new THREE.InstancedMesh(box, mat, COUNT);
  const dummy = new THREE.Object3D();

  // Deterministic pseudo-random layout (no Math.random in build).
  const rand = mulberry32(1337);
  for (let i = 0; i < COUNT; i++) {
    const x = (rand() - 0.5) * 90;
    const z = 40 - rand() * 60;
    const h = 2 + rand() * 22;
    dummy.position.set(x, h / 2, z);
    dummy.scale.set(2 + rand() * 3, h, 2 + rand() * 3);
    dummy.rotation.y = rand() * Math.PI;
    dummy.updateMatrix();
    buildings.setMatrixAt(i, dummy.matrix);
  }
  buildings.instanceMatrix.needsUpdate = true;
  group.add(buildings);

  // --- Windows glow: a few emissive accent strips on tall buildings ---
  const accentGeo = new THREE.BoxGeometry(0.4, 6, 0.4);
  const accentMat = glowMaterial(PALETTE.cyan);
  const accents = new THREE.InstancedMesh(accentGeo, accentMat, 24);
  for (let i = 0; i < 24; i++) {
    dummy.position.set((rand() - 0.5) * 70, 6 + rand() * 10, 30 - rand() * 50);
    dummy.scale.set(1, 1 + rand() * 2, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    accents.setMatrixAt(i, dummy.matrix);
  }
  accents.instanceMatrix.needsUpdate = true;
  group.add(accents);

  // --- VPC district platform with glowing border ---
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(30, 0.6, 22),
    surfaceMaterial(PALETTE.surfaceLight),
  );
  platform.position.set(-18, 0, 28);
  group.add(platform);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(30, 0.6, 22)),
    new THREE.LineBasicMaterial({ color: PALETTE.cyan }),
  );
  edges.position.copy(platform.position);
  group.add(edges);

  return group;
}

// Small deterministic PRNG so builds are reproducible without Math.random.
function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

- [ ] **Step 2: Add to scene in `main.ts`** (inside the `detectWebGL` block, after `createWorld`)

```ts
import { buildCity } from './world/city';
// ...
world.add(buildCity());
```

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`
Expected: a low-poly skyline with cyan accent strips and a bordered VPC platform is visible from the starting camera.

- [ ] **Step 4: Commit**

```bash
git add src/world/city.ts src/main.ts
git commit -m "feat: add skyline and VPC district geometry"
```

---

## Task 9: CI/CD pipeline corridor

**Files:**
- Create: `src/world/pipeline.ts`

**Interfaces:**
- Produces: `export function buildPipeline(): { group: THREE.Group; update(t: number): void }` — a corridor of stage "gates" around z ≈ +8, with glowing packets that flow along it; `update(elapsed)` animates packet flow.

- [ ] **Step 1: Implement `src/world/pipeline.ts`**

```ts
import * as THREE from 'three';
import { PALETTE, surfaceMaterial, glowMaterial } from './materials';

export function buildPipeline(): { group: THREE.Group; update(t: number): void } {
  const group = new THREE.Group();
  group.position.set(8, 0, 8);

  // Stage gates along -z.
  const gateMat = surfaceMaterial(PALETTE.surfaceLight);
  const gateCount = 5;
  for (let i = 0; i < gateCount; i++) {
    const gate = new THREE.Mesh(new THREE.TorusGeometry(3, 0.35, 8, 24), gateMat);
    gate.rotation.y = Math.PI / 2;
    gate.position.set(0, 3, i * -8);
    group.add(gate);
  }

  // Flowing packets (emissive cubes) that loop through the gates.
  const PACKETS = 8;
  const packetGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
  const packetMat = glowMaterial(PALETTE.amber);
  const packets = new THREE.InstancedMesh(packetGeo, packetMat, PACKETS);
  group.add(packets);
  const dummy = new THREE.Object3D();
  const length = gateCount * 8;

  function update(t: number): void {
    for (let i = 0; i < PACKETS; i++) {
      const phase = (t * 6 + i * (length / PACKETS)) % length;
      dummy.position.set(0, 3, -phase);
      dummy.updateMatrix();
      packets.setMatrixAt(i, dummy.matrix);
    }
    packets.instanceMatrix.needsUpdate = true;
  }

  return { group, update };
}
```

- [ ] **Step 2: Wire into `main.ts`** (store updatable, call in loop)

```ts
import { buildPipeline } from './world/pipeline';
// after world.add(buildCity()):
const pipeline = buildPipeline();
world.add(pipeline.group);
// replace the loop with one that tracks elapsed time:
let start = performance.now();
const loop = () => {
  const elapsed = (performance.now() - start) / 1000;
  pipeline.update(elapsed);
  world.render();
  requestAnimationFrame(loop);
};
loop();
```

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`
Expected: torus "gates" with amber packets flowing through them (visible once camera reaches the corridor — for now scroll/zoom check via temporarily setting `camera.position.set(10,12,8)` if needed, then revert).

- [ ] **Step 4: Commit**

```bash
git add src/world/pipeline.ts src/main.ts
git commit -m "feat: add CI/CD pipeline corridor with flowing packets"
```

---

## Task 10: Kubernetes cluster + observability tower + ground/HQ

**Files:**
- Create: `src/world/cluster.ts`, `src/world/tower.ts`

**Interfaces:**
- Produces:
  - `export function buildCluster(): THREE.Group` — a grid of "pods" (stacked container cubes) around z ≈ -20.
  - `export function buildTower(): { group: THREE.Group; update(t: number): void }` — an observability tower with pulsing rings around z ≈ -44, plus a ground plane/HQ marker near z ≈ -84.

- [ ] **Step 1: Implement `src/world/cluster.ts`**

```ts
import * as THREE from 'three';
import { PALETTE, surfaceMaterial, glowMaterial } from './materials';

export function buildCluster(): THREE.Group {
  const group = new THREE.Group();
  group.position.set(-6, 0, -20);

  const cols = 5, rows = 4;
  const node = new THREE.BoxGeometry(2.4, 2.4, 2.4);
  const nodeMat = surfaceMaterial(PALETTE.surface);
  const podMat = glowMaterial(PALETTE.cyan);
  const pod = new THREE.BoxGeometry(0.7, 0.7, 0.7);

  for (let x = 0; x < cols; x++) {
    for (let z = 0; z < rows; z++) {
      const n = new THREE.Mesh(node, nodeMat);
      n.position.set((x - cols / 2) * 4, 1.2, (z - rows / 2) * 4);
      group.add(n);
      // three stacked pods on top of each node
      for (let k = 0; k < 3; k++) {
        const p = new THREE.Mesh(pod, podMat);
        p.position.set(n.position.x, 2.6 + k * 0.9, n.position.z);
        group.add(p);
      }
    }
  }
  return group;
}
```

- [ ] **Step 2: Implement `src/world/tower.ts`**

```ts
import * as THREE from 'three';
import { PALETTE, surfaceMaterial, glowMaterial } from './materials';

export function buildTower(): { group: THREE.Group; update(t: number): void } {
  const group = new THREE.Group();
  group.position.set(14, 0, -44);

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 2, 26, 12),
    surfaceMaterial(PALETTE.surfaceLight),
  );
  shaft.position.y = 13;
  group.add(shaft);

  const rings: THREE.Mesh[] = [];
  const ringMat = glowMaterial(PALETTE.cyan);
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3 + i, 0.12, 8, 32), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 6 + i * 5;
    group.add(ring);
    rings.push(ring);
  }

  // Ground plane + HQ marker far down the path.
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    surfaceMaterial(PALETTE.bg),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.5, -60);
  group.add(ground);

  const hq = new THREE.Mesh(new THREE.IcosahedronGeometry(3, 0), glowMaterial(PALETTE.amber));
  hq.position.set(-14, 4, -40); // world (-14+14=0? ) -> local so it lands near z=-84 world
  group.add(hq);

  function update(t: number): void {
    for (let i = 0; i < rings.length; i++) {
      const s = 1 + Math.sin(t * 2 + i) * 0.08;
      rings[i].scale.set(s, s, s);
    }
    hq.rotation.y = t * 0.6;
  }

  return { group, update };
}
```

- [ ] **Step 3: Wire into `main.ts`**

```ts
import { buildCluster } from './world/cluster';
import { buildTower } from './world/tower';
// after pipeline:
world.add(buildCluster());
const tower = buildTower();
world.add(tower.group);
// in the loop, also call:
tower.update(elapsed);
```

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`
Expected: no console errors; when camera is moved down the path (temporarily), cluster pods, pulsing tower rings, ground plane, and rotating HQ icosahedron are visible.

- [ ] **Step 5: Commit**

```bash
git add src/world/cluster.ts src/world/tower.ts src/main.ts
git commit -m "feat: add kubernetes cluster, observability tower, ground and HQ"
```

---

## Task 11: Bloom postprocessing

**Files:**
- Create: `src/world/postprocess.ts`
- Modify: `src/world/renderer.ts` (expose composer hook)

**Interfaces:**
- Produces: `export function createComposer(world: World, tier: DeviceTier): { render(): void; onResize(): void }` using `EffectComposer` + `UnrealBloomPass`. On `low` tier, bloom is skipped and it falls back to `world.render()`.

- [ ] **Step 1: Implement `src/world/postprocess.ts`**

```ts
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import type { World } from './renderer';
import type { DeviceTier } from './capability';

export function createComposer(world: World, tier: DeviceTier): { render(): void; onResize(): void } {
  if (tier === 'low') {
    return { render: () => world.render(), onResize: () => world.onResize() };
  }
  const composer = new EffectComposer(world.renderer);
  composer.addPass(new RenderPass(world.scene, world.camera));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.9,   // strength
    0.5,   // radius
    0.15,  // threshold
  );
  composer.addPass(bloom);

  return {
    render: () => composer.render(),
    onResize: () => {
      world.onResize();
      composer.setSize(window.innerWidth, window.innerHeight);
    },
  };
}
```

- [ ] **Step 2: Use composer in `main.ts`**

```ts
import { createComposer } from './world/postprocess';
// after all world.add(...):
const composer = createComposer(world, tier);
window.removeEventListener('resize', world.onResize);
window.addEventListener('resize', composer.onResize);
// in loop, replace world.render() with:
composer.render();
```

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`
Expected: emissive elements (accents, packets, pods, rings, HQ) now bloom/glow. No errors. On a throttled/low tier the scene still renders without bloom.

- [ ] **Step 4: Commit**

```bash
git add src/world/postprocess.ts src/main.ts
git commit -m "feat: add bloom postprocessing with low-tier fallback"
```

---

## Task 12: Scroll → camera timeline (Lenis + GSAP ScrollTrigger)

**Files:**
- Create: `src/scroll/timeline.ts`
- Modify: `src/main.ts` (assemble everything cleanly)

**Interfaces:**
- Consumes: `poseAt`, `activeSectionIndex`, `SECTION_KEYS` from `path.ts`; `World` from `renderer.ts`.
- Produces: `export function initScroll(world: World, onSectionChange: (index: number) => void): { progress: () => number; destroy(): void }` — sets up Lenis smooth scroll + a ScrollTrigger scrub bound to total page scroll; on each update, sets `world.camera.position`/`lookAt` from `poseAt(progress)` and fires `onSectionChange` when the active section index changes.

- [ ] **Step 1: Implement `src/scroll/timeline.ts`**

```ts
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { World } from '../world/renderer';
import { poseAt, activeSectionIndex, SECTION_KEYS } from './path';

gsap.registerPlugin(ScrollTrigger);

export function initScroll(
  world: World,
  onSectionChange: (index: number) => void,
): { progress: () => number; destroy(): void } {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let lastIndex = -1;

  const apply = (t: number) => {
    const pose = poseAt(t);
    world.camera.position.copy(pose.position);
    world.camera.lookAt(pose.lookAt);
    const idx = activeSectionIndex(t, SECTION_KEYS.length);
    if (idx !== lastIndex) {
      lastIndex = idx;
      onSectionChange(idx);
    }
  };

  if (reduced) {
    // No scrubbing: park camera at an overview pose; reveal handled by IntersectionObserver.
    apply(0);
    return { progress: () => 0, destroy: () => {} };
  }

  const lenis = new Lenis({ smoothWheel: true, lerp: 0.09 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  const st = ScrollTrigger.create({
    trigger: '#content',
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      current = self.progress;
      apply(current);
    },
  });

  apply(0);

  return {
    progress: () => current,
    destroy: () => {
      st.kill();
      lenis.destroy();
    },
  };
}
```

- [ ] **Step 2: Rewrite `src/main.ts` as the clean assembly**

```ts
import { renderContent } from './content/render';
import { resume } from './content/resume';
import { detectWebGL, deviceTier } from './world/capability';
import { createWorld } from './world/renderer';
import { createComposer } from './world/postprocess';
import { buildCity } from './world/city';
import { buildPipeline } from './world/pipeline';
import { buildCluster } from './world/cluster';
import { buildTower } from './world/tower';
import { initScroll } from './scroll/timeline';
import { initReveal } from './scroll/reveal';
import './styles/main.css';

const content = document.getElementById('content') as HTMLElement;
renderContent(content, resume);

const canvas = document.getElementById('scene') as HTMLCanvasElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!detectWebGL(canvas)) {
  document.body.classList.add('no-webgl');
  initReveal(); // sections still reveal via IntersectionObserver
} else {
  const tier = deviceTier(window.innerWidth, navigator.hardwareConcurrency ?? 4, reduced);
  const world = createWorld(canvas, tier);
  world.add(buildCity());
  const pipeline = buildPipeline();
  world.add(pipeline.group);
  world.add(buildCluster());
  const tower = buildTower();
  world.add(tower.group);

  const composer = createComposer(world, tier);
  window.addEventListener('resize', composer.onResize);

  initScroll(world, () => {});
  initReveal();

  const start = performance.now();
  const loop = () => {
    const elapsed = (performance.now() - start) / 1000;
    pipeline.update(elapsed);
    tower.update(elapsed);
    composer.render();
    requestAnimationFrame(loop);
  };
  loop();
}
```

Note: `initReveal` is created in Task 13; create a temporary no-op `export function initReveal(): void {}` in `src/scroll/reveal.ts` now so imports resolve.

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`
Expected: scrolling flies the camera smoothly along the path — skyline → VPC → pipeline → cluster → tower → ground/HQ. No jitter; resize works.

- [ ] **Step 4: Commit**

```bash
git add src/scroll/timeline.ts src/main.ts src/scroll/reveal.ts
git commit -m "feat: wire scroll to camera flythrough via Lenis + ScrollTrigger"
```

---

## Task 13: Section reveals + animated metric counters

**Files:**
- Modify: `src/scroll/reveal.ts`

**Interfaces:**
- Produces: `export function initReveal(): void` — uses `IntersectionObserver` to add `.in-view` to each `.section` as it enters; when the metrics section enters, animates each `.metric-value` from 0 to `data-count-to`, appending `data-suffix`. Respects `prefers-reduced-motion` (sets final values instantly, all sections `.in-view`).

- [ ] **Step 1: Implement `src/scroll/reveal.ts`**

```ts
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
```

- [ ] **Step 2: Verify in browser**

Run: `npm run dev`
Expected: sections fade/slide in as they enter view; metric numbers count up (30%, 95%+, 85%) once the Impact section appears. With OS reduced-motion enabled, everything is visible immediately with final numbers.

- [ ] **Step 3: Commit**

```bash
git add src/scroll/reveal.ts
git commit -m "feat: add section reveals and animated metric counters"
```

---

## Task 14: Responsive + reduced-motion + WebGL-off hardening

**Files:**
- Modify: `src/styles/main.css` (mobile rules)
- Modify: `src/main.ts` (pause loop when tab hidden)

**Interfaces:**
- No new exports. Ensures the three fallback paths are correct and mobile is readable.

- [ ] **Step 1: Add mobile CSS to `src/styles/main.css`**

```css
@media (max-width: 767px) {
  .section { padding: 10vh 7vw; min-height: auto; margin: 8vh auto; }
  .hero-name { font-size: clamp(2.2rem, 12vw, 3.2rem); }
  .tech-grid, .metric-row { grid-template-columns: 1fr 1fr; }
  /* Stronger panel backing so text stays legible over the 3D scene on small screens */
  .section { background: rgba(7, 11, 20, 0.55); border-radius: 16px; backdrop-filter: blur(4px); }
}
```

- [ ] **Step 2: Pause render loop when tab hidden (in `main.ts` loop)**

Replace the loop body's start with a visibility guard:

```ts
const loop = () => {
  requestAnimationFrame(loop);
  if (document.hidden) return;
  const elapsed = (performance.now() - start) / 1000;
  pipeline.update(elapsed);
  tower.update(elapsed);
  composer.render();
};
loop();
```

- [ ] **Step 3: Manual verification matrix**

Run: `npm run dev`, then check:
- Desktop wide: full flythrough, bloom on.
- Narrow window (<768px): content stacks, panels legible, camera path still works (mid/low tier).
- DevTools → Rendering → emulate `prefers-reduced-motion: reduce`: no scrubbing, all sections visible, counters show final values.
- DevTools → disable WebGL (or run in a context without it): `body.no-webgl`, canvas hidden, gradient backdrop, content fully readable.

Expected: all four pass; no console errors in any mode.

- [ ] **Step 4: Commit**

```bash
git add src/styles/main.css src/main.ts
git commit -m "feat: harden responsive, reduced-motion, and WebGL-off paths"
```

---

## Task 15: Playwright smoke test

**Files:**
- Create: `playwright.config.ts`, `tests/smoke.spec.ts`

**Interfaces:**
- Produces: an end-to-end smoke test run against the Vite preview server.

- [ ] **Step 1: Create `playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts/,
  use: { baseURL: 'http://localhost:4173' },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

- [ ] **Step 2: Create `tests/smoke.spec.ts`**

```ts
import { test, expect } from '@playwright/test';

test('all content sections render', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/');
  for (const s of ['hero', 'about', 'experience', 'casestudies', 'metrics', 'education', 'contact']) {
    await expect(page.locator(`[data-section="${s}"]`)).toBeAttached();
  }
  await expect(page.locator('h1')).toContainText('Naren Anandan');
  expect(errors, `console/page errors: ${errors.join(' | ')}`).toHaveLength(0);
});

test('WebGL canvas gets a context', async ({ page }) => {
  await page.goto('/');
  const hasContext = await page.evaluate(() => {
    const c = document.getElementById('scene') as HTMLCanvasElement | null;
    if (!c) return false;
    // Renderer already claimed the context; getContext returns the same one.
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  });
  expect(hasContext).toBeTruthy();
});
```

- [ ] **Step 3: Run the smoke test**

Run: `npx playwright install --with-deps chromium && npm run test:e2e`
Expected: both tests PASS.

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts tests/smoke.spec.ts
git commit -m "test: add Playwright smoke test for content and WebGL"
```

---

## Task 16: Firebase hosting — security headers, free-tier config, CI build & preview channels

**Files:**
- Modify: `firebase.json`
- Create: `public-static/404.html` (source for the custom 404; copied into `dist/` at build — see Step 2)
- Modify: `vite.config.ts` (copy `404.html` into the build output)
- Modify: `.github/workflows/firebase-hosting-merge.yml`
- Create: `.github/workflows/firebase-hosting-pull-request.yml` (free preview channels)
- Modify: `.gitignore`
- Delete: legacy Bootstrap assets and unused dirs

**Interfaces:**
- Produces: a hardened, free-tier Firebase Hosting config (immutable asset caching, `cleanUrls`, custom 404, security headers) plus CI that builds `dist/` and deploys on merge, with per-PR preview channels.

**Security & free-tier context (bind these exact values):**
- Because fonts are self-hosted (Task 4), the CSP needs **no third-party origins**. All external links are navigations (`target="_blank"`), not resource loads, so they are unaffected by CSP.
- Emissive/scroll libraries set inline **style attributes** (Lenis on `<html>`, GSAP transforms) → `style-src` needs `'unsafe-inline'`. No inline **scripts** exist (all JS is bundled) → `script-src 'self'` with no `'unsafe-inline'`.
- Vite emits content-hashed filenames under `/assets/…` → those are safe to cache `immutable` for 1 year. `index.html` must **not** be cached long (so deploys take effect immediately).

- [ ] **Step 1: Update `firebase.json`**

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "cleanUrls": true,
    "trailingSlash": false,
    "appAssociation": "NONE",
    "headers": [
      {
        "source": "**",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
          { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
          { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'; upgrade-insecure-requests" }
        ]
      },
      {
        "source": "/assets/**",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
        ]
      },
      {
        "source": "**/*.@(js|css|woff2|woff|png|jpg|jpeg|svg|webp)",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
        ]
      },
      {
        "source": "/index.html",
        "headers": [
          { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
        ]
      }
    ]
  }
}
```

- [ ] **Step 2: Custom 404 page + copy into build**

Create `public-static/404.html` (self-contained, no external requests, matches the dark theme):

```html
<!doctype html>
<html lang="en-US">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>404 — Naren Anandan</title>
    <style>
      html,body{margin:0;height:100%;background:#070b14;color:#e6edf6;font-family:system-ui,sans-serif;display:grid;place-items:center;text-align:center}
      h1{font-size:4rem;margin:0;color:#34d5eb}
      a{color:#ffb454}
    </style>
  </head>
  <body>
    <div>
      <h1>404</h1>
      <p>That page drifted off the grid.</p>
      <p><a href="/">Return to the city →</a></p>
    </div>
  </body>
</html>
```

Make Vite copy it to `dist/404.html` by using the `publicDir` copy behavior. Update `vite.config.ts`:

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: 'public-static',
  build: { outDir: 'dist', sourcemap: false, target: 'es2020' },
});
```

(Vite copies everything in `publicDir` verbatim into `dist/`, so `public-static/404.html` → `dist/404.html`.)

- [ ] **Step 3: Update `.github/workflows/firebase-hosting-merge.yml`**

Read the existing file first to preserve the `firebaseServiceAccount` secret name and `projectId`. Rewrite it to build before deploy:

```yaml
name: Deploy to Firebase Hosting on merge
on:
  push:
    branches: [main]
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      checks: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: <KEEP EXISTING projectId FROM OLD FILE>
```

Replace `<KEEP EXISTING ...>` and the exact `firebaseServiceAccount` secret name with the values read from the old file. Do NOT invent a project id.

- [ ] **Step 4: Add free PR preview-channel workflow `.github/workflows/firebase-hosting-pull-request.yml`**

```yaml
name: Deploy PR preview to Firebase Hosting
on: pull_request
permissions:
  checks: write
  contents: read
  pull-requests: write
jobs:
  build_and_preview:
    if: ${{ github.event.pull_request.head.repo.full_name == github.repository }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: <KEEP EXISTING projectId FROM OLD FILE>
```

(Preview channels are included in the free Spark plan; the action posts a temporary preview URL on each PR.)

- [ ] **Step 5: Ensure `.gitignore` covers build artifacts**

Confirm `.gitignore` contains `node_modules/`, `dist/`, and `.firebase/`. Add any that are missing.

- [ ] **Step 6: Remove legacy assets**

```bash
git rm -r css scripts images construction.html toggle-site.sh public
```

(The new site is fully procedural — no legacy image/script assets are referenced. `public/` held the old construction page and is superseded by `public-static/`.)

- [ ] **Step 7: Full verification**

Run: `npm run build && npm test && npm run test:e2e`
Expected: build succeeds; `dist/404.html` exists; all unit tests pass; smoke tests pass.

Additionally verify headers locally with the Firebase emulator if available:

Run: `npx firebase-tools@latest emulators:start --only hosting` then `curl -sI http://127.0.0.1:5000/ | grep -i -E 'content-security-policy|x-content-type|strict-transport'`
Expected: the security headers are present. (If the emulator is unavailable in the environment, note it and rely on config review — do not block on this.)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: harden Firebase hosting (CSP, HSTS, caching, previews) and remove legacy site"
```

---

## Task 17: Comprehensive documentation

**Files:**
- Modify: `README.md`
- Create: `docs/ARCHITECTURE.md`
- Create: `docs/CONTENT.md`
- Create: `docs/DEPLOYMENT.md`

**Interfaces:**
- Produces: complete developer + owner documentation. No code behavior changes.

- [ ] **Step 1: Rewrite `README.md`**

```markdown
# Naren Anandan — Portfolio

A scroll-driven **Three.js** portfolio: a cinematic camera flight through a stylized
"cloud infrastructure city" that doubles as a reference architecture. Positioned for
senior **DevOps · Platform · SRE · Cloud** roles.

Built with Vite + TypeScript + Three.js + GSAP (ScrollTrigger) + Lenis. Fully
static, self-hosted fonts, no third-party runtime requests, deployed on Firebase
Hosting.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Typecheck + production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | Smoke tests (Playwright) |

## Project layout

- `src/content/` — typed resume data (`resume.ts`) + DOM renderer. **Edit your
  résumé here.** See [docs/CONTENT.md](docs/CONTENT.md).
- `src/world/` — the procedural 3D scene (city, pipeline, cluster, tower).
- `src/scroll/` — camera path math + GSAP/Lenis scroll wiring + reveals.
- `src/styles/main.css` — the "control-room" design system.
- `docs/` — architecture, content, and deployment guides.

## Accessibility & resilience

- Works with WebGL disabled (content renders as a static dark layout).
- Honors `prefers-reduced-motion` (no camera scrubbing; instant reveals).
- Responsive down to small phones; all résumé text lives in the DOM (SEO/ATS
  readable), never inside the canvas.

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — how the three layers fit together.
- [Editing content](docs/CONTENT.md) — update your résumé, add case studies.
- [Deployment & security](docs/DEPLOYMENT.md) — Firebase hosting, headers, CI.
```

- [ ] **Step 2: Create `docs/ARCHITECTURE.md`**

```markdown
# Architecture

The site is three independent layers wired together in `src/main.ts`.

## 1. Content (`src/content/`)
- `types.ts` — the `Resume` interface and its sub-types.
- `resume.ts` — the single source of truth (all real résumé data).
- `render.ts` — `renderContent(root, resume)` builds semantic DOM sections.
  Text is rendered into the DOM (not the canvas) so it is copyable, indexable,
  and readable by ATS/recruiters.

## 2. World (`src/world/`)
- `capability.ts` — pure WebGL detection + device-tier logic (unit-tested).
- `renderer.ts` — `createWorld(canvas, tier)`: scene, camera, lights, resize.
- `materials.ts` — shared palette + emissive/surface materials.
- `city.ts`, `pipeline.ts`, `cluster.ts`, `tower.ts` — procedural landmarks.
- `postprocess.ts` — bloom (skipped on low tier).

## 3. Scroll (`src/scroll/`)
- `path.ts` — the camera `CatmullRomCurve3` and `poseAt(progress)` math
  (unit-tested).
- `timeline.ts` — Lenis smooth scroll + GSAP ScrollTrigger drive the camera
  along the path from scroll position.
- `reveal.ts` — IntersectionObserver section reveals + metric counters.

## Data flow
Scroll position → GSAP ScrollTrigger → `poseAt(progress)` → camera transform.
The render loop animates the pipeline packets and tower rings and renders via
the bloom composer.

## Progressive enhancement
`main.ts` checks `detectWebGL()`. If false, it adds `body.no-webgl` (canvas
hidden, gradient backdrop) and still runs `initReveal()`. `prefers-reduced-motion`
parks the camera and reveals content instantly.
```

- [ ] **Step 3: Create `docs/CONTENT.md`**

```markdown
# Editing your content

All résumé content lives in **`src/content/resume.ts`**, typed by
`src/content/types.ts`. Edit that one file — the DOM and animations update
automatically.

## Rules
- Only put **real, verifiable** facts here. Never invent numbers.
- Unknown specifics use a literal `[TODO: ...]` marker. A unit test
  (`tests/content.test.ts`) fails if any bracketed value is not a `[TODO`.

## Common edits
- **Experience line / tagline:** `resume.profile`.
- **Tech stack:** `resume.techStack` — array of `{ category, items }`.
- **Experience:** `resume.experience[]` — reverse-chronological.
- **Case studies:** `resume.caseStudies[]` — fill the `[TODO]` outcomes with
  real figures.
- **Metrics counters:** `resume.metrics[]` — `value` like `"30%"` animates from 0.
- **Certifications / education / contact:** the correspondingly named fields.

After editing, run `npm test` to confirm the content still validates.
```

- [ ] **Step 4: Create `docs/DEPLOYMENT.md`**

```markdown
# Deployment & security

## Hosting
Static build (`dist/`) on **Firebase Hosting** (free Spark plan). Global CDN +
automatic SSL are included.

## CI/CD
- `.github/workflows/firebase-hosting-merge.yml` — on push to `main`: `npm ci`,
  `npm run build`, deploy to the `live` channel.
- `.github/workflows/firebase-hosting-pull-request.yml` — on PRs from this repo:
  builds and posts a temporary **preview channel** URL (free).

Both require the `FIREBASE_SERVICE_ACCOUNT` GitHub secret.

## Free-tier features in use
- Global CDN + automatic managed SSL.
- `cleanUrls` (drops `.html`) and `trailingSlash: false`.
- Custom `404.html`.
- Long-lived immutable caching for content-hashed `/assets/**` and static media;
  `index.html` is `max-age=0, must-revalidate` so deploys take effect instantly.
- Per-PR preview channels.

## Security headers (set in `firebase.json`)
- **Content-Security-Policy:** `default-src 'self'`; scripts self-only; styles
  self + `'unsafe-inline'` (required by Lenis/GSAP inline style attributes);
  fonts self-hosted; `object-src 'none'`; `frame-ancestors 'none'`;
  `upgrade-insecure-requests`.
- **Strict-Transport-Security** (HSTS, 1 year, preload).
- **X-Content-Type-Options: nosniff**, **X-Frame-Options: DENY**,
  **Referrer-Policy: strict-origin-when-cross-origin**,
  **Permissions-Policy** (camera/mic/geo/FLoC disabled),
  **Cross-Origin-Opener-Policy: same-origin**.
- All external links use `rel="noopener noreferrer"`.

Verify headers after deploy:
```bash
curl -sI https://<your-domain>/ | grep -i -E 'content-security|strict-transport|x-content-type'
```

## Manual deploy (if ever needed)
```bash
npm run build
npx firebase-tools@latest deploy --only hosting
```
```

- [ ] **Step 5: Verify docs build/links**

Run: `npm run build`
Expected: build unaffected. Manually confirm the four docs exist and internal links resolve.

- [ ] **Step 6: Commit**

```bash
git add README.md docs/ARCHITECTURE.md docs/CONTENT.md docs/DEPLOYMENT.md
git commit -m "docs: add comprehensive README and architecture/content/deployment guides"
```

---

## Self-Review (completed by plan author)

**Spec coverage:** Every spec section maps to tasks — scroll journey (T6/T12), content layers (T2/T3), visual system (T4), 3D world pieces (T7–T11), scroll/camera (T12), reveals/counters (T13), perf/a11y/fallbacks (T5/T14), deploy + security + free-tier (T16), documentation (T17), testing gates (T2/T3/T5/T6/T15/T16). Positioning + real-content + `[TODO]` rules encoded in T2 (including a test asserting no non-TODO bracket placeholders). Security (self-hosted fonts, CSP/HSTS/headers, `noopener noreferrer`), mobile verification (T14 matrix), and Firebase free-tier features (T16) added per owner request.

**Placeholder scan:** No plan-level placeholders; the only `[TODO]` strings are intentional owner-input markers inside `resume.ts` content, guarded by a test. Workflow files contain `<KEEP EXISTING projectId ...>` markers that are explicit instructions to copy the real value from the existing file — never invent one.

**Type consistency:** `Resume`/`Pose`/`World`/`DeviceTier` names and `poseAt`/`activeSectionIndex`/`createWorld`/`createComposer`/`initScroll`/`initReveal`/`renderContent` signatures are consistent across defining and consuming tasks. Section keys (`hero,about,experience,casestudies,metrics,education,contact`) match between `path.ts`, `render.ts`, and both test suites.

## Open items carried from spec (owner action, not blockers)

1. Confirm the experience-line wording in `resume.ts`.
2. Replace the three `[TODO: ...]` case-study specifics with real figures.
3. Confirm resume PDF link + contact details are current.
