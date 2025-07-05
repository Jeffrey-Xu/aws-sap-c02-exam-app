import type { ExamDomain } from '../types';

export interface FlashcardQuestion {
  id: string;
  domain: ExamDomain;
  service: string;
  type: 'yes-no' | 'multiple-choice';
  question: string;
  options?: string[];
  correctAnswer: string | boolean;
  explanation: string;
  keyPoints: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

export const AWS_FLASHCARDS: FlashcardQuestion[] = [
  // Organizational Complexity
  {
    id: 'org-001',
    domain: 'organizational-complexity',
    service: 'AWS Organizations',
    type: 'yes-no',
    question: 'Can Service Control Policies (SCPs) grant permissions to IAM users?',
    correctAnswer: false,
    explanation: 'SCPs are guardrails that set the maximum permissions. They can only restrict permissions, never grant them.',
    keyPoints: [
      'SCPs act as permission boundaries',
      'They filter permissions, not grant them',
      'Must be combined with IAM policies for access'
    ],
    difficulty: 'intermediate'
  },
  {
    id: 'org-002',
    domain: 'organizational-complexity',
    service: 'AWS Organizations',
    type: 'multiple-choice',
    question: 'Which billing feature is automatically enabled when you create an AWS Organization?',
    options: [
      'Cost allocation tags',
      'Consolidated billing',
      'Reserved Instance sharing',
      'Savings Plans sharing'
    ],
    correctAnswer: 'Consolidated billing',
    explanation: 'Consolidated billing is automatically enabled and allows the master account to pay for all member accounts.',
    keyPoints: [
      'Single bill for all accounts',
      'Volume discounts apply across accounts',
      'Master account pays for all charges'
    ],
    difficulty: 'basic'
  },
  {
    id: 'org-003',
    domain: 'organizational-complexity',
    service: 'AWS Control Tower',
    type: 'yes-no',
    question: 'Does AWS Control Tower automatically set up AWS Config in all managed accounts?',
    correctAnswer: true,
    explanation: 'Control Tower automatically deploys AWS Config to enable continuous monitoring and compliance checking.',
    keyPoints: [
      'Config tracks resource configurations',
      'Enables compliance monitoring',
      'Part of Control Tower guardrails'
    ],
    difficulty: 'intermediate'
  },

  // New Solutions
  {
    id: 'new-001',
    domain: 'new-solutions',
    service: 'Amazon RDS',
    type: 'multiple-choice',
    question: 'Which RDS feature provides automatic failover for high availability?',
    options: [
      'Read Replicas',
      'Multi-AZ deployment',
      'Automated backups',
      'Performance Insights'
    ],
    correctAnswer: 'Multi-AZ deployment',
    explanation: 'Multi-AZ provides automatic failover to a standby instance in a different AZ for high availability.',
    keyPoints: [
      'Synchronous replication to standby',
      'Automatic failover in case of failure',
      'Different from Read Replicas (async)'
    ],
    difficulty: 'basic'
  },
  {
    id: 'new-002',
    domain: 'new-solutions',
    service: 'Amazon Aurora',
    type: 'yes-no',
    question: 'Can Aurora automatically scale storage up to 128 TB?',
    correctAnswer: true,
    explanation: 'Aurora storage automatically scales from 10GB to 128TB in 10GB increments as needed.',
    keyPoints: [
      'Automatic storage scaling',
      'No downtime for scaling',
      'Pay only for used storage'
    ],
    difficulty: 'basic'
  },
  {
    id: 'new-003',
    domain: 'new-solutions',
    service: 'Amazon S3',
    type: 'multiple-choice',
    question: 'Which S3 storage class is most cost-effective for data accessed once per year?',
    options: [
      'S3 Standard-IA',
      'S3 One Zone-IA',
      'S3 Glacier Flexible Retrieval',
      'S3 Glacier Deep Archive'
    ],
    correctAnswer: 'S3 Glacier Deep Archive',
    explanation: 'Glacier Deep Archive is the lowest-cost storage class, designed for data accessed once or twice per year.',
    keyPoints: [
      'Lowest cost storage class',
      '12-hour retrieval time',
      'Ideal for long-term archival'
    ],
    difficulty: 'intermediate'
  },
  {
    id: 'new-004',
    domain: 'new-solutions',
    service: 'AWS Lambda',
    type: 'yes-no',
    question: 'Can Lambda functions run for more than 15 minutes?',
    correctAnswer: false,
    explanation: 'Lambda has a maximum execution timeout of 15 minutes (900 seconds).',
    keyPoints: [
      'Maximum timeout: 15 minutes',
      'Use Step Functions for longer workflows',
      'Consider ECS/Fargate for long-running tasks'
    ],
    difficulty: 'basic'
  },
  {
    id: 'new-005',
    domain: 'new-solutions',
    service: 'Amazon VPC',
    type: 'multiple-choice',
    question: 'What is the maximum number of VPCs per region by default?',
    options: ['5', '10', '20', '100'],
    correctAnswer: '5',
    explanation: 'The default limit is 5 VPCs per region, but this can be increased by requesting a limit increase.',
    keyPoints: [
      'Default limit: 5 per region',
      'Can be increased via support request',
      'Soft limit, not hard limit'
    ],
    difficulty: 'basic'
  },

  // Migration Planning
  {
    id: 'mig-001',
    domain: 'migration-planning',
    service: 'AWS Database Migration Service',
    type: 'yes-no',
    question: 'Can DMS perform schema conversion during migration?',
    correctAnswer: false,
    explanation: 'DMS migrates data but does not convert schemas. Use AWS Schema Conversion Tool (SCT) for schema conversion.',
    keyPoints: [
      'DMS handles data migration only',
      'SCT handles schema conversion',
      'Often used together for complete migration'
    ],
    difficulty: 'intermediate'
  },
  {
    id: 'mig-002',
    domain: 'migration-planning',
    service: 'AWS DataSync',
    type: 'multiple-choice',
    question: 'Which protocol does DataSync NOT support for data transfer?',
    options: ['NFS', 'SMB', 'FTP', 'S3 API'],
    correctAnswer: 'FTP',
    explanation: 'DataSync supports NFS, SMB, and S3 API, but not FTP protocol.',
    keyPoints: [
      'Supports NFS and SMB file systems',
      'Works with S3, EFS, FSx',
      'One-time or scheduled transfers'
    ],
    difficulty: 'intermediate'
  },
  {
    id: 'mig-003',
    domain: 'migration-planning',
    service: 'AWS Snow Family',
    type: 'multiple-choice',
    question: 'Which Snow device can store up to 100 PB of data?',
    options: ['Snowball Edge', 'Snowmobile', 'Snowcone', 'Snowball'],
    correctAnswer: 'Snowmobile',
    explanation: 'Snowmobile is a truck that can transfer up to 100 PB of data for massive migrations.',
    keyPoints: [
      'Snowmobile: up to 100 PB',
      'Snowball Edge: up to 80 TB',
      'Snowcone: up to 8 TB'
    ],
    difficulty: 'basic'
  },

  // Cost Control
  {
    id: 'cost-001',
    domain: 'cost-control',
    service: 'AWS Cost Explorer',
    type: 'yes-no',
    question: 'Can Cost Explorer show cost forecasts for up to 12 months?',
    correctAnswer: true,
    explanation: 'Cost Explorer can forecast costs for up to 12 months based on historical usage patterns.',
    keyPoints: [
      'Forecasts up to 12 months',
      'Based on historical data',
      'Helps with budget planning'
    ],
    difficulty: 'basic'
  },
  {
    id: 'cost-002',
    domain: 'cost-control',
    service: 'Reserved Instances',
    type: 'multiple-choice',
    question: 'Which RI payment option provides the highest discount?',
    options: ['No Upfront', 'Partial Upfront', 'All Upfront', 'On-Demand'],
    correctAnswer: 'All Upfront',
    explanation: 'All Upfront payment provides the highest discount as you pay the entire RI cost upfront.',
    keyPoints: [
      'All Upfront: highest discount',
      'Partial Upfront: moderate discount',
      'No Upfront: lowest discount'
    ],
    difficulty: 'basic'
  },
  {
    id: 'cost-003',
    domain: 'cost-control',
    service: 'AWS Savings Plans',
    type: 'yes-no',
    question: 'Do Savings Plans apply to Lambda usage?',
    correctAnswer: true,
    explanation: 'Compute Savings Plans apply to EC2, Fargate, and Lambda usage, providing flexibility across compute services.',
    keyPoints: [
      'Compute Savings Plans cover Lambda',
      'Also covers EC2 and Fargate',
      'More flexible than RIs'
    ],
    difficulty: 'intermediate'
  },

  // Continuous Improvement
  {
    id: 'imp-001',
    domain: 'continuous-improvement',
    service: 'Amazon CloudWatch',
    type: 'multiple-choice',
    question: 'What is the default metric retention period for CloudWatch?',
    options: ['1 day', '15 days', '15 months', '5 years'],
    correctAnswer: '15 months',
    explanation: 'CloudWatch retains metrics for 15 months by default, with different resolutions over time.',
    keyPoints: [
      'Default retention: 15 months',
      'High resolution data kept shorter',
      'Can export for longer retention'
    ],
    difficulty: 'intermediate'
  },
  {
    id: 'imp-002',
    domain: 'continuous-improvement',
    service: 'AWS X-Ray',
    type: 'yes-no',
    question: 'Does X-Ray require code changes to trace Lambda functions?',
    correctAnswer: false,
    explanation: 'X-Ray can trace Lambda functions without code changes by enabling tracing in the Lambda configuration.',
    keyPoints: [
      'No code changes needed for Lambda',
      'Enable in Lambda configuration',
      'Automatic service map generation'
    ],
    difficulty: 'intermediate'
  },
  {
    id: 'imp-003',
    domain: 'continuous-improvement',
    service: 'AWS Config',
    type: 'multiple-choice',
    question: 'What does AWS Config primarily track?',
    options: [
      'Application performance',
      'Resource configurations',
      'Network traffic',
      'User activities'
    ],
    correctAnswer: 'Resource configurations',
    explanation: 'AWS Config tracks resource configurations and changes over time for compliance and auditing.',
    keyPoints: [
      'Tracks configuration changes',
      'Compliance monitoring',
      'Configuration history'
    ],
    difficulty: 'basic'
  },
  {
    id: 'imp-004',
    domain: 'continuous-improvement',
    service: 'AWS Systems Manager',
    type: 'yes-no',
    question: 'Can Systems Manager Patch Manager automatically patch EC2 instances?',
    correctAnswer: true,
    explanation: 'Patch Manager can automatically install patches on EC2 instances based on defined maintenance windows.',
    keyPoints: [
      'Automated patch management',
      'Maintenance windows control timing',
      'Supports multiple OS types'
    ],
    difficulty: 'intermediate'
  },

  // Advanced Architecture Concepts
  {
    id: 'arch-001',
    domain: 'new-solutions',
    service: 'AWS Well-Architected',
    type: 'multiple-choice',
    question: 'How many pillars are in the AWS Well-Architected Framework?',
    options: ['4', '5', '6', '7'],
    correctAnswer: '6',
    explanation: 'The six pillars are: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability.',
    keyPoints: [
      'Operational Excellence',
      'Security, Reliability',
      'Performance, Cost, Sustainability'
    ],
    difficulty: 'basic'
  },
  {
    id: 'arch-002',
    domain: 'continuous-improvement',
    service: 'Auto Scaling',
    type: 'yes-no',
    question: 'Can Auto Scaling scale based on custom CloudWatch metrics?',
    correctAnswer: true,
    explanation: 'Auto Scaling can use custom CloudWatch metrics for scaling decisions, not just built-in metrics.',
    keyPoints: [
      'Supports custom metrics',
      'More flexible scaling policies',
      'Application-specific scaling'
    ],
    difficulty: 'intermediate'
  },
  {
    id: 'arch-003',
    domain: 'new-solutions',
    service: 'Amazon API Gateway',
    type: 'multiple-choice',
    question: 'Which API Gateway type provides the lowest latency?',
    options: ['REST API', 'HTTP API', 'WebSocket API', 'GraphQL API'],
    correctAnswer: 'HTTP API',
    explanation: 'HTTP APIs are optimized for serverless workloads and provide lower latency than REST APIs.',
    keyPoints: [
      'HTTP API: lowest latency',
      'Optimized for serverless',
      'Lower cost than REST API'
    ],
    difficulty: 'advanced'
  }
];

export const getFlashcardsByDomain = (domain: ExamDomain): FlashcardQuestion[] => {
  return AWS_FLASHCARDS.filter(card => card.domain === domain);
};

export const getFlashcardsByDifficulty = (difficulty: 'basic' | 'intermediate' | 'advanced'): FlashcardQuestion[] => {
  return AWS_FLASHCARDS.filter(card => card.difficulty === difficulty);
};

export const getRandomFlashcards = (count: number): FlashcardQuestion[] => {
  const shuffled = [...AWS_FLASHCARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
