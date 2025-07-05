export interface ArchitectGuideItem {
  id: string;
  title: string;
  description: string;
  content: {
    overview: string;
    keyPoints: string[];
    practicalTips: string[];
    tools?: string[];
    resources?: string[];
    checklist?: string[];
  };
  priority: 'essential' | 'important' | 'advanced';
}

export const architectGuideData: Record<string, ArchitectGuideItem[]> = {
  'core-competencies': [
    {
      id: 'technical-skills',
      title: 'Technical Skills Foundation',
      description: 'Essential technical competencies for cloud solution architects',
      priority: 'essential',
      content: {
        overview: 'Cloud solution architects must master a broad range of technical skills spanning multiple cloud platforms, networking, security, and emerging technologies.',
        keyPoints: [
          'Multi-cloud platform expertise (AWS, Azure, GCP)',
          'Networking fundamentals: TCP/IP, DNS, load balancing, CDNs',
          'Security principles: Identity management, encryption, compliance',
          'Database technologies: SQL, NoSQL, data warehousing, caching',
          'Container orchestration: Docker, Kubernetes, serverless',
          'Infrastructure as Code: Terraform, CloudFormation, ARM templates',
          'Monitoring and observability: Logging, metrics, tracing',
          'DevOps practices: CI/CD, automation, version control'
        ],
        practicalTips: [
          'Maintain hands-on experience with at least 2 major cloud platforms',
          'Build personal labs to experiment with new technologies',
          'Focus on understanding underlying principles, not just specific tools',
          'Stay current with cloud service updates and new releases',
          'Practice designing solutions for different scale requirements'
        ],
        tools: [
          'Cloud Platforms: AWS, Microsoft Azure, Google Cloud Platform',
          'IaC Tools: Terraform, Pulumi, CloudFormation, ARM Templates',
          'Containers: Docker, Kubernetes, OpenShift, ECS, AKS, GKE',
          'Monitoring: CloudWatch, Azure Monitor, Stackdriver, Datadog, New Relic',
          'Networking: VPC, VNet, Subnets, Security Groups, Load Balancers'
        ],
        checklist: [
          'Can design multi-tier applications across cloud platforms',
          'Understands networking concepts and can design secure network architectures',
          'Familiar with at least 3 database technologies and their use cases',
          'Can implement Infrastructure as Code for repeatable deployments',
          'Knows how to design for high availability and disaster recovery'
        ]
      }
    },
    {
      id: 'soft-skills',
      title: 'Communication & Leadership Skills',
      description: 'Essential soft skills for effective solution architecture',
      priority: 'essential',
      content: {
        overview: 'Technical expertise alone isn\'t sufficient. Successful cloud architects must excel at communication, stakeholder management, and translating business requirements into technical solutions.',
        keyPoints: [
          'Stakeholder communication: Technical and non-technical audiences',
          'Documentation skills: Architecture diagrams, decision records, runbooks',
          'Presentation abilities: Executive briefings, technical deep-dives',
          'Collaboration: Cross-functional teams, vendors, partners',
          'Mentoring: Guiding development teams and junior architects',
          'Negotiation: Balancing requirements, constraints, and trade-offs',
          'Change management: Leading technical transformations',
          'Problem-solving: Systematic approach to complex challenges'
        ],
        practicalTips: [
          'Practice explaining complex technical concepts in simple terms',
          'Develop templates for common architecture documents',
          'Learn to ask the right questions to uncover hidden requirements',
          'Build relationships across the organization, not just IT',
          'Document decisions and rationale for future reference'
        ],
        tools: [
          'Diagramming: Lucidchart, Draw.io, Visio, Miro, CloudCraft',
          'Documentation: Confluence, Notion, SharePoint, GitBook',
          'Presentation: PowerPoint, Google Slides, Prezi',
          'Collaboration: Slack, Microsoft Teams, Zoom, Mural',
          'Project Management: Jira, Azure DevOps, Monday.com'
        ],
        checklist: [
          'Can present technical solutions to C-level executives',
          'Comfortable facilitating architecture review meetings',
          'Able to document complex systems clearly and concisely',
          'Skilled at managing conflicting stakeholder requirements',
          'Can mentor and guide technical team members effectively'
        ]
      }
    },
    {
      id: 'business-acumen',
      title: 'Business & Financial Acumen',
      description: 'Understanding business drivers and financial implications',
      priority: 'important',
      content: {
        overview: 'Cloud architects must understand business strategy, financial implications, and how technology decisions impact the bottom line.',
        keyPoints: [
          'Cost optimization: TCO analysis, right-sizing, reserved instances',
          'ROI calculation: Quantifying benefits of cloud adoption',
          'Risk assessment: Technical, security, and business risks',
          'Compliance requirements: Industry regulations and standards',
          'Vendor management: Contract negotiation, SLA management',
          'Business continuity: Disaster recovery, backup strategies',
          'Performance metrics: KPIs, SLAs, monitoring dashboards',
          'Innovation enablement: Emerging technologies, competitive advantage'
        ],
        practicalTips: [
          'Learn to speak in business terms: revenue impact, cost savings, efficiency',
          'Understand your industry\'s specific challenges and regulations',
          'Build relationships with finance and procurement teams',
          'Track and report on architecture decisions\' business impact',
          'Stay informed about market trends and competitive landscape'
        ],
        resources: [
          'FinOps Foundation: Cloud financial management best practices',
          'Industry reports: Gartner, Forrester, IDC cloud research',
          'Business books: "The Lean Startup", "Good to Great", "Blue Ocean Strategy"',
          'Financial training: Cloud economics, TCO modeling, ROI analysis',
          'Compliance frameworks: SOC2, ISO 27001, GDPR, HIPAA'
        ]
      }
    }
  ],
  'methodologies': [
    {
      id: 'well-architected',
      title: 'Well-Architected Frameworks',
      description: 'Industry-standard architectural principles and best practices',
      priority: 'essential',
      content: {
        overview: 'Well-Architected Frameworks provide proven architectural principles that help build secure, high-performing, resilient, and efficient infrastructure.',
        keyPoints: [
          'AWS Well-Architected: 6 pillars (Operational Excellence, Security, Reliability, Performance, Cost, Sustainability)',
          'Azure Well-Architected: 5 pillars (Cost Optimization, Operational Excellence, Performance Efficiency, Reliability, Security)',
          'Google Cloud Architecture Framework: Similar principles with Google-specific guidance',
          'Operational Excellence: Automation, monitoring, continuous improvement',
          'Security: Defense in depth, least privilege, encryption everywhere',
          'Reliability: Fault tolerance, disaster recovery, scalability',
          'Performance Efficiency: Right-sizing, caching, content delivery',
          'Cost Optimization: Resource optimization, pricing models, waste elimination'
        ],
        practicalTips: [
          'Use Well-Architected review tools to assess existing architectures',
          'Apply framework principles during design phase, not as afterthought',
          'Customize frameworks to your organization\'s specific needs',
          'Regular architecture reviews using framework criteria',
          'Document trade-offs when deviating from best practices'
        ],
        tools: [
          'AWS Well-Architected Tool: Automated reviews and recommendations',
          'Azure Advisor: Personalized best practices recommendations',
          'Google Cloud Architecture Center: Reference architectures and guides',
          'Cloud Security Alliance: Security frameworks and guidelines',
          'TOGAF: Enterprise architecture methodology'
        ],
        checklist: [
          'Familiar with all pillars of major cloud Well-Architected frameworks',
          'Can conduct architecture reviews using framework criteria',
          'Understands trade-offs between different architectural decisions',
          'Able to customize frameworks for specific industry requirements',
          'Regularly applies framework principles in design work'
        ]
      }
    },
    {
      id: 'design-patterns',
      title: 'Cloud Design Patterns',
      description: 'Proven solutions to common cloud architecture challenges',
      priority: 'important',
      content: {
        overview: 'Cloud design patterns provide reusable solutions to common architectural problems, helping architects build more reliable and scalable systems.',
        keyPoints: [
          'Microservices: Service decomposition, API gateways, service mesh',
          'Event-Driven: Pub/sub messaging, event sourcing, CQRS',
          'Serverless: Function-as-a-Service, event triggers, stateless design',
          'Data Patterns: CQRS, Event Sourcing, Saga, Database per Service',
          'Resilience Patterns: Circuit Breaker, Retry, Bulkhead, Timeout',
          'Security Patterns: Zero Trust, Defense in Depth, Least Privilege',
          'Performance Patterns: Caching, CDN, Load Balancing, Auto Scaling',
          'Integration Patterns: API Gateway, Message Queue, Event Bus'
        ],
        practicalTips: [
          'Understand when to apply each pattern and when not to',
          'Combine patterns appropriately for complex scenarios',
          'Consider the operational overhead of each pattern',
          'Start simple and evolve architecture as requirements grow',
          'Document pattern usage and rationale in architecture decisions'
        ],
        tools: [
          'Service Mesh: Istio, Linkerd, AWS App Mesh, Azure Service Fabric',
          'API Gateways: Kong, Ambassador, AWS API Gateway, Azure API Management',
          'Message Brokers: Apache Kafka, RabbitMQ, AWS SQS/SNS, Azure Service Bus',
          'Monitoring: Jaeger, Zipkin, AWS X-Ray, Azure Application Insights',
          'Container Orchestration: Kubernetes, Docker Swarm, AWS ECS, Azure ACI'
        ]
      }
    },
    {
      id: 'migration-strategies',
      title: 'Cloud Migration Strategies',
      description: 'Systematic approaches to moving workloads to the cloud',
      priority: 'important',
      content: {
        overview: 'The 6 R\'s of cloud migration provide a framework for systematically moving applications and workloads to the cloud.',
        keyPoints: [
          'Rehost (Lift & Shift): Move applications without changes',
          'Replatform (Lift & Reshape): Minor optimizations for cloud',
          'Repurchase (Drop & Shop): Move to SaaS solutions',
          'Refactor (Re-architect): Redesign for cloud-native benefits',
          'Retire: Decommission applications no longer needed',
          'Retain: Keep applications on-premises for now',
          'Assessment: Application portfolio analysis and prioritization',
          'Wave planning: Phased migration approach with dependencies'
        ],
        practicalTips: [
          'Start with comprehensive application discovery and assessment',
          'Prioritize migrations based on business value and technical complexity',
          'Plan for data migration challenges and downtime requirements',
          'Establish cloud governance and security before migration',
          'Include rollback plans for each migration wave'
        ],
        tools: [
          'Assessment: AWS Application Discovery Service, Azure Migrate, Google Cloud Migration Center',
          'Migration: AWS Database Migration Service, Azure Site Recovery, Google Cloud Migrate',
          'Planning: Migration portfolio tools, dependency mapping software',
          'Testing: Load testing tools, application performance monitoring',
          'Automation: Infrastructure as Code, CI/CD pipelines'
        ]
      }
    }
  ],
  'tools-technologies': [
    {
      id: 'diagramming-tools',
      title: 'Architecture Diagramming Tools',
      description: 'Essential tools for creating clear and professional architecture diagrams',
      priority: 'essential',
      content: {
        overview: 'Visual communication is crucial for solution architects. The right diagramming tools help create clear, professional diagrams that effectively communicate complex architectures.',
        keyPoints: [
          'Cloud-specific tools: AWS Architecture Icons, Azure Icons, GCP Icons',
          'General diagramming: Lucidchart, Draw.io, Microsoft Visio',
          'Collaborative tools: Miro, Mural, Figma for team workshops',
          'Code-based diagrams: PlantUML, Diagrams as Code, Graphviz',
          'Specialized tools: CloudCraft for 3D AWS diagrams, Cloudockit for documentation',
          'Standards: C4 Model, UML, ArchiMate for consistent notation',
          'Version control: Treating diagrams as code for change tracking',
          'Integration: Embedding diagrams in documentation and presentations'
        ],
        practicalTips: [
          'Maintain a consistent visual style across all diagrams',
          'Use official cloud provider icons and colors',
          'Keep diagrams simple and focused on the intended audience',
          'Version control your diagrams alongside code',
          'Create diagram templates for common architecture patterns'
        ],
        tools: [
          'Cloud-Native: AWS Architecture Center, Azure Architecture Center, GCP Architecture Center',
          'Professional: Lucidchart, Microsoft Visio, OmniGraffle',
          'Free/Open Source: Draw.io, PlantUML, Graphviz',
          'Collaborative: Miro, Mural, Figma, Whimsical',
          'Specialized: CloudCraft, Cloudockit, Hava.io'
        ]
      }
    },
    {
      id: 'iac-tools',
      title: 'Infrastructure as Code (IaC)',
      description: 'Tools and practices for managing infrastructure through code',
      priority: 'essential',
      content: {
        overview: 'Infrastructure as Code enables architects to define, deploy, and manage infrastructure using code, providing consistency, repeatability, and version control.',
        keyPoints: [
          'Declarative vs Imperative: Terraform vs Ansible approaches',
          'Cloud-native tools: CloudFormation (AWS), ARM Templates (Azure), Deployment Manager (GCP)',
          'Multi-cloud tools: Terraform, Pulumi, Crossplane',
          'Configuration management: Ansible, Chef, Puppet, SaltStack',
          'Policy as Code: Open Policy Agent, AWS Config Rules, Azure Policy',
          'Testing: Terratest, Kitchen-Terraform, InSpec',
          'State management: Remote state, state locking, team collaboration',
          'CI/CD integration: Automated testing and deployment pipelines'
        ],
        practicalTips: [
          'Start with cloud-native tools, then consider multi-cloud options',
          'Implement proper state management from the beginning',
          'Use modules/templates for reusable infrastructure components',
          'Include security scanning in your IaC pipeline',
          'Document your infrastructure code as thoroughly as application code'
        ],
        tools: [
          'Multi-Cloud: Terraform, Pulumi, Crossplane',
          'AWS: CloudFormation, CDK, SAM',
          'Azure: ARM Templates, Bicep, Azure Resource Manager',
          'GCP: Deployment Manager, Cloud Foundation Toolkit',
          'Testing: Terratest, Kitchen-Terraform, Checkov, tfsec'
        ]
      }
    },
    {
      id: 'monitoring-observability',
      title: 'Monitoring & Observability',
      description: 'Tools and strategies for comprehensive system monitoring',
      priority: 'important',
      content: {
        overview: 'Effective monitoring and observability are essential for maintaining reliable cloud systems and enabling rapid incident response.',
        keyPoints: [
          'Three pillars: Metrics, Logs, and Traces (distributed tracing)',
          'Cloud-native monitoring: CloudWatch, Azure Monitor, Google Cloud Monitoring',
          'Third-party solutions: Datadog, New Relic, Splunk, Elastic Stack',
          'Application Performance Monitoring (APM): End-to-end visibility',
          'Infrastructure monitoring: Server, network, and storage metrics',
          'Synthetic monitoring: Proactive testing of user journeys',
          'Alerting strategies: Alert fatigue prevention, escalation policies',
          'Dashboards: Executive, operational, and troubleshooting views'
        ],
        practicalTips: [
          'Implement monitoring early in the development lifecycle',
          'Focus on business metrics, not just technical metrics',
          'Use SLIs (Service Level Indicators) and SLOs (Service Level Objectives)',
          'Implement proper log aggregation and structured logging',
          'Create runbooks for common alerts and incidents'
        ],
        tools: [
          'Cloud Native: AWS CloudWatch, Azure Monitor, Google Cloud Operations',
          'APM: Datadog, New Relic, AppDynamics, Dynatrace',
          'Open Source: Prometheus, Grafana, ELK Stack, Jaeger',
          'Log Management: Splunk, Sumo Logic, Loggly',
          'Synthetic Monitoring: Pingdom, StatusCake, Catchpoint'
        ]
      }
    }
  ],
  'domain-expertise': [
    {
      id: 'security-compliance',
      title: 'Security & Compliance',
      description: 'Essential security principles and compliance frameworks',
      priority: 'essential',
      content: {
        overview: 'Security must be built into every layer of cloud architecture, with compliance requirements varying by industry and geography.',
        keyPoints: [
          'Zero Trust Architecture: Never trust, always verify',
          'Identity and Access Management: RBAC, ABAC, SSO, MFA',
          'Data protection: Encryption at rest and in transit, key management',
          'Network security: Firewalls, VPNs, network segmentation',
          'Compliance frameworks: SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS',
          'Security monitoring: SIEM, threat detection, incident response',
          'DevSecOps: Security integrated into CI/CD pipelines',
          'Risk assessment: Threat modeling, vulnerability management'
        ],
        practicalTips: [
          'Implement security by design, not as an afterthought',
          'Use cloud-native security services when possible',
          'Regularly conduct security assessments and penetration testing',
          'Maintain an incident response plan and test it regularly',
          'Stay current with security threats and best practices'
        ],
        tools: [
          'Identity: AWS IAM, Azure AD, Google Cloud IAM, Okta, Auth0',
          'Security Monitoring: AWS GuardDuty, Azure Sentinel, Google Cloud Security Command Center',
          'Vulnerability Scanning: Qualys, Rapid7, Tenable, AWS Inspector',
          'Compliance: AWS Config, Azure Policy, Google Cloud Asset Inventory',
          'SIEM: Splunk, IBM QRadar, Microsoft Sentinel, Elastic Security'
        ]
      }
    },
    {
      id: 'data-architecture',
      title: 'Data Architecture & Analytics',
      description: 'Designing scalable and efficient data solutions',
      priority: 'important',
      content: {
        overview: 'Modern data architecture must handle diverse data types, real-time processing, and analytics at scale while ensuring governance and security.',
        keyPoints: [
          'Data lakes vs Data warehouses: When to use each approach',
          'Real-time vs Batch processing: Stream processing, ETL/ELT pipelines',
          'Data governance: Cataloging, lineage, quality, privacy',
          'Analytics platforms: Business intelligence, machine learning, data science',
          'Data integration: APIs, messaging, change data capture',
          'Storage optimization: Partitioning, compression, lifecycle policies',
          'Data security: Encryption, masking, access controls',
          'Scalability: Distributed processing, auto-scaling, performance tuning'
        ],
        practicalTips: [
          'Start with understanding data sources and consumption patterns',
          'Design for both current needs and future growth',
          'Implement data governance early in the project',
          'Consider data locality and compliance requirements',
          'Plan for data backup, recovery, and archival strategies'
        ],
        tools: [
          'Data Lakes: AWS S3, Azure Data Lake, Google Cloud Storage',
          'Data Warehouses: Amazon Redshift, Azure Synapse, Google BigQuery',
          'ETL/ELT: AWS Glue, Azure Data Factory, Google Cloud Dataflow',
          'Streaming: Apache Kafka, AWS Kinesis, Azure Event Hubs',
          'Analytics: Tableau, Power BI, Looker, Apache Spark'
        ]
      }
    }
  ],
  'career-development': [
    {
      id: 'certifications',
      title: 'Professional Certifications',
      description: 'Industry-recognized certifications for cloud architects',
      priority: 'important',
      content: {
        overview: 'Professional certifications validate expertise and demonstrate commitment to continuous learning in the rapidly evolving cloud landscape.',
        keyPoints: [
          'AWS Certifications: Solutions Architect Professional, DevOps Engineer Professional',
          'Azure Certifications: Azure Solutions Architect Expert, Azure DevOps Engineer Expert',
          'Google Cloud: Professional Cloud Architect, Professional DevOps Engineer',
          'Multi-cloud: TOGAF, Certified Cloud Security Professional (CCSP)',
          'Specialized: Kubernetes (CKA, CKAD), Security (CISSP, CISM)',
          'Vendor-neutral: CompTIA Cloud+, Cloud Security Alliance certifications',
          'Emerging areas: AI/ML certifications, Edge computing, Sustainability',
          'Continuous learning: Staying current with evolving certification paths'
        ],
        practicalTips: [
          'Choose certifications aligned with your career goals and current role',
          'Combine hands-on experience with certification study',
          'Maintain certifications through continuing education',
          'Consider the business value of certifications in your industry',
          'Use certification study as an opportunity to fill knowledge gaps'
        ],
        resources: [
          'AWS Training: AWS Skill Builder, AWS Training and Certification',
          'Azure Learning: Microsoft Learn, Azure documentation',
          'Google Cloud: Google Cloud Skills Boost, Coursera partnerships',
          'Practice Exams: Whizlabs, MeasureUp, Practice Tests',
          'Study Groups: Local meetups, online communities, study partners'
        ]
      }
    },
    {
      id: 'learning-paths',
      title: 'Continuous Learning & Development',
      description: 'Strategies for staying current in the fast-evolving cloud landscape',
      priority: 'essential',
      content: {
        overview: 'The cloud industry evolves rapidly. Successful architects must commit to continuous learning and skill development throughout their careers.',
        keyPoints: [
          'Technical learning: Hands-on labs, personal projects, open source contributions',
          'Industry knowledge: Following thought leaders, reading research reports',
          'Networking: Professional associations, conferences, local meetups',
          'Teaching: Mentoring, speaking, writing technical content',
          'Cross-functional skills: Business acumen, project management, leadership',
          'Emerging technologies: AI/ML, edge computing, quantum computing',
          'Soft skills: Communication, negotiation, change management',
          'Industry specialization: Healthcare, finance, retail, manufacturing'
        ],
        practicalTips: [
          'Set aside dedicated time each week for learning',
          'Build a personal lab environment for experimentation',
          'Join professional communities and contribute actively',
          'Document and share your learning journey',
          'Seek feedback from peers and mentors regularly'
        ],
        resources: [
          'Online Learning: Pluralsight, Udemy, Coursera, edX, A Cloud Guru',
          'Books: "Designing Data-Intensive Applications", "Building Microservices", "Site Reliability Engineering"',
          'Conferences: re:Invent, Build, Google Cloud Next, KubeCon',
          'Communities: Stack Overflow, Reddit, Discord servers, LinkedIn groups',
          'Podcasts: AWS Podcast, Azure DevOps Podcast, Google Cloud Podcast'
        ]
      }
    },
    {
      id: 'portfolio-showcase',
      title: 'Building Your Architecture Portfolio',
      description: 'Showcasing your architecture work and expertise',
      priority: 'important',
      content: {
        overview: 'A strong portfolio demonstrates your architectural thinking, problem-solving abilities, and the business impact of your work.',
        keyPoints: [
          'Case studies: Document real-world architecture challenges and solutions',
          'Architecture diagrams: High-quality visuals showing system design',
          'Decision records: Rationale behind architectural choices',
          'Business impact: Quantify the results of your architectural decisions',
          'Technical writing: Blog posts, whitepapers, documentation',
          'Speaking engagements: Conference talks, webinars, meetup presentations',
          'Open source: Contributions to relevant projects and tools',
          'Thought leadership: Industry insights and trend analysis'
        ],
        practicalTips: [
          'Anonymize sensitive information while preserving the architectural story',
          'Focus on the problem-solving process, not just the final solution',
          'Include both successes and lessons learned from challenges',
          'Keep your portfolio updated with recent work and technologies',
          'Tailor your portfolio presentation to your target audience'
        ],
        tools: [
          'Portfolio Platforms: GitHub Pages, GitLab Pages, Personal websites',
          'Documentation: GitBook, Notion, Confluence, Medium',
          'Presentation: Speaker Deck, SlideShare, Prezi',
          'Video Content: YouTube, Vimeo, Loom for architecture walkthroughs',
          'Professional Networks: LinkedIn, Twitter, professional associations'
        ]
      }
    }
  ]
};
