// All page content lives here. Components only lay it out.
// Rule for anything added: no internal names, customers, hostnames, spend or incident counts.

export const profile = {
  name: 'Naren Anandan',
  fullName: 'Narendiran Anandan',
  role: 'DevOps & Platform Engineer',
  location: 'Ottawa, Canada',
  email: 'narenanand23@gmail.com',
  linkedin: 'https://www.linkedin.com/in/narenanandan/',
  github: 'https://github.com/NarenAnandan',
  resume: 'https://drive.google.com/file/d/1kK_pl3gcSpJv9e3aLUcfzvSnNXxj-Qlx/view?usp=sharing',
  summary:
    'I run production infrastructure on AWS, and since 2023 I have owned DevOps end to end for an ad and deals platform. I build the pipelines, environments and guardrails that let a product team ship daily without waking anyone up.',
};

export const rotating = ['reliable', 'observable', 'automated', 'secure', 'cost-aware'];

/** The hero topology: one centre node and four satellites. Each links to its skills group. */
export const topology = [
  { pos: 'tl', group: 'Cloud & data', title: 'AWS', detail: 'Elastic Beanstalk · EC2 · CloudFront · CloudFormation' },
  { pos: 'tr', group: 'CI/CD & release', title: 'CI/CD', detail: 'GitHub Actions · runners · build cache' },
  { pos: 'bl', group: 'Reliability (SRE)', title: 'Reliability', detail: 'Incidents · capacity · SLOs' },
  { pos: 'br', group: 'Observability', title: 'Observability', detail: 'New Relic · CloudWatch · OpenTelemetry' },
];

export const metrics = [
  { kind: 'Availability', value: '99.99%', label: 'uptime on the AWS platform I run' },
  { kind: 'Cost', value: '−28%', label: 'monthly AWS spend from rightsizing' },
  { kind: 'Delivery', value: 'Daily', label: 'releases, up from weekly' },
  { kind: 'Recovery', value: '−45%', label: 'mean time to resolve incidents' },
];

export const principles = [
  { title: 'Boring is a feature', body: 'Predictable deploys and quiet pagers beat clever systems nobody can debug at 3 a.m.' },
  { title: 'Everything as code, reviewed', body: 'Infrastructure, pipelines and docs live in git, change through pull requests, and can be rebuilt.' },
  { title: 'Measure before changing', body: 'Root cause from logs, traces and latency data first. Then the smallest fix that holds.' },
  { title: 'Automate the second time', body: 'Do it by hand once and write it down. The second time it becomes a script, a check or a golden path.' },
];

export const cases = [
  {
    tag: 'CI/CD platform',
    title: 'Moved the company to GitHub, then made ~25 repositories build the same way',
    situation: 'Builds were split across Bitbucket Pipelines and one-off workflows. Every repository did CI slightly differently, and upgrades meant editing each one by hand.',
    action: 'Made the case for GitHub and led the migration. Then built shared actions and a standard workflow layout, pinned every action to an exact release, added a remote Gradle build cache with parallel tests, and automated rebuilds of the self-hosted runner images before they age out.',
    outcome: '30% lower licensing and operating cost, pipelines about 40% faster, and one change now rolls out across every repository.',
    stack: ['GitHub Actions', 'Self-hosted runners', 'Gradle', 'Bash'],
  },
  {
    tag: 'Data platform',
    title: 'Moved live Elasticsearch clusters up to current 8.x',
    situation: 'Search and deals data sat on an older Elasticsearch major version, with index mappings that could drift between environments.',
    action: 'Planned and ran the major-version migrations, each with a written runbook. Moved the clusters to Graviton, added a disk health check that adds data nodes on its own, and built a mapping check that catches drift before production.',
    outcome: 'Clusters on a supported release, the old ones torn down, and a repeatable procedure for the next upgrade.',
    stack: ['Elasticsearch 8', 'EC2 Graviton', 'ILM', 'Bash'],
  },
  {
    tag: 'Reliability',
    title: 'Root-caused 502s and host crashes on Elastic Beanstalk',
    situation: 'A busy service threw bursts of 502s and flapped between scaling up and down. Another host fell over under memory pressure.',
    action: 'Traced the 502s to a connection-drain window shorter than the slowest requests, and the crashes to runtime memory limits that added up to more than the container had. Switched the load balancer to least-outstanding-requests routing and set drain and memory limits from measured latency and usage.',
    outcome: 'Scale-in no longer drops requests, and the fixes are standard environment configuration kept in git.',
    stack: ['Elastic Beanstalk', 'ALB', 'Auto Scaling', 'New Relic'],
  },
  {
    tag: 'Release engineering',
    title: 'Versioned delivery and one-step rollback for the web apps',
    situation: 'Front-end releases were all versioned as patches, and getting back from a bad deploy meant redeploying by hand.',
    action: 'Built a CloudFront and S3 delivery platform for the Angular apps with per-app release scoping, versions driven by commit messages, blue/green distributions, and source maps wired into error tracking.',
    outcome: 'Each app ships on its own version, and rollback was proven in staged production runs before go-live.',
    stack: ['CloudFront', 'CloudFormation', 'S3', 'Nx'],
  },
  {
    tag: 'Developer platform',
    title: 'A one-command dev environment, and a safe sandbox for AI coding agents',
    situation: 'Setting up a working environment took days, and the team wanted AI coding agents without handing them production access.',
    action: 'Shipped versioned bootstrap scripts for Windows and Ubuntu with a local AWS emulator in Docker Compose. Designed an isolated sandbox for agents, kept apart from developer machines and production, and moved team docs to a docs-as-code site.',
    outcome: 'New developers start from one script, and agents can read, draft and review infrastructure changes while a person still applies them.',
    stack: ['Docker Compose', 'PowerShell', 'CloudFormation', 'IAM', 'MkDocs'],
  },
];

