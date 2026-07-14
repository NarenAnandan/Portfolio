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
