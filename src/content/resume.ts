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