/** Experience timeline. start/end are [year, 0-based month]; no end means current. */
export const roles = [
  {
    key: 'shopliftr', start: [2023, 2], current: true,
    when: 'Mar 2023 — Present', org: 'ShopLiftr', place: 'Ottawa', title: 'DevOps Platform Engineer',
    summary: 'DevOps for an AWS platform of Groovy/Spring Boot services, Node and Angular apps, and Elasticsearch.',
    points: [
      'Run the AWS estate (Elastic Beanstalk, EC2, CloudFormation, CloudFront, S3, Lambda) at 99.99% uptime, and cut monthly spend by 28% through rightsizing.',
      'Led the move from Bitbucket to GitHub: 30% lower licensing and operating cost, and pipelines 40% faster.',
      'Took releases from weekly to daily with GitHub Actions, and cut deployment errors by 90%.',
      'Containerised every service with Docker and Docker Compose: deployment time down 70%, and local environments that match production.',
      'Built monitoring and alerting on CloudWatch and New Relic, cutting mean time to resolve by 45%.',
    ],
  },
  {
    key: 'pythian', start: [2022, 4], end: [2023, 1],
    when: 'May 2022 — Feb 2023', org: 'Pythian', place: 'Ottawa', title: 'DevOps Specialist',
    summary: 'Cloud consultancy, mainly on Google Cloud, across client and internal teams.',
    points: [
      'Split a legacy monolith into 10+ containerised services, making releases 50% faster.',
      'Automated CI/CD with Jenkins and GitLab CI: 75% less manual deployment work, release cycles from 3 days to under 8 hours.',
      'Redesigned client environments on GCE, GKE, Cloud SQL and Cloud Build for 99.95% availability.',
      'Added dependency scanning and secret detection to pipelines, and observability on Prometheus, Grafana and Stackdriver that cut time to detect by 40%.',
    ],
  },
  {
    key: 'eastlink', start: [2021, 9], end: [2022, 3],
    when: 'Oct 2021 — Apr 2022', org: 'Eastlink', place: 'Halifax', title: 'Network Operations Center Engineer',
    summary: '24×7 operations for a major telecommunications provider.',
    points: [
      'Monitored 500+ customer networks, servers and dedicated links, holding a first-response SLA of 95% or better.',
      'Resolved 85% of incidents without escalation, ranked in the top 10% of the team, and trained 5+ new engineers.',
    ],
  },
];

export const earlier =
  'Before that: Graduate Teaching Assistant at Dalhousie University (2019–2021). I helped move a 249-student engineering course online during the pandemic.';

