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
