import type { ExamDomain } from '../types';

export const EXAM_CONFIG = {
  FULL_EXAM_QUESTIONS: 75,
  FULL_EXAM_DURATION: 180 * 60, // 180 minutes in seconds
  PASSING_SCORE: 720, // out of 1000
  PASSING_PERCENTAGE: 72,
} as const;

export const DOMAIN_INFO: Record<ExamDomain, { name: string; percentage: number; description: string }> = {
  'organizational-complexity': {
    name: 'Design Solutions for Organizational Complexity',
    percentage: 26,
    description: 'Cross-account resource sharing, AWS Organizations, multi-account strategies'
  },
  'new-solutions': {
    name: 'Design for New Solutions',
    percentage: 29,
    description: 'Application architecture, database design, storage solutions, networking'
  },
  'migration-planning': {
    name: 'Migration Planning',
    percentage: 8,
    description: 'Migration strategies, hybrid architectures, data migration patterns'
  },
  'cost-control': {
    name: 'Cost Control',
    percentage: 12,
    description: 'Cost optimization, resource right-sizing, Reserved Instances'
  },
  'continuous-improvement': {
    name: 'Continuous Improvement for Existing Solutions',
    percentage: 25,
    description: 'Performance optimization, security improvements, operational excellence'
  }
} as const;

export const ROUTES = {
  HOME: '/',
  PRACTICE: '/practice',
  EXAM: '/exam',
  ANALYTICS: '/analytics',
  SERVICES: '/services',
  ARCHITECT: '/architect',
  SETTINGS: '/settings',
} as const;

export const STORAGE_KEYS = {
  QUESTIONS: 'aws-sap-c02-questions',
  PROGRESS: 'aws-sap-c02-progress',
  SETTINGS: 'aws-sap-c02-settings',
  EXAM_SESSION: 'aws-sap-c02-exam-session',
} as const;

// Keywords for automatic question categorization - Fine-tuned for SAP-C02
export const DOMAIN_KEYWORDS: Record<ExamDomain, string[]> = {
  'organizational-complexity': [
    // AWS Organizations specific
    'organizations', 'organization', 'scp', 'service control policy', 'service control policies',
    'multi-account', 'cross-account', 'master account', 'management account', 'member account',
    'organizational unit', 'ou', 'ous',
    
    // Billing and Cost Management
    'consolidated billing', 'cost allocation', 'billing account', 'linked account',
    'cost center', 'cost allocation tags', 'detailed billing',
    
    // Identity and Access across accounts
    'cross-account role', 'assume role', 'trust policy', 'cross-account access',
    'identity federation', 'saml', 'active directory', 'ad connector',
    
    // Compliance and Governance
    'aws config', 'config rules', 'compliance', 'governance',
    'aws control tower', 'control tower', 'landing zone', 'account factory'
  ],
  
  'migration-planning': [
    // Migration Services
    'migration', 'migrate', 'migrating', 'aws migration hub', 'migration hub',
    'aws dms', 'database migration service', 'database migration',
    'aws sms', 'server migration service', 'server migration',
    'aws application migration service', 'application migration',
    
    // Hybrid and Connectivity
    'hybrid', 'on-premises', 'on-premise', 'data center', 'datacenter',
    'direct connect', 'dx', 'vpn', 'site-to-site vpn', 'client vpn',
    'aws transit gateway', 'transit gateway', 'tgw',
    
    // Data Transfer
    'aws snowball', 'snowball', 'snowmobile', 'snowcone', 'snow family',
    'aws datasync', 'datasync', 'storage gateway', 'file gateway',
    'volume gateway', 'tape gateway',
    
    // Legacy and Modernization
    'legacy', 'modernization', 'refactor', 'replatform', 'rehost',
    'lift and shift', '6 rs', 'migration strategy'
  ],
  
  'cost-control': [
    // Cost Management
    'cost', 'costs', 'pricing', 'price', 'budget', 'budgets', 'billing',
    'cost optimization', 'cost-effective', 'cost effective', 'cheapest', 'lowest cost',
    'cost explorer', 'cost and usage report', 'cur',
    
    // Reserved Instances and Savings
    'reserved instance', 'reserved instances', 'ri', 'ris',
    'savings plan', 'savings plans', 'compute savings plan',
    'spot instance', 'spot instances', 'spot fleet',
    
    // Cost Tools
    'trusted advisor', 'aws cost explorer', 'cost anomaly detection',
    'cost allocation tags', 'cost categories', 'rightsizing',
    
    // Financial Operations
    'finops', 'financial operations', 'cost governance',
    'cost transparency', 'chargeback', 'showback'
  ],
  
  'continuous-improvement': [
    // Performance and Optimization
    'performance', 'optimize', 'optimization', 'tuning', 'efficiency',
    'bottleneck', 'latency', 'throughput', 'response time',
    
    // Monitoring and Observability
    'monitoring', 'cloudwatch', 'cloudtrail', 'x-ray', 'xray',
    'metrics', 'logs', 'alarms', 'notifications', 'sns',
    'observability', 'tracing', 'distributed tracing',
    
    // Security and Compliance
    'security', 'secure', 'encryption', 'kms', 'key management',
    'iam', 'identity and access management', 'policies', 'roles',
    'aws config', 'config rules', 'compliance', 'audit',
    'aws inspector', 'aws guardduty', 'security hub',
    
    // Operational Excellence
    'operational excellence', 'automation', 'systems manager',
    'parameter store', 'secrets manager', 'patch management',
    'maintenance window', 'runbook', 'playbook',
    
    // Well-Architected
    'well-architected', 'well architected', 'reliability', 'availability',
    'fault tolerance', 'disaster recovery', 'backup', 'restore'
  ],
  
  'new-solutions': [
    // Only specific architectural patterns that don't fit other domains
    'microservices', 'serverless architecture', 'event-driven',
    'loosely coupled', 'decoupled', 'service-oriented',
    
    // Specific design patterns
    'fan-out', 'fan-in', 'circuit breaker', 'bulkhead',
    'strangler fig', 'saga pattern', 'cqrs',
    
    // Innovation and Modern Architecture
    'containerization', 'kubernetes', 'eks', 'fargate',
    'api gateway patterns', 'graphql', 'rest api design',
    
    // Emerging Technologies
    'machine learning', 'ml', 'artificial intelligence', 'ai',
    'iot', 'internet of things', 'edge computing',
    
    // Specific AWS Services for New Solutions
    'aws step functions', 'step functions', 'state machine',
    'aws eventbridge', 'eventbridge', 'event bus',
    'aws appsync', 'appsync', 'graphql api'
  ]
} as const;