/** prod = in production use at work every week; hands = used hands-on. */
type Level = 'prod' | 'hands';
export const skills: { group: string; note: string; items: [string, Level][] }[] = [
  {
    group: 'Cloud & data',
    note: 'AWS daily; Google Cloud and Azure from consulting work.',
    items: [['AWS', 'prod'], ['Elastic Beanstalk', 'prod'], ['CloudFront', 'prod'], ['Elasticsearch 8', 'prod'], ['EKS / ECS / Fargate', 'hands'], ['Google Cloud · GKE', 'hands'], ['Azure', 'hands'], ['Redis', 'hands']],
  },
  {
    group: 'Infrastructure as code',
    note: 'Reviewed, versioned templates, with change sets before anything touches production.',
    items: [['CloudFormation', 'prod'], ['Terraform', 'hands'], ['AWS CDK', 'hands'], ['Crossplane', 'hands'], ['Pulumi', 'hands'], ['Ansible', 'hands']],
  },
  {
    group: 'Kubernetes & GitOps',
    note: 'Cluster delivery driven from git, with autoscaling sized from real load.',
    items: [['Kubernetes', 'hands'], ['Helm', 'hands'], ['Argo CD', 'hands'], ['Flux', 'hands'], ['Karpenter / KEDA', 'hands'], ['Docker', 'prod']],
  },
  {
    group: 'CI/CD & release',
    note: 'Shared workflows, fast feedback, versioned releases and a tested way back.',
    items: [['GitHub Actions', 'prod'], ['Self-hosted runners', 'prod'], ['Gradle build cache', 'prod'], ['Blue/green & rollback', 'prod'], ['Jenkins', 'hands'], ['GitLab CI', 'hands']],
  },
  {
    group: 'Observability',
    note: 'Alerts tied to real failure modes, not dashboards nobody opens.',
    items: [['New Relic', 'prod'], ['CloudWatch', 'prod'], ['OpenTelemetry', 'hands'], ['Prometheus', 'hands'], ['Grafana', 'hands'], ['ELK', 'hands']],
  },
  {
    group: 'Reliability (SRE)',
    note: 'Evidence-first root cause, written up so it does not happen twice.',
    items: [['Incident response', 'prod'], ['Blameless postmortems', 'prod'], ['Capacity & autoscaling', 'prod'], ['Runbooks', 'prod'], ['SLOs & error budgets', 'hands'], ['Load & chaos testing', 'hands']],
  },
  {
    group: 'Security & supply chain',
    note: 'Least privilege by default, and dependencies pinned to exact versions.',
    items: [['IAM least privilege', 'prod'], ['Pinned, scanned CI', 'prod'], ['Secrets Manager / Vault', 'hands'], ['Policy as code (OPA, Kyverno, Checkov)', 'hands'], ['SBOM & signing (Syft, cosign)', 'hands'], ['GuardDuty · Security Hub · WAF', 'hands']],
  },
  {
    group: 'Platform & cost',
    note: 'Golden paths for developers, and spend that is measured, not guessed.',
    items: [['Dev environments', 'prod'], ['Docs as code', 'prod'], ['AWS cost & rightsizing', 'prod'], ['Backstage', 'hands'], ['Kubecost', 'hands']],
  },
  {
    group: 'Code & AI-assisted ops',
    note: 'Scripts and tools that remove manual steps; agents that read, draft and review.',
    items: [['Bash', 'prod'], ['PowerShell', 'prod'], ['Groovy', 'prod'], ['Claude Code & MCP', 'prod'], ['Python', 'hands'], ['TypeScript', 'hands']],
  },
];

export const certifications = [
  { name: 'Google Cloud Professional Cloud DevOps Engineer', url: 'https://www.credential.net/aa4c32b8-f2f7-4843-8d1a-b6fab153992d' },
  { name: 'HashiCorp Certified: Terraform Associate', url: 'https://www.credly.com/badges/e98d85c7-7686-47a9-8572-f157384cbec3' },
  { name: 'Google Cloud Associate Cloud Engineer', url: 'https://www.credential.net/62c5c135-c902-4a7b-b67d-2bbe33f1087f' },
  { name: 'Microsoft Certified: Azure Developer Associate', url: 'https://www.credly.com/badges/1e8ae7ff-a354-485c-bfab-519ca6cac9ef/public_url' },
];

export const education = [
  { name: 'MEng, Electrical & Computer Engineering', where: 'Dalhousie University, Halifax', when: '2018–2021' },
  { name: 'BE, Electronics & Electrical Engineering', where: 'Anna University, Chennai', when: '2014–2018' },
];
