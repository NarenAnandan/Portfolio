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
